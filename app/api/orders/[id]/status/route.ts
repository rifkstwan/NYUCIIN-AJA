import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { getIO } from '@/lib/socket'
import { sendStatusEmail, sendWhatsApp } from '@/lib/notification'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['BOOKED', 'PICKUP', 'WASHING', 'DRYING', 'DELIVERY', 'DONE', 'CANCELLED']),
  note: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = requireAdmin(req)
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = statusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Status tidak valid' },
        { status: 400 }
      )
    }

    const { status, note } = parsed.data

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'DONE' ? new Date() : undefined,
      },
      include: { shoeType: true, user: true },
    })

    await prisma.orderTracking.create({
      data: {
        orderId: id,
        status,
        note: note ?? `Status diubah ke ${status}`,
        updatedBy: user!.id,
      },
    })

    await Promise.allSettled([
      sendStatusEmail({
        to: order.user.email,
        name: order.user.name,
        orderNumber: order.orderNumber,
        status,
        note,
      }),
      sendWhatsApp({
        phone: order.user.phone ?? '',
        orderNumber: order.orderNumber,
        status,
        note,
      }),
    ])

    if (status === 'DONE') {
      const payment = await prisma.payment.findUnique({
        where: { orderId: id },
      })
      if (payment?.status === 'PAID') {
        const points = Math.floor(order.totalPrice / 1000)
        await prisma.loyaltyPoint.upsert({
          where: { orderId: id },
          create: {
            userId: order.userId,
            orderId: id,
            points,
            description: `Order ${order.orderNumber} selesai`,
          },
          update: {},
        })
      }
    }

    const io = getIO()
    if (io) {
      const payload = {
        orderId: id,
        orderNumber: order.orderNumber,
        status,
        note: note ?? `Status diubah ke ${status}`,
        updatedAt: new Date().toISOString(),
      }
      io.to(`order-${id}`).emit('order-status-updated', payload)
      io.to(`user-${order.userId}`).emit('order-status-updated', payload)
      console.log(`Emitted order-status-updated for order ${id}`)
    }

    return NextResponse.json({
      message: 'Status berhasil diupdate',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}