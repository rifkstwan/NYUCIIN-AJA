import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const promos = await prisma.promo.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ promos })
}