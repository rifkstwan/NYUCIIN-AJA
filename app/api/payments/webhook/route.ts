import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = body

    // Verifikasi signature dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (signature_key !== expectedSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
    }

    // Midtrans mengirim order_id = order.id kita (disimpan sebagai transactionId)
    // Cari dengan double fallback: transactionId → orderId
    let payment = await prisma.payment.findFirst({
      where: { transactionId: order_id },
      include: { order: true },
    })

    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: { orderId: order_id },
        include: { order: true },
      })
    }

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }

    const order = payment.order

    // Tentukan status payment
    let paymentStatus: 'PAID' | 'PENDING' | 'FAILED' = 'PENDING'

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || fraud_status === undefined) {
        paymentStatus = 'PAID'
      }
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      paymentStatus = 'FAILED'
    }

    // Update payment di DB
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        transactionId: transaction_id ?? null,
        paymentMethod: payment_type,
        paidAt: paymentStatus === 'PAID' ? new Date() : null,
        midtransResponse: body,
      },
    })

    // Kalau lunas, tambah loyalty points (upsert agar tidak dobel)
    if (paymentStatus === 'PAID') {
      const points = Math.floor(order.totalPrice / 1000)
      await prisma.loyaltyPoint.upsert({
        where: { orderId: order.id },
        create: {
          userId: order.userId,
          orderId: order.id,
          points,
          description: `Order ${order.orderNumber}`,
        },
        update: {},
      })
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
