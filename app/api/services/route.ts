import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const services = await prisma.shoeType.findMany({
    where: { isActive: true },
    orderBy: { basePrice: 'asc' },
  })
  return NextResponse.json({ services })
}