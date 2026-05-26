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
    // Revenue per bulan (6 bulan terakhir)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const [orders, shoeTypes, stats] = await Promise.all([
      // Semua order DONE dalam 6 bulan terakhir
      prisma.order.findMany({
        where: { status: 'DONE', createdAt: { gte: sixMonthsAgo } },
        select: { totalPrice: true, createdAt: true, shoeTypeId: true },
      }),
      // Data layanan
      prisma.shoeType.findMany({
        select: { id: true, name: true },
      }),
      // Stats global
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    // Hitung revenue per bulan
    const monthlyMap: Record<string, number> = {}
    orders.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      monthlyMap[key] = (monthlyMap[key] ?? 0) + o.totalPrice
    })

    // Isi bulan yang kosong
    const monthly = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      monthly.push({ month: key, revenue: monthlyMap[key] ?? 0 })
    }

    // Revenue per layanan
    const shoeMap: Record<string, { name: string; revenue: number; count: number }> = {}
    orders.forEach(o => {
      const shoe = shoeTypes.find(s => s.id === o.shoeTypeId)
      const name = shoe?.name ?? 'Lainnya'
      if (!shoeMap[name]) shoeMap[name] = { name, revenue: 0, count: 0 }
      shoeMap[name].revenue += o.totalPrice
      shoeMap[name].count++
    })
    const byService = Object.values(shoeMap).sort((a, b) => b.revenue - a.revenue)

    // Status breakdown
    const statusMap: Record<string, number> = {}
    stats.forEach(s => { statusMap[s.status] = s._count.status })

    return NextResponse.json({ monthly, byService, statusMap })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}