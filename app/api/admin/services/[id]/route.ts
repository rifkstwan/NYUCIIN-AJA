import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { name, basePrice, description, badge, featured, features, isActive } = await req.json()

  const service = await prisma.shoeType.update({
    where: { id: params.id },
    data: {
      ...(name        !== undefined && { name }),
      ...(basePrice   !== undefined && { basePrice: Number(basePrice) }),
      ...(description !== undefined && { description }),
      ...(badge       !== undefined && { badge }),
      ...(featured    !== undefined && { featured }),
      ...(features    !== undefined && { features }),
      ...(isActive    !== undefined && { isActive }),
    },
  })
  return NextResponse.json(service)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  await prisma.shoeType.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}