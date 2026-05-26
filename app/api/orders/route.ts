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

    const shoeType = await prisma.shoeType.findUnique({ where: { id: shoeTypeId } })
    if (!shoeType || !shoeType.isActive) {
      return NextResponse.json({ message: 'Jenis sepatu tidak ditemukan' }, { status: 404 })
    }

    // Cek apakah ini order pertama user
    const orderCount = await prisma.order.count({
      where: { userId: user!.id },
    })
    const isFirstOrder = orderCount === 0

    const baseTotal    = shoeType.basePrice * quantity + surcharge
    const discount     = isFirstOrder ? Math.round(baseTotal * 0.2) : 0
    const totalPrice   = baseTotal - discount

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

      await tx.orderTracking.create({
        data: { orderId: newOrder.id, status: 'BOOKED', note: 'Order berhasil dibuat' },
      })

      return newOrder
    })

    return NextResponse.json(
      {
        ...order,
        isFirstOrder,
        discount,
        originalPrice: baseTotal,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const withTracking = new URL(req.url).searchParams.get('withTracking') === 'true'

  const orders = await prisma.order.findMany({
    where: { userId: user!.id },
    include: {
      shoeType: true,
      payment: { select: { status: true, paymentMethod: true } },
      shoePhotos: true,
      ...(withTracking && {
        tracking: { orderBy: { createdAt: 'asc' } },
      }),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ orders })
}