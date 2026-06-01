'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import { getToken } from '@/lib/auth-client'

export default function ReviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/auth/login'); return }
    const headers = { Authorization: `Bearer ${token}` }
    fetch(`/api/orders/${id}`, { headers })
      .then(r => r.json())
      .then(d => setOrder(d.order ?? d))
    fetch(`/api/orders/${id}/review`, { headers })
      .then(async r => {
        if (!r.ok) return null
        const text = await r.text()
        if (!text) return null
        return JSON.parse(text)
      })
      .then(data => {
        if (data?.id) {
          setExistingReview(data)
          setRating(data.rating)
          setComment(data.comment ?? '')
        }
      })
      .catch(() => {})
  }, [id])

  async function handleSubmit() {
    if (rating === 0) { setError('Pilih rating dulu'); return }
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch(`/api/orders/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      })
      if (!res.ok) {
        const text = await res.text()
        const d = text ? JSON.parse(text) : {}
        throw new Error(d.error ?? 'Gagal mengirim review')
      }
      router.push(`/dashboard/orders/${id}?reviewed=1`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!order) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (existingReview) {
    return (
      <div style={{ width: '100%', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⭐</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Terima Kasih!</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Kamu sudah memberikan review untuk order ini.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ fontSize: 32, color: s <= existingReview.rating ? '#facc15' : '#e2e8f0' }}>★</span>
          ))}
        </div>
        {existingReview.comment && (
          <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', maxWidth: 400, margin: '0 auto 24px' }}>"{existingReview.comment}"</p>
        )}
        <button onClick={() => router.push(`/dashboard/orders/${id}`)} style={{ fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Kembali ke detail order
        </button>
      </div>
    )
  }

  const ratingLabels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus']

  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Kembali
      </button>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Beri Review</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>{order?.orderNumber ?? '...'}{order?.shoeType?.name ? ` · ${order.shoeType.name}` : ''}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 20 }}>Form Review</div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Rating *</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} style={{ fontSize: 40, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: s <= (hovered || rating) ? '#facc15' : '#e2e8f0', transform: s <= (hovered || rating) ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s, color 0.1s' }}>★</button>
              ))}
            </div>
            {rating > 0 && <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 6 }}>{ratingLabels[rating]}</p>}
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
              Komentar <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ceritakan pengalamanmu dengan layanan kami..." maxLength={500} rows={4} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#0f172a', background: '#f8fafc', boxSizing: 'border-box' }} onFocus={e => (e.target.style.borderColor = '#16a34a')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4 }}>{comment.length}/500</p>
          </div>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{error}</div>
          )}
          <button onClick={handleSubmit} disabled={loading || rating === 0} style={{ width: '100%', background: rating === 0 || loading ? '#e2e8f0' : '#16a34a', color: rating === 0 || loading ? '#94a3b8' : '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 14, fontWeight: 700, cursor: rating === 0 || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}>
            <Star style={{ width: 16, height: 16, fill: rating > 0 && !loading ? '#fff' : 'currentColor' }} />
            {loading ? 'Mengirim...' : 'Kirim Review'}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 16 }}>Ringkasan Order</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'No. Order', value: order?.orderNumber ?? '-' },
                { label: 'Layanan', value: order?.shoeType?.name ?? order?.items?.[0]?.serviceName ?? '-' },
                { label: 'Jumlah', value: `${order?.quantity ?? 1} pasang` },
                { label: 'Total', value: order?.totalPrice ? `Rp ${order.totalPrice.toLocaleString('id-ID')}` : '-', green: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f1f5f9', padding: '10px 0' }}>
                  <span style={{ color: '#64748b' }}>{row.label}</span>
                  <span style={{ fontWeight: (row as any).green ? 700 : 500, color: (row as any).green ? '#16a34a' : '#0f172a' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: 13, marginBottom: 10 }}>💡 Tips Review yang Baik</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Ceritakan kondisi sepatu sebelum dan sesudah cuci',
                'Sebutkan apakah hasil cucian sesuai ekspektasi',
                'Bagikan pengalaman tentang kecepatan layanan',
                'Saran untuk peningkatan layanan kami',
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#166534' }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}