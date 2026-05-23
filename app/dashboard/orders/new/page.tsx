// app/dashboard/orders/new/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken } from '@/lib/auth-client'

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
    fetch('/api/shoe-types').then(r => r.json()).then(setShoeTypes)
  }, [])

  const selectedShoe = shoeTypes.find(s => s.id === form.shoeTypeId)
  const totalPrice = selectedShoe ? selectedShoe.basePrice * form.quantity : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) router.push(`/dashboard/orders/${data.id}`)
      else alert(data.error || 'Gagal membuat order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Buat Order Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Jenis Sepatu</label>
          <select
            required
            className="w-full border rounded-lg p-2"
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
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Jumlah Pasang</label>
          <input
            type="number" min={1} max={10} required
            className="w-full border rounded-lg p-2"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Alamat Pickup</label>
          <textarea
            required className="w-full border rounded-lg p-2" rows={2}
            value={form.pickupAddress}
            onChange={e => setForm({ ...form, pickupAddress: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Alamat Pengiriman</label>
          <textarea
            required className="w-full border rounded-lg p-2" rows={2}
            value={form.deliveryAddress}
            onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Catatan (opsional)</label>
          <textarea
            className="w-full border rounded-lg p-2" rows={2}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {totalPrice > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold">Total: Rp {totalPrice.toLocaleString('id-ID')}</p>
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? 'Membuat Order...' : 'Buat Order'}
        </button>
      </form>
    </div>
  )
}