import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: {
      id: true, name: true, email: true, phone: true,
      address: true, createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}