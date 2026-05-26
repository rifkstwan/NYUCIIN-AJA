import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        rating: { gte: 4 },
        isVisible: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        user: { select: { name: true } },
        order: { include: { shoeType: { select: { name: true } } } },
      },
    })

    const data = reviews.map((r) => ({
      id: r.id,
      name: r.user.name ?? 'Pelanggan',
      initials: (r.user.name ?? 'P').slice(0, 2).toUpperCase(),
      rating: r.rating,
      comment: r.comment ?? '',
      serviceName: r.order.shoeType?.name ?? 'Cuci Sepatu',
    }))

    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json([], { status: 200 })
  }
}