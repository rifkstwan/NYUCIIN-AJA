import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true } },
        order: { select: { id: true } },
      },
    })

    // Mapping ke shape yang dibutuhkan komponen
    const mapped = reviews.map(r => ({
      id:       r.id,
      name:     r.user?.name ?? 'Pelanggan',
      rating:   r.rating,
      text:     r.comment,
      location: (r as any).location ?? 'Semarang',
      isActive: r.isVisible,
    }))

    return NextResponse.json({ testimonials: mapped })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}