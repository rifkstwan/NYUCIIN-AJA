import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'orders' // orders | revenue

  if (type === 'orders') {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user:     { select: { name: true, email: true, phone: true } },
        shoeType: { select: { name: true } },
        payment:  { select: { status: true, paymentMethod: true, paidAt: true } },
      },
    })

    const header = ['No Order', 'Pelanggan', 'Email', 'Telepon', 'Layanan', 'Qty', 'Total', 'Status', 'Pembayaran', 'Tanggal'].join(',')
    const rows   = orders.map(o => [
      o.orderNumber,
      `"${o.user.name}"`,
      o.user.email,
      o.user.phone ?? '-',
      `"${o.shoeType.name}"`,
      o.quantity,
      o.totalPrice,
      o.status,
      o.payment?.status ?? '-',
      new Date(o.createdAt).toLocaleDateString('id-ID'),
    ].join(','))

    const csv = [header, ...rows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-${Date.now()}.csv"`,
      },
    })
  }

  if (type === 'revenue') {
    const payments = await prisma.payment.findMany({
      where:   { status: 'PAID' },
      orderBy: { paidAt: 'desc' },
      include: { order: { include: { user: { select: { name: true } }, shoeType: { select: { name: true } } } } },
    })

    const header = ['No Order', 'Pelanggan', 'Layanan', 'Metode', 'Nominal', 'Tanggal Bayar'].join(',')
    const rows   = payments.map(p => [
      p.order.orderNumber,
      `"${p.order.user.name}"`,
      `"${p.order.shoeType.name}"`,
      p.paymentMethod ?? '-',
      p.amount,
      p.paidAt ? new Date(p.paidAt).toLocaleDateString('id-ID') : '-',
    ].join(','))

    const csv = [header, ...rows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="revenue-${Date.now()}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: 'type tidak valid' }, { status: 400 })
}