// app/admin/page.tsx
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getUserFromCookies } from '@/lib/auth-server'
import AdminOrderTable from '@/components/admin/AdminOrderTable'

export default async function AdminPage() {
  const user = await getUserFromCookies()
  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const orders = await prisma.order.findMany({
    include: { user: true, shoeType: true, payment: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel Admin — Semua Order</h1>
      <AdminOrderTable orders={orders} />
    </div>
  )
}