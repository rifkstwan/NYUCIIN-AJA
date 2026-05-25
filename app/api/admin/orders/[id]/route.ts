import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = requireAuth(req)
  if (error) return error
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        shoeType: { select: { name: true, basePrice: true } },
        payment: true,
        tracking: true,
      },
    })

    if (!order) {
      return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (err: any) {
    console.error('Admin order detail error:', err?.message ?? err)
    return NextResponse.json({ message: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}

// ← TAMBAH INI
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = requireAuth(req)
  if (error) return error
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const { status } = await req.json()

    const validStatuses = ['BOOKED', 'PICKUP', 'WASHING', 'DRYING', 'DELIVERY', 'DONE', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Status tidak valid' }, { status: 400 })
    }

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          ...(status === 'DONE' && { completedAt: new Date() }),
        },
      })

      await tx.orderTracking.create({
        data: {
          orderId: id,
          status,
          updatedBy: 'Admin',
        },
      })

      return updated
    })

    return NextResponse.json(order)
  } catch (err: any) {
    console.error('Update status error:', err?.message ?? err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}