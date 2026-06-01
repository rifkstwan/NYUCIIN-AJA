import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

// GET — ambil semua foto order (user)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = requireAuth(req)
  if (error) return error

  const { id } = await params

  const photos = await prisma.shoePhoto.findMany({
    where: { orderId: id },
    orderBy: { uploadedAt: 'asc' },
  })

  return NextResponse.json(photos)
}