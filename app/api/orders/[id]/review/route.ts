import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const { id } = await params

  const review = await prisma.review.findUnique({
    where: { orderId: id },
  })

  if (!review) {
    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.json(review)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const { id } = await params
  const { rating, comment } = await req.json()

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating harus antara 1-5' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: { id, userId: user!.id, status: 'DONE' },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order tidak ditemukan atau belum selesai' }, { status: 404 })
  }

  const existing = await prisma.review.findUnique({ where: { orderId: id } })
  if (existing) {
    return NextResponse.json({ error: 'Sudah pernah memberikan review' }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: {
      orderId: id,
      userId: user!.id,
      rating,
      comment: comment ?? null,
    },
  })

  return NextResponse.json(review, { status: 201 })
}