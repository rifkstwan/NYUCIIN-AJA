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
    const { name, email, phone, address } = await req.json()
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name    && { name }),
        ...(email   && { email }),
        ...(phone   !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch (err) {
    console.error('PATCH user error:', err)
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
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE user error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}