'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
    fetch(`/api/orders/${id}`).then(r => r.json()).then(setOrder)
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
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  // Sudah review
  if (existingReview) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="text-5xl mb-4">⭐</div>
        <h1 className="text-2xl font-bold mb-2">Terima Kasih!</h1>
        <p className="text-gray-500 mb-2">Kamu sudah memberikan review untuk order ini.</p>
        <div className="flex justify-center gap-1 mb-4">
          {[1,2,3,4,5].map(s => (
            <span key={s} className={`text-3xl ${s <= existingReview.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
          ))}
        </div>
        {existingReview.comment && <p className="text-gray-600 italic">"{existingReview.comment}"</p>}
        <button onClick={() => router.push(`/dashboard/orders/${id}`)} className="mt-6 text-blue-600 underline text-sm">
          Kembali ke detail order
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 text-sm mb-4 block">
        ← Kembali
      </button>

      <h1 className="text-2xl font-bold mb-1">Beri Review</h1>
      <p className="text-gray-500 text-sm mb-6">Order {order.orderNumber} · {order.shoeType?.name}</p>

      {/* Bintang */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2 font-medium">Rating *</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              className={`text-4xl transition-transform hover:scale-110 ${s <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][rating]}
          </p>
        )}
      </div>

      {/* Komentar */}
      <div className="mb-6">
        <label className="text-sm text-gray-600 font-medium block mb-2">Komentar (opsional)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Ceritakan pengalamanmu dengan layanan kami..."
          className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {loading ? 'Mengirim...' : '⭐ Kirim Review'}
      </button>
    </div>
  )
}