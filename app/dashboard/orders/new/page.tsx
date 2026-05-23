'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth-client'  // ← fix import
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

interface ShoeType {
  id: string
  name: string
  basePrice: number
  description: string | null
}

export default function NewOrderPage() {
  const router = useRouter()
  const [shoeTypes, setShoeTypes] = useState<ShoeType[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    shoeTypeId: '',
    quantity: 1,
    pickupAddress: '',
    deliveryAddress: '',
    notes: '',
  })

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/auth/login'); return; }
    fetch('/api/shoe-types').then(r => r.json()).then(setShoeTypes)
  }, [])

  const selectedShoe = shoeTypes.find(s => s.id === form.shoeTypeId)
  const totalPrice = selectedShoe ? selectedShoe.basePrice * form.quantity : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = getToken()  // ← ambil token
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // ← kirim token
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) router.push(`/dashboard/orders/${data.id}`)
      else alert(data.message || 'Gagal membuat order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">

        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-primary-600 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-50 p-2.5 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-900">Buat Order Baru</h1>
              <p className="text-gray-400 text-sm">Isi detail pesanan cuci sepatumu</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Jenis Sepatu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jenis Sepatu <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={form.shoeTypeId}
                onChange={e => setForm({ ...form, shoeTypeId: e.target.value })}
              >
                <option value="">-- Pilih Jenis Sepatu --</option>
                {shoeTypes.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Rp {s.basePrice.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
              {selectedShoe?.description && (
                <p className="text-xs text-gray-400 mt-1">{selectedShoe.description}</p>
              )}
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jumlah Pasang <span className="text-red-500">*</span>
              </label>
              <input
                type="number" min={1} max={10} required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>

            {/* Alamat Pickup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Alamat Pickup <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                rows={2}
                placeholder="Masukkan alamat lengkap penjemputan sepatu"
                value={form.pickupAddress}
                onChange={e => setForm({ ...form, pickupAddress: e.target.value })}
              />
            </div>

            {/* Alamat Pengiriman */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Alamat Pengiriman <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                rows={2}
                placeholder="Masukkan alamat pengiriman sepatu setelah selesai"
                value={form.deliveryAddress}
                onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Catatan <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                rows={2}
                placeholder="Contoh: ada noda di bagian sol, tolong hati-hati"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {/* Total Harga */}
            {totalPrice > 0 && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm text-primary-700">Estimasi Total</span>
                <span className="font-bold text-primary-900 text-lg">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Membuat Order...</>
              ) : (
                <><ShoppingBag className="w-4 h-4" /> Buat Order</>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}