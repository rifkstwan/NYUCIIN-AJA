// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error, user: authUser } = requireAuth(req)
  if (error) return error

  const user = await prisma.user.findUnique({
    where: { id: authUser!.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      role: true,
      createdAt: true,
      loyaltyPoints: {
        select: { points: true },
      },
    },
  })

  // Hitung total loyalty points
  const totalPoints = user?.loyaltyPoints.reduce((sum, lp) => sum + lp.points, 0) ?? 0

  return NextResponse.json({ ...user, totalPoints })
}