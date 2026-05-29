import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user:  { select: { name: true } },
      order: { include: { shoeType: { select: { name: true } } } },
    },
  })
  return NextResponse.json({ reviews })
}