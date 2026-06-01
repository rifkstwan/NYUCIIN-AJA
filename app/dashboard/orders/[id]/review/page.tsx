'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'

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
    fetch(`/api/orders/${id}`).then(r => r.json()).then(d => setOrder(d.order ?? d))
    fetch(`/api/orders/${id}/review`).then(r => r.json()).then(data => {
      if (data?.id) {
        setExistingReview(data)
        setRating(data.rating)
        setComment(data.comment ?? '')
      }
    })
  }, [id])

  async function handleSubmit() {
    if (rating === 0) { setError('Pilih rating dulu'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
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

  // Sudah pernah review
  if (existingReview) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⭐</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Terima Kasih!</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
          Kamu sudah memberikan review untuk order ini.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ fontSize: 32, color: s <= existingReview.rating ? '#facc15' : '#e2e8f0' }}>★</span>
          ))}
        </div>
        {existingReview.comment && (
          <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', maxWidth: 400, margin: '0 auto 24px' }}>
            "{existingReview.comment}"
          </p>
        )}
        <button
          onClick={() => router.push(`/dashboard/orders/${id}`)}
          style={{ fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Kembali ke detail order
        </button>
      </div>
    )
  }

  const ratingLabels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus']

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', width: '100%' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Kembali */}
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0 }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Kembali
      </button>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Beri Review</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          {order?.orderNumber ?? '...'}{order?.shoeType?.name ? ` · ${order.shoeType.name}` : ''}
        </p>
      </div>

      {/* Card form */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>

        {/* Rating bintang */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Rating *</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  fontSize: 40, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: s <= (hovered || rating) ? '#facc15' : '#e2e8f0',
                  transform: s <= (hovered || rating) ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.1s, color 0.1s',
                }}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 6 }}>
              {ratingLabels[rating]}
            </p>
          )}
        </div>

        {/* Komentar */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            Komentar <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opsional)</span>
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Ceritakan pengalamanmu dengan layanan kami..."
            maxLength={500}
            rows={4}
            style={{
              width: '100%', border: '1px solid #e2e8f0', borderRadius: 10,
              padding: '12px 14px', fontSize: 13, resize: 'none', outline: 'none',
              fontFamily: 'inherit', color: '#0f172a', background: '#f8fafc',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#16a34a')}
            onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
          />
          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4 }}>
            {comment.length}/500
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          style={{
            width: '100%', background: rating === 0 || loading ? '#e2e8f0' : '#16a34a',
            color: rating === 0 || loading ? '#94a3b8' : '#fff',
            border: 'none', borderRadius: 10, padding: '14px 0',
            fontSize: 14, fontWeight: 700, cursor: rating === 0 || loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
        >
          <Star style={{ width: 16, height: 16, fill: rating > 0 && !loading ? '#fff' : 'currentColor' }} />
          {loading ? 'Mengirim...' : 'Kirim Review'}
        </button>
      </div>
    </div>
  )
}