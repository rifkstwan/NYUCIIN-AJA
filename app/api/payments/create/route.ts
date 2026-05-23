import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-server'
import midtransClient from 'midtrans-client'

const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await req.json()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, user: true, shoeType: true },
  })

  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Reuse snap token jika belum expired
  if (order.payment?.snapToken && order.payment.status === 'PENDING') {
    return NextResponse.json({ snapToken: order.payment.snapToken })
  }

  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: order.totalPrice,
    },
    customer_details: {
      first_name: order.user.name,
      email: order.user.email,
      phone: order.user.phone ?? '',
    },
    item_details: [{
      id: order.shoeType.id,
      price: order.shoeType.basePrice,
      quantity: order.quantity,
      name: order.shoeType.name,
    }],
  }

  const transaction = await snap.createTransaction(parameter)

  // Upsert payment record + simpan transactionId
  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {
      snapToken: transaction.token,
      status: 'PENDING',
      transactionId: order.id, // ✅ fix
    },
    create: {
      orderId: order.id,
      snapToken: transaction.token,
      amount: order.totalPrice,
      status: 'PENDING',
      transactionId: order.id, // ✅ fix
    },
  })

  return NextResponse.json({ snapToken: transaction.token })
}