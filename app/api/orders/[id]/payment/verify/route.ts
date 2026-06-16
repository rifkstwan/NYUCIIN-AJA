// app/api/orders/[id]/payment/verify/route.ts
// Verifikasi status pembayaran langsung ke Midtrans (fallback jika webhook gagal)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import midtransClient from 'midtrans-client'

function getUserFromReq(req: NextRequest) {
  try {
    // Support Authorization Bearer header (dipakai frontend via getToken())
    const authHeader = req.headers.get('authorization') ?? ''
    if (authHeader.startsWith('Bearer ')) {
      return verifyToken(authHeader.slice(7))
    }
    // Fallback: cookie
    const cookieToken = req.cookies.get('auth_token')?.value
    if (cookieToken) return verifyToken(cookieToken)
    return null
  } catch {
    return null
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromReq(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params

    // Cari order + payment milik user ini
    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { payment: true },
    })

    if (!order || !order.payment) {
      return NextResponse.json({ error: 'Order/payment tidak ditemukan' }, { status: 404 })
    }

    // Sudah PAID → kembalikan langsung
    if (order.payment.status === 'PAID') {
      return NextResponse.json({ status: 'PAID', alreadyPaid: true })
    }

    // Tanya Midtrans langsung menggunakan order.id sebagai transaction_id
    const coreApi = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    })

    let midtransStatus: any
    try {
      // midtrans-client TypeScript types tidak lengkap, gunakan any cast
      midtransStatus = await (coreApi as any).transaction.status(order.id)
    } catch {
      // Midtrans belum punya transaksi → user belum bayar
      return NextResponse.json({ status: order.payment.status })
    }

    const { transaction_status, fraud_status, payment_type, transaction_id } = midtransStatus

    // Tentukan paymentStatus dari response Midtrans
    let paymentStatus: 'PENDING' | 'PAID' | 'FAILED' = 'PENDING'
    if (transaction_status === 'capture' && fraud_status === 'accept') paymentStatus = 'PAID'
    else if (transaction_status === 'settlement') paymentStatus = 'PAID'
    else if (['cancel', 'deny', 'expire'].includes(transaction_status)) paymentStatus = 'FAILED'

    // Hanya update jika status berubah
    if (paymentStatus !== order.payment.status) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: paymentStatus,
          transactionId: transaction_id ?? null,
          paymentMethod: payment_type,
          paidAt: paymentStatus === 'PAID' ? new Date() : null,
          midtransResponse: midtransStatus,
        },
      })

      // Jika PAID → update order ke PICKUP + tambah tracking
      if (paymentStatus === 'PAID' && order.status === 'BOOKED') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PICKUP' },
        })

        await prisma.orderTracking.create({
          data: {
            orderId: order.id,
            status: 'PICKUP',
            note: 'Pembayaran berhasil (diverifikasi langsung ke Midtrans)',
          },
        })
      }
    }

    return NextResponse.json({ status: paymentStatus })
  } catch (err) {
    console.error('Verify payment error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
