import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

// GET — ambil review order
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const review = await prisma.review.findUnique({
    where: { orderId: params.id },
  })

  return NextResponse.json(review)
}

// POST — buat review baru
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const { rating, comment } = await req.json()

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating harus antara 1-5' }, { status: 400 })
  }

  // Pastikan order milik user ini dan sudah DONE
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user!.id, status: 'DONE' },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order tidak ditemukan atau belum selesai' }, { status: 404 })
  }

  // Cek sudah pernah review belum
  const existing = await prisma.review.findUnique({ where: { orderId: params.id } })
  if (existing) {
    return NextResponse.json({ error: 'Sudah pernah memberikan review' }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: {
      orderId: params.id,
      userId: user!.id,
      rating,
      comment: comment ?? null,
    },
  })

  return NextResponse.json(review, { status: 201 })
}