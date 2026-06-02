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
    const { title, description, badge, isActive, startDate, endDate } = await req.json()
    const promo = await prisma.promo.update({
      where: { id },
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
  } catch (err) {
    console.error('PATCH promo error:', err)
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
    await prisma.promo.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE promo error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}