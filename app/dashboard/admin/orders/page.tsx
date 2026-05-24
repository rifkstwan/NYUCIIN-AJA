'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_LABELS: Record<string, string> = {
  BOOKED: 'Dipesan', PICKUP: 'Pickup', WASHING: 'Dicuci',
  DRYING: 'Pengeringan', DELIVERY: 'Pengiriman', DONE: 'Selesai', CANCELLED: 'Dibatalkan',
}
const STATUS_COLORS: Record<string, string> = {
  BOOKED: 'bg-yellow-100 text-yellow-700',
  PICKUP: 'bg-blue-100 text-blue-700',
  WASHING: 'bg-cyan-100 text-cyan-700',
  DRYING: 'bg-orange-100 text-orange-700',
  DELIVERY: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams({ page: String(page) })
    if (filterStatus) query.set('status', filterStatus)

    fetch(`/api/admin/orders?${query}`)
      .then(r => r.json())
      .then(data => {
        setOrders(data.orders)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      })
      .finally(() => setLoading(false))
  }, [page, filterStatus])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Kelola Order</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => { setFilterStatus(''); setPage(1) }}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${filterStatus === '' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}
        >
          Semua ({total})
        </button>
        {Object.entries(STATUS_LABELS).map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setFilterStatus(val); setPage(1) }}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${filterStatus === val ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabel */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">No. Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Layanan</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-gray-400 text-xs">{order.user.phone}</p>
                  </td>
                  <td className="px-4 py-3">{order.shoeType.name} ×{order.quantity}</td>
                  <td className="px-4 py-3 font-medium">Rp {order.totalPrice.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.payment?.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.payment?.status ?? 'BELUM'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/dashboard/admin/orders/${order.id}`)}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Kelola →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center text-gray-400 py-8">Tidak ada order.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40">←</button>
          <span className="px-3 py-1 text-sm text-gray-600">Hal {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  )
}