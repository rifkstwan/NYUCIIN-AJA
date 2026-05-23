// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { generateOrderNumber } from '@/lib/utils'
import { z } from 'zod'

const createOrderSchema = z.object({
  shoeTypeId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  surcharge: z.number().int().min(0).default(0),
  notes: z.string().optional(),
  pickupAddress: z.string().optional(),
  deliveryAddress: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
})

// POST /api/orders — Buat order baru
export async function POST(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error

  try {
    const body = await req.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { shoeTypeId, quantity, surcharge, notes, pickupAddress, deliveryAddress, scheduledAt } = parsed.data

    // Ambil harga base dari shoe type
    const shoeType = await prisma.shoeType.findUnique({
      where: { id: shoeTypeId },
    })

    if (!shoeType || !shoeType.isActive) {
      return NextResponse.json(
        { message: 'Jenis sepatu tidak ditemukan' },
        { status: 404 }
      )
    }

    // Kalkulasi harga otomatis: base_price × qty + surcharge
    const totalPrice = shoeType.basePrice * quantity + surcharge

    // Buat order + tracking awal sekaligus (transaction)
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user!.id,
          shoeTypeId,
          quantity,
          surcharge,
          totalPrice,
          notes,
          pickupAddress,
          deliveryAddress,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          status: 'BOOKED',
        },
        include: { shoeType: true },
      })

      // Catat tracking awal
      await tx.orderTracking.create({
        data: {
          orderId: newOrder.id,
          status: 'BOOKED',
          note: 'Order berhasil dibuat',
        },
      })

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// GET /api/orders — List order milik user
export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const orders = await prisma.order.findMany({
    where: { userId: user!.id },
    include: {
      shoeType: true,
      payment: { select: { status: true, paymentMethod: true } },
      shoePhotos: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}