import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user!.id,
    },
    include: {
      shoeType: true,
      tracking: { orderBy: { createdAt: 'asc' } },
      payment: true,
      shoePhotos: true,
      review: true,
      pickupSchedule: true,
    },
  })

  if (!order) {
    return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json(order)
}