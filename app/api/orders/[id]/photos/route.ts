import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

// GET — ambil semua foto order
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, user } = requireAuth(req)
  if (error) return error

  const photos = await prisma.shoePhoto.findMany({
    where: { orderId: params.id },
    orderBy: { uploadedAt: 'asc' },
  })

  return NextResponse.json(photos)
}