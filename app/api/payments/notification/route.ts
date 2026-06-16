import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Midtrans test ping - tidak ada order_id real
  if (!body.order_id || !body.signature_key) {
    return NextResponse.json({ ok: true })
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status, transaction_id } = body

  // Verifikasi signature Midtrans
  const serverKey = process.env.MIDTRANS_SERVER_KEY!
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex')

  if (signature_key !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  // Tentukan status payment
  let paymentStatus: 'PENDING' | 'PAID' | 'FAILED' = 'PENDING'
  if (transaction_status === 'capture' && fraud_status === 'accept') paymentStatus = 'PAID'
  else if (transaction_status === 'settlement') paymentStatus = 'PAID'
  else if (['cancel', 'deny', 'expire'].includes(transaction_status)) paymentStatus = 'FAILED'

  // Cari payment: coba transactionId dulu, lalu fallback ke orderId
  // (transactionId disimpan = order.id saat create, dan Midtrans mengirim order_id = order.id)
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
    console.error('Payment tidak ditemukan untuk order_id:', order_id)
    return NextResponse.json({ error: 'Payment tidak ditemukan' }, { status: 404 })
  }

  // Update payment
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: paymentStatus,
      transactionId: transaction_id ?? order_id,
      paymentMethod: body.payment_type,
      paidAt: paymentStatus === 'PAID' ? new Date() : null,
      midtransResponse: body,
    },
  })

  // Jika PAID → update order jadi PICKUP + tambah tracking
  if (paymentStatus === 'PAID' && payment.order.status === 'BOOKED') {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'PICKUP' },
    })

    await prisma.orderTracking.create({
      data: {
        orderId: payment.orderId,
        status: 'PICKUP',
        note: 'Pembayaran berhasil, pesanan menunggu pickup',
      },
    })
  }

  return NextResponse.json({ ok: true })
}