'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

interface PayButtonProps {
  orderId: string
  onSuccess?: () => void
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: object) => void
    }
  }
}

export default function PayButton({ orderId, onSuccess }: PayButtonProps) {
  const [loading, setLoading] = useState(false)

  const loadSnapScript = () =>
    new Promise<void>((resolve) => {
      if (window.snap) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
      script.onload = () => resolve()
      document.head.appendChild(script)
    })

  const handlePay = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      await loadSnapScript()

      window.snap.pay(data.snapToken, {
        onSuccess: () => { onSuccess?.() },
        onPending: () => { console.log('Payment pending') },
        onError: () => { alert('Pembayaran gagal') },
        onClose: () => { console.log('Snap ditutup') },
      })
    } catch (err) {
      alert('Gagal memproses pembayaran')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handlePay} disabled={loading} className="w-full" size="lg">
      {loading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
      ) : (
        <><CreditCard className="w-4 h-4 mr-2" /> Bayar Sekarang</>
      )}
    </Button>
  )
}
