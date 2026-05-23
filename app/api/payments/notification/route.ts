// app/api/payment/notification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Verifikasi signature Midtrans
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body
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

  await prisma.payment.update({
    where: { orderId: order_id },
    data: {
      status: paymentStatus,
      transactionId: body.transaction_id,
      paymentMethod: body.payment_type,
      paidAt: paymentStatus === 'PAID' ? new Date() : null,
      midtransResponse: body,
    },
  })

  return NextResponse.json({ ok: true })
}