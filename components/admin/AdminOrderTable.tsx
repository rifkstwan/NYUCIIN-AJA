'use client'
import { useState } from 'react'
import { getToken } from '@/lib/auth-client'

type Order = {
  id: string
  orderNumber: string
  status: string
  totalPrice: number
  quantity: number
  createdAt: string
  user: { name: string; email: string }
  shoeType: { name: string }
  payment: { status: string } | null
}

const statusOptions = ['BOOKED', 'PICKUP', 'WASHING', 'DRYING', 'DELIVERY', 'DONE', 'CANCELLED']

const statusColor: Record<string, string> = {
  BOOKED: '#3b82f6', PICKUP: '#f59e0b', WASHING: '#8b5cf6',
  DRYING: '#06b6d4', DELIVERY: '#f97316', DONE: '#16a34a', CANCELLED: '#ef4444',
}
const statusLabel: Record<string, string> = {
  BOOKED: 'Dipesan', PICKUP: 'Pickup', WASHING: 'Dicuci',
  DRYING: 'Dikeringkan', DELIVERY: 'Diantar', DONE: 'Selesai', CANCELLED: 'Dibatalkan',
}

export default function AdminOrderTable({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['No. Order', 'Pelanggan', 'Layanan', 'Total', 'Payment', 'Status', 'Tanggal'].map((h) => (
              <th key={h} style={{
                padding: '12px 16px', textAlign: 'left',
                fontSize: 12, fontWeight: 600, color: '#64748b',
                borderBottom: '1px solid #e2e8f0',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                Belum ada order
              </td>
            </tr>
          ) : orders.map((o, i) => (
            <tr key={o.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                {o.orderNumber}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{o.user.name}</p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>{o.user.email}</p>
              </td>
              <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                {o.shoeType.name} · {o.quantity} pasang
              </td>
              <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                Rp {o.totalPrice.toLocaleString('id-ID')}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                  background: o.payment?.status === 'PAID' ? '#dcfce7' : '#fef9c3',
                  color: o.payment?.status === 'PAID' ? '#16a34a' : '#a16207',
                }}>
                  {o.payment?.status ?? 'BELUM BAYAR'}
                </span>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <select
                  value={o.status}
                  disabled={updating === o.id}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  style={{
                    padding: '5px 8px', borderRadius: 8,
                    border: `1.5px solid ${statusColor[o.status]}`,
                    color: statusColor[o.status],
                    fontSize: 12, fontWeight: 600,
                    background: statusColor[o.status] + '15',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{statusLabel[s]}</option>
                  ))}
                </select>
              </td>
              <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>
                {new Date(o.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}