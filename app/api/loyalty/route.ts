import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const points = await prisma.loyaltyPoint.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: 'desc' },
  })

  const total = points.reduce((sum, p) => sum + p.points, 0)

  return NextResponse.json({ points, total })
}