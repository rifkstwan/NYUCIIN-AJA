'use client'
import Link from 'next/link'

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

const statusColor: Record<string, string> = {
  BOOKED:    'bg-blue-100 text-blue-700',
  PICKUP:    'bg-purple-100 text-purple-700',
  WASHING:   'bg-orange-100 text-orange-700',
  DRYING:    'bg-yellow-100 text-yellow-700',
  DELIVERY:  'bg-cyan-100 text-cyan-700',
  DONE:      'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const statusLabel: Record<string, string> = {
  BOOKED:    'Diterima',
  PICKUP:    'Pickup',
  WASHING:   'Dicuci',
  DRYING:    'Dikeringkan',
  DELIVERY:  'Dikirim',
  DONE:      'Selesai',
  CANCELLED: 'Dibatalkan',
}

export default function AdminOrderTable({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {['No. Order', 'Pelanggan', 'Layanan', 'Total', 'Payment', 'Status', 'Tanggal'].map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 border-b border-gray-100">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center text-gray-400 text-sm">
                Belum ada order
              </td>
            </tr>
          ) : orders.map(o => (
            <tr key={o.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-4">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="text-sm font-semibold text-primary-600 hover:underline"
                >
                  {o.orderNumber}
                </Link>
              </td>
              <td className="px-5 py-4">
                <div className="text-sm font-medium text-gray-900">{o.user.name}</div>
                <div className="text-xs text-gray-400">{o.user.email}</div>
              </td>
              <td className="px-5 py-4 text-sm text-gray-600">
                {o.shoeType.name} · {o.quantity} pasang
              </td>
              <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                Rp {o.totalPrice.toLocaleString('id-ID')}
              </td>
              <td className="px-5 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  o.payment?.status === 'PAID'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {o.payment?.status === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[o.status] ?? o.status}
                </span>
              </td>
              <td className="px-5 py-4 text-xs text-gray-400">
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