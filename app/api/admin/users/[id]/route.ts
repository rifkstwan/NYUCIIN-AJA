import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { name, email, phone, address } = await req.json()

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(name    && { name }),
      ...(email   && { email }),
      ...(phone   !== undefined && { phone }),
      ...(address !== undefined && { address }),
    },
    select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
  })

  return NextResponse.json(user)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  await prisma.user.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}