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
    const [totalOrders, activeOrders, completedOrders, cancelledOrders, totalUsers, revenueData] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({
          where: { status: { in: ['BOOKED', 'PICKUP', 'WASHING', 'DRYING', 'DELIVERY'] } },
        }),
        prisma.order.count({ where: { status: 'DONE' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.order.aggregate({
          where: { status: 'DONE' },
          _sum: { totalPrice: true },
        }),
      ])

    return NextResponse.json({
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalUsers,
      totalRevenue: revenueData._sum.totalPrice ?? 0,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}