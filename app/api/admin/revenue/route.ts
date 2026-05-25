import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  // Ambil revenue 7 bulan terakhir
  const months = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (6 - i))
    return d
  })

  const data = await Promise.all(
    months.map(async (start) => {
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)

      const result = await prisma.order.aggregate({
        where: { status: 'DONE', createdAt: { gte: start, lt: end } },
        _sum: { totalPrice: true },
        _count: true,
      })

      return {
        month: start.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        revenue: result._sum.totalPrice ?? 0,
        orders: result._count,
      }
    })
  )

  return NextResponse.json({ data })
}