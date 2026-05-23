'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Clock, Package } from 'lucide-react'
import PayButton from '@/components/PayButton'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalPrice: number
  quantity: number
  surcharge: number
  notes: string | null
  pickupAddress: string | null
  createdAt: string
  shoeType: { name: string; basePrice: number }
  payment: { status: string; paymentMethod: string | null; paidAt: string | null } | null
  tracking: { status: string; note: string | null; createdAt: string }[]
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }

    const res = await fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) setOrder(await res.json())
    setLoading(false)
  }, [id, router])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  if (!order) return (
    <div className="text-center py-16 text-muted-foreground">Order tidak ditemukan</div>
  )

  const isPaid = order.payment?.status === 'PAID'
  const isPending = !order.payment || order.payment.status === 'PENDING'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push('/orders')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
      </Button>

      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
            <Badge variant="outline">{order.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {new Date(order.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Layanan</span>
            <span className="font-medium">{order.shoeType.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Jumlah</span>
            <span>{order.quantity} pasang</span>
          </div>
          {order.surcharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Biaya tambahan</span>
              <span>Rp{order.surcharge.toLocaleString('id-ID')}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>Rp{order.totalPrice.toLocaleString('id-ID')}</span>
          </div>
          {order.notes && (
            <p className="text-sm text-muted-foreground">📝 {order.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {isPaid ? (
              <><CheckCircle2 className="w-5 h-5 text-green-500" /> Pembayaran Berhasil</>
            ) : (
              <><Clock className="w-5 h-5 text-orange-400" /> Status Pembayaran</>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isPaid ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode</span>
                <span className="font-medium capitalize">
                  {order.payment?.paymentMethod?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibayar</span>
                <span>
                  {order.payment?.paidAt
                    ? new Date(order.payment.paidAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })
                    : '-'}
                </span>
              </div>
            </div>
          ) : isPending ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Selesaikan pembayaran untuk memproses pesanan kamu.
              </p>
              <PayButton orderId={order.id} onSuccess={fetchOrder} />
            </div>
          ) : (
            <p className="text-sm text-red-500">Pembayaran gagal. Silakan coba lagi.</p>
          )}
        </CardContent>
      </Card>

      {/* Tracking */}
      {order.tracking.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5" /> Tracking Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.tracking.map((track, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-0.5 ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    {i < order.tracking.length - 1 && (
                      <div className="w-0.5 h-full bg-muted-foreground/20 my-1" />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="font-medium">{track.status}</p>
                    {track.note && <p className="text-muted-foreground">{track.note}</p>}
                    <p className="text-xs text-muted-foreground">
                      {new Date(track.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
