import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { id } = await params  // ✅ await params
  const { name, basePrice, description, badge, featured, features, isActive } = await req.json()

  const service = await prisma.shoeType.update({
    where: { id },
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
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { id } = await params  // ✅ await params
  await prisma.shoeType.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}