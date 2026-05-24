import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

// POST — upload foto (admin only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = requireAuth(req)
  if (error) return error
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { photoUrl, type } = await req.json()

  if (!photoUrl || !['before', 'after'].includes(type)) {
    return NextResponse.json({ error: 'photoUrl dan type (before/after) wajib diisi' }, { status: 400 })
  }

  const photo = await prisma.shoePhoto.create({
    data: { orderId: params.id, photoUrl, type },
  })

  return NextResponse.json(photo, { status: 201 })
}

// DELETE — hapus foto
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = requireAuth(req)
  if (error) return error
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { photoId } = await req.json()

  await prisma.shoePhoto.delete({ where: { id: photoId } })

  return NextResponse.json({ ok: true })
}