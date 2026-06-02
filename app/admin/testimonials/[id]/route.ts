import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  try {
    const { id } = await params
    const { isVisible } = await req.json()
    const review = await prisma.review.update({
      where: { id },
      data:  { isVisible },
    })
    return NextResponse.json(review)
  } catch (err) {
    console.error("PATCH review error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  try {
    const { id } = await params
    await prisma.review.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE review error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}