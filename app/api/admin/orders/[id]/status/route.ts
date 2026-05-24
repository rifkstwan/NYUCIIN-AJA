import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-server'
import { sendStatusEmail, sendWhatsApp } from '@/lib/notification'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { status, note } = await req.json()

  const validStatuses = ['BOOKED', 'PICKUP', 'WASHING', 'DRYING', 'DELIVERY', 'DONE', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  // ✅ Include user untuk ambil email & phone
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: true },
  })
  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'DONE' ? { completedAt: new Date() } : {}),
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: params.id,
        status,
        note: note ?? null,
        updatedBy: user.name,
      },
    }),
  ])

  // ✅ Kirim email notifikasi (non-blocking)
  sendStatusEmail({
    to: order.user.email,
    name: order.user.name,
    orderNumber: order.orderNumber,
    status,
    note,
  }).catch(console.error)

  // ✅ Kirim WhatsApp notifikasi (non-blocking)
  sendWhatsApp({
    phone: order.user.phone ?? '',
    orderNumber: order.orderNumber,
    status,
    note,
  }).catch(console.error)

  return NextResponse.json(updatedOrder)
}