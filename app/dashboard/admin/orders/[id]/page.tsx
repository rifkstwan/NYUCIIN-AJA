'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PhotoUpload from '@/components/ui/PhotoUpload'

const STATUS_FLOW = ['BOOKED', 'PICKUP', 'WASHING', 'DRYING', 'DELIVERY', 'DONE']
const STATUS_LABELS: Record<string, string> = {
  BOOKED: 'Dipesan', PICKUP: 'Pickup', WASHING: 'Dicuci',
  DRYING: 'Pengeringan', DELIVERY: 'Pengiriman', DONE: 'Selesai', CANCELLED: 'Dibatalkan',
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')

  // State foto
  const [photos, setPhotos] = useState<any[]>([])
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before')
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchOrder() {
    const res = await fetch(`/api/orders/${id}`)
    const data = await res.json()
    setOrder(data)
    setNewStatus(data.status)
  }

  async function fetchPhotos() {
    try {
      const res = await fetch(`/api/orders/${id}/photos`)
      if (res.ok) {
        const data = await res.json()
        setPhotos(Array.isArray(data) ? data : [])
      }
    } catch {
      // foto tidak wajib ada
    }
  }

  useEffect(() => {
    fetchOrder()
    fetchPhotos()
  }, [id])

  async function handleUpdateStatus() {
    setSaving(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      setSuccessMsg('Status berhasil diupdate!')
      setNote('')
      await fetchOrder()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePhoto() {
    if (!uploadedUrl) {
      setUploadError('Upload foto dulu')
      return
    }
    setSavingPhoto(true)
    setUploadMsg('')
    setUploadError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: uploadedUrl, type: photoType }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      setUploadMsg(`Foto ${photoType === 'before' ? 'sebelum' : 'sesudah'} berhasil disimpan!`)
      setUploadedUrl('')
      await fetchPhotos()
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setSavingPhoto(false)
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!confirm('Hapus foto ini?')) return
    setDeletingId(photoId)
    try {
      const res = await fetch(`/api/admin/orders/${id}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      })
      if (res.ok) await fetchPhotos()
    } finally {
      setDeletingId(null)
    }
  }

  if (!order) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  const beforePhotos = photos.filter(p => p.type === 'before')
  const afterPhotos = photos.filter(p => p.type === 'after')

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 text-sm">
        ← Kembali
      </button>

      <div>
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        <p className="text-gray-500 text-sm">{order.user?.name} · {order.user?.email}</p>
      </div>

      {/* Info Order */}
      <div className="border rounded-lg p-4 space-y-2 bg-gray-50 text-sm">
        <p><span className="text-gray-500">Layanan:</span> {order.shoeType?.name} ×{order.quantity}</p>
        <p>
          <span className="text-gray-500">Total:</span>{' '}
          <strong>Rp {order.totalPrice?.toLocaleString('id-ID')}</strong>
        </p>
        <p>
          <span className="text-gray-500">Payment:</span>{' '}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            order.payment?.status === 'PAID'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {order.payment?.status ?? 'BELUM'}
          </span>
        </p>
        <p><span className="text-gray-500">Alamat Pickup:</span> {order.pickupAddress ?? '-'}</p>
        {order.notes && <p><span className="text-gray-500">Catatan:</span> {order.notes}</p>}
      </div>

      {/* Update Status */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="font-semibold">Update Status Order</h2>

        <div className="grid grid-cols-3 gap-2">
          {STATUS_FLOW.map(s => (
            <button
              key={s}
              onClick={() => setNewStatus(s)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                newStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 hover:border-blue-400'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          <button
            onClick={() => setNewStatus('CANCELLED')}
            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
              newStatus === 'CANCELLED'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-red-500 hover:border-red-400'
            }`}
          >
            Batalkan
          </button>
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Catatan (opsional, contoh: sudah dicuci bersih)"
          className="w-full border rounded-lg p-3 text-sm resize-none"
          rows={2}
        />

        {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleUpdateStatus}
          disabled={saving || newStatus === order.status}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : `Update ke "${STATUS_LABELS[newStatus] ?? newStatus}"`}
        </button>
      </div>

      {/* Upload Foto Sepatu */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="font-semibold">Foto Sepatu</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Kolom kiri — Form upload */}
          <div className="space-y-3">
            {/* Toggle Before / After */}
            <div className="flex gap-2">
              <button
                onClick={() => setPhotoType('before')}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition ${
                  photoType === 'before'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-600 hover:border-red-300'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setPhotoType('after')}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition ${
                  photoType === 'after'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-600 hover:border-green-300'
                }`}
              >
                After
              </button>
            </div>

            {/* File picker via komponen PhotoUpload */}
            <PhotoUpload
              onUploaded={(url) => {
                setUploadedUrl(url)
                setUploadMsg('')
                setUploadError('')
              }}
              disabled={savingPhoto}
            />

            {uploadMsg && <p className="text-green-600 text-xs">{uploadMsg}</p>}
            {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}

            <button
              onClick={handleSavePhoto}
              disabled={!uploadedUrl || savingPhoto}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition hover:bg-blue-700"
            >
              {savingPhoto
                ? 'Menyimpan...'
                : `Simpan Foto ${photoType === 'before' ? 'Before' : 'After'}`}
            </button>
          </div>

          {/* Kolom kanan — Foto tersimpan */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Tersimpan ({photos.length})
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {photos.length > 0
                ? photos.map(p => (
                    <div key={p.id} className="relative group">
                      <img
                        src={p.photoUrl}
                        alt={p.type}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-100"
                      />
                      <span className={`absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded font-medium ${
                        p.type === 'before'
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {p.type}
                      </span>
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        disabled={deletingId === p.id}
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                      >
                        {deletingId === p.id ? '...' : 'Hapus'}
                      </button>
                    </div>
                  ))
                : (
                  <div className="aspect-square rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                    Belum ada foto
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* Tampilan Before / After terpisah jika sudah ada foto */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                Sebelum ({beforePhotos.length})
              </p>
              {beforePhotos.length === 0 && (
                <p className="text-xs text-gray-400">Belum ada foto before</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                Sesudah ({afterPhotos.length})
              </p>
              {afterPhotos.length === 0 && (
                <p className="text-xs text-gray-400">Belum ada foto after</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Riwayat Tracking */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Riwayat Status</h2>
        <div className="space-y-3">
          {order.tracking?.length > 0
            ? [...order.tracking].reverse().map((t: any) => (
                <div key={t.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium">{STATUS_LABELS[t.status] ?? t.status}</p>
                    {t.note && <p className="text-gray-500">{t.note}</p>}
                    <p className="text-xs text-gray-400">
                      {new Date(t.createdAt).toLocaleString('id-ID')}
                      {t.updatedBy && ` · oleh ${t.updatedBy}`}
                    </p>
                  </div>
                </div>
              ))
            : <p className="text-sm text-gray-400">Belum ada riwayat status.</p>
          }
        </div>
      </div>
    </div>
  )
}