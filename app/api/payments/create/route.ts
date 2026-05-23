import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { snap } from '@/lib/midtrans'
import { requireAuth } from '@/lib/middleware'
import { z } from 'zod'

const schema = z.object({
  orderId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: 'Input tidak valid' }, { status: 400 })
    }

    const { orderId } = parsed.data

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user!.id },
      include: { shoeType: true },
    })

    if (!order) {
      return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
    }

    // Cek apakah payment sudah PAID
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    })
    if (existingPayment?.status === 'PAID') {
      return NextResponse.json({ message: 'Order sudah dibayar' }, { status: 400 })
    }

    const userData = await prisma.user.findUnique({
      where: { id: user!.id },
      select: { name: true, email: true, phone: true },
    })

    // Tambahkan timestamp agar order_id unik di Midtrans
    const midtransOrderId = `${order.orderNumber}-${Date.now()}`

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: order.totalPrice,
      },
      item_details: [
        {
          id: order.shoeTypeId,
          price: order.shoeType.basePrice,
          quantity: order.quantity,
          name: `Cuci ${order.shoeType.name}`,
        },
        ...(order.surcharge > 0
          ? [{ id: 'surcharge', price: order.surcharge, quantity: 1, name: 'Biaya Tambahan' }]
          : []),
      ],
      customer_details: {
        first_name: userData?.name ?? 'Customer',
        email: userData?.email ?? '',
        phone: userData?.phone ?? '',
      },
    }

    const transaction = await snap.createTransaction(parameter)

    // Simpan midtransOrderId agar webhook bisa lookup order
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        snapToken: transaction.token,
        amount: order.totalPrice,
        status: 'PENDING',
        transactionId: midtransOrderId,
      },
      update: {
        snapToken: transaction.token,
        status: 'PENDING',
        transactionId: midtransOrderId,
      },
    })

    return NextResponse.json({
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderNumber: order.orderNumber,
      amount: order.totalPrice,
    })
  } catch (err) {
    console.error('Midtrans error:', err)
    return NextResponse.json({ message: 'Gagal membuat transaksi' }, { status: 500 })
  }
}
