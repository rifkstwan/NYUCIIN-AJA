import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page  = parseInt(searchParams.get('page')  ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const skip  = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          order: {
            select: {
              id: true,
              orderNumber: true,
              shoeType: { select: { name: true } }, // ✅ tambah shoeType
            },
          },
        },
      }),
      prisma.review.count(),
    ])

    return NextResponse.json({
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}