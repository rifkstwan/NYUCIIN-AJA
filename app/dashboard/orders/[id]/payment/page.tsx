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
  const [snapReady, setSnapReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Cek jika script sudah ada (avoid duplicate load)
    const existing = document.querySelector('script[src*="snap.js"]')
    if (existing) {
      setSnapReady(true)
    } else {
      const script = document.createElement('script')
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
      script.onload = () => setSnapReady(true)
      script.onerror = () => setError('Gagal memuat Midtrans. Periksa koneksi internet kamu.')
      document.head.appendChild(script)
    }

    fetch(`/api/orders/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Order tidak ditemukan')
        return r.json()
      })
      .then(setOrder)
      .catch(() => setError('Gagal memuat data order.'))
  }, [id])

  async function handlePay() {
    if (!snapReady) {
      alert('Midtrans belum siap, tunggu sebentar.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal membuat transaksi')
      }

      const { snapToken } = await res.json()

      window.snap.pay(snapToken, {
        onSuccess: () => router.push(`/dashboard/orders/${id}?paid=1`),
        onPending: () => router.push(`/dashboard/orders/${id}?status=pending`),
        onError: (result: any) => {
          console.error('Midtrans error:', result)
          setError('Pembayaran gagal. Silakan coba lagi.')
          setLoading(false)
        },
        onClose: () => setLoading(false),
      })
    } catch (err: any) {
      setError(err.message || 'Gagal memulai pembayaran')
      setLoading(false)
    }
  }

  // Error state tanpa order
  if (error && !order) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => router.back()} className="text-blue-600 underline">
          Kembali
        </button>
      </div>
    )
  }

  // Loading order
  if (!order) {
    return (
      <div className="max-w-md mx-auto p-6 flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-gray-500">Memuat data order...</p>
      </div>
    )
  }

  // Guard: jika sudah bayar, jangan tampilkan form
  if (order.payment?.status === 'PAID') {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Pembayaran Lunas</h1>
        <p className="text-gray-500 mb-6">Order ini sudah dibayar.</p>
        <button
          onClick={() => router.push(`/dashboard/orders/${id}`)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
        >
          Lihat Detail Order
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1 text-sm"
      >
        ← Kembali
      </button>

      <h1 className="text-2xl font-bold mb-4">Pembayaran</h1>

      <div className="border rounded-lg p-4 mb-6 space-y-2 bg-gray-50">
        <p>
          <span className="text-gray-500">No. Order:</span>{' '}
          <strong>{order.orderNumber}</strong>
        </p>
        <p>
          <span className="text-gray-500">Layanan:</span>{' '}
          {order.shoeType?.name}
        </p>
        <p>
          <span className="text-gray-500">Qty:</span>{' '}
          {order.quantity} pasang
        </p>
        <hr className="my-2" />
        <p className="text-lg font-bold text-blue-600">
          Total: Rp {order.totalPrice?.toLocaleString('id-ID')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading || !snapReady}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-green-700"
      >
        {loading
          ? '⏳ Memproses...'
          : !snapReady
          ? '⌛ Memuat Midtrans...'
          : '💳 Bayar Sekarang'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Pembayaran aman diproses oleh Midtrans
      </p>
    </div>
  )
}