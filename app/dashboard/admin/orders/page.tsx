'use client'
import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth-client'

type Stats = {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  cancelledOrders: number
  totalUsers: number
  totalRevenue: number
}

type RevenuePoint = { month: string; revenue: number; orders: number }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [loading, setLoading] = useState(true)

  const headers = { Authorization: `Bearer ${getToken()}` }

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats', { headers }).then((r) => r.json()),
      fetch('/api/admin/revenue', { headers }).then((r) => r.json()),
    ]).then(([s, r]) => {
      setStats(s)
      setRevenue(r.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1)

  const cards = stats ? [
    { label: 'Total Order', value: stats.totalOrders, color: '#3b82f6' },
    { label: 'Order Aktif', value: stats.activeOrders, color: '#f59e0b' },
    { label: 'Selesai', value: stats.completedOrders, color: '#16a34a' },
    { label: 'Total Pelanggan', value: stats.totalUsers, color: '#8b5cf6' },
  ] : []

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
        Dashboard Admin
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
        Ringkasan performa bisnis
      </p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Memuat data...</p>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {cards.map((c) => (
              <div key={c.label} style={{
                background: '#fff', borderRadius: 12,
                border: '1px solid #e2e8f0', padding: '20px 22px',
              }}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{c.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>

          {/* Revenue Card */}
          <div style={{
            background: '#fff', borderRadius: 12,
            border: '1px solid #e2e8f0', padding: '20px 22px', marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Total Revenue</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#16a34a' }}>
                Rp {stats!.totalRevenue.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div style={{
            background: '#fff', borderRadius: 12,
            border: '1px solid #e2e8f0', padding: '24px',
          }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', marginBottom: 20 }}>
              Grafik Pendapatan (7 Bulan Terakhir)
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
              {revenue.map((r) => (
                <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                    {r.revenue > 0 ? `Rp ${(r.revenue / 1000).toFixed(0)}k` : ''}
                  </p>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: r.revenue > 0 ? '#16a34a' : '#e2e8f0',
                    height: `${Math.max((r.revenue / maxRevenue) * 120, r.revenue > 0 ? 8 : 4)}px`,
                    transition: 'height 0.3s',
                  }} />
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{r.month}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}