// app/dashboard/orders/[id]/payment/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

declare global {
  interface Window { snap: { pay: (token: string, options: object) => void } }
}

export default function PaymentPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    // Untuk sandbox: 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
    document.head.appendChild(script)

    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(setOrder)
  }, [id])

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch(`/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      })
      const { snapToken } = await res.json()

      window.snap.pay(snapToken, {
        onSuccess: () => router.push(`/dashboard/orders/${id}?paid=1`),
        onPending: () => router.push(`/dashboard/orders/${id}`),
        onError: () => alert('Pembayaran gagal'),
        onClose: () => setLoading(false),
      })
    } catch {
      alert('Gagal memulai pembayaran')
      setLoading(false)
    }
  }

  if (!order) return <div className="p-6">Memuat...</div>

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pembayaran</h1>
      <div className="border rounded-lg p-4 mb-6 space-y-2">
        <p><span className="text-gray-500">No. Order:</span> <strong>{order.orderNumber}</strong></p>
        <p><span className="text-gray-500">Layanan:</span> {order.shoeType?.name}</p>
        <p><span className="text-gray-500">Qty:</span> {order.quantity} pasang</p>
        <p className="text-lg font-bold text-blue-600">
          Total: Rp {order.totalPrice?.toLocaleString('id-ID')}
        </p>
      </div>
      <button
        onClick={handlePay} disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50"
      >
        {loading ? 'Memproses...' : '💳 Bayar Sekarang'}
      </button>
    </div>
  )
}