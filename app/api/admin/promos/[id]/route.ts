import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { title, description, badge, isActive, startDate, endDate } = await req.json()

  const promo = await prisma.promo.update({
    where: { id: params.id },
    data: {
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(badge       !== undefined && { badge }),
      ...(isActive    !== undefined && { isActive }),
      ...(startDate   !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate     !== undefined && { endDate:   endDate   ? new Date(endDate)   : null }),
    },
  })
  return NextResponse.json(promo)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  await prisma.promo.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}