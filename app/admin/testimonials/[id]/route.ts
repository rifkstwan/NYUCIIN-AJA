import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { isVisible } = await req.json()
  const review = await prisma.review.update({
    where: { id: params.id },
    data:  { isVisible },
  })
  return NextResponse.json(review)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  await prisma.review.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}