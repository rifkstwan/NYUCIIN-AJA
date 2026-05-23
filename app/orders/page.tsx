'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ChevronRight, Plus } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalPrice: number
  createdAt: string
  shoeType: { name: string }
  payment: { status: string; paymentMethod: string | null } | null
}

const statusColor: Record<string, string> = {
  BOOKED: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PICKED_UP: 'bg-purple-100 text-purple-800',
  WASHING: 'bg-cyan-100 text-cyan-800',
  DONE: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const paymentStatusColor: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }

    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pesanan Saya</h1>
        <Button size="sm" onClick={() => router.push('/')}>
          <Plus className="w-4 h-4 mr-1" /> Order Baru
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-muted-foreground text-sm">{order.shoeType.name}</p>
                    <p className="font-medium">Rp{order.totalPrice.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                    {order.payment && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentStatusColor[order.payment.status] ?? ''}`}>
                        {order.payment.status}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
