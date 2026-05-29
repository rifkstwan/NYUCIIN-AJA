import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  return [headers, ...rows].map(row => row.map(escape).join(',')).join('\n')
}

export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'revenue' | 'orders'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const dateFilter = {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  }

  try {
    if (type === 'revenue') {
      const orders = await prisma.order.findMany({
        where: {
          status: 'DONE',
          ...(from || to ? { completedAt: dateFilter } : {}),
        },
        include: {
          user: { select: { name: true, email: true } },
          shoeType: { select: { name: true } },
        },
        orderBy: { completedAt: 'desc' },
      })

      const headers = ['Order Number', 'Customer', 'Email', 'Service', 'Qty', 'Total (Rp)', 'Completed At']
      const rows = orders.map(o => [
        o.orderNumber,
        o.user.name,
        o.user.email,
        o.shoeType.name,
        o.quantity,
        o.totalPrice,
        o.completedAt?.toISOString() ?? '',
      ])

      return new NextResponse(toCsv(headers, rows), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="revenue-export-${Date.now()}.csv"`,
        },
      })
    }

    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        where: from || to ? { createdAt: dateFilter } : {},
        include: {
          user: { select: { name: true, email: true } },
          shoeType: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const headers = ['Order Number', 'Customer', 'Email', 'Service', 'Qty', 'Status', 'Total (Rp)', 'Created At']
      const rows = orders.map(o => [
        o.orderNumber,
        o.user.name,
        o.user.email,
        o.shoeType.name,
        o.quantity,
        o.status,
        o.totalPrice,
        o.createdAt.toISOString(),
      ])

      return new NextResponse(toCsv(headers, rows), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="orders-export-${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json(
      { message: 'Invalid export type. Use ?type=revenue or ?type=orders' },
      { status: 400 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}