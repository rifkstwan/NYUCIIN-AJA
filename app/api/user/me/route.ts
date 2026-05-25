import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const data = await prisma.user.findUnique({
    where: { id: user!.id },
    select: { id: true, name: true, email: true, phone: true, address: true },
  })

  if (!data) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ user: data })
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: user!.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, phone: true, address: true },
    })

    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}