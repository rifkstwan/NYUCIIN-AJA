'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth-client'
import { ArrowLeft, CreditCard, Package, CheckCircle } from 'lucide-react'

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
    const token = getToken()
    if (!token) { router.push('/auth/login'); return }

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

    fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Order tidak ditemukan')
        return r.json()
      })
      .then(setOrder)
      .catch(() => setError('Gagal memuat data order.'))
  }, [id])

  async function handlePay() {
    if (!snapReady) { alert('Midtrans belum siap, tunggu sebentar.'); return }
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(`/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        onError: (result: any) => { setError('Pembayaran gagal. Silakan coba lagi.'); setLoading(false) },
        onClose: () => setLoading(false),
      })
    } catch (err: any) {
      setError(err.message || 'Gagal memulai pembayaran')
      setLoading(false)
    }
  }

  if (error && !order) return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <p style={{ color: '#ef4444', marginBottom: 16, fontWeight: 500 }}>{error}</p>
      <button onClick={() => router.back()} style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        ← Kembali
      </button>
    </div>
  )

  if (!order) return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: 14 }}>Memuat data order...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (order.payment?.status === 'PAID') return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: 24, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <CheckCircle style={{ width: 36, height: 36, color: '#16a34a' }} />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Pembayaran Lunas</h1>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Order ini sudah berhasil dibayar.</p>
      <button
        onClick={() => router.push(`/dashboard/orders/${id}`)}
        style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
      >
        Lihat Detail Order
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0 }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Kembali
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Konfirmasi Pembayaran</h1>

      {/* Card detail order */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#dcfce7', padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 18, height: 18, color: '#16a34a' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>No. Order</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{order.orderNumber}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Layanan</span>
            <span style={{ fontWeight: 500, color: '#0f172a' }}>{order.shoeType?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Jumlah</span>
            <span style={{ fontWeight: 500, color: '#0f172a' }}>{order.quantity} pasang</span>
          </div>
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Total Pembayaran</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>
              Rp {order.totalPrice?.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Tombol bayar */}
      <button
        onClick={handlePay}
        disabled={loading || !snapReady}
        style={{
          width: '100%', background: loading || !snapReady ? '#86efac' : '#16a34a',
          color: '#fff', border: 'none', borderRadius: 12,
          padding: '14px 0', fontSize: 15, fontWeight: 700,
          cursor: loading || !snapReady ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.15s',
        }}
      >
        <CreditCard style={{ width: 18, height: 18 }} />
        {loading ? 'Memproses...' : !snapReady ? 'Memuat...' : 'Bayar Sekarang'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#cbd5e1', marginTop: 12 }}>
        Pembayaran aman diproses oleh Midtrans
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}