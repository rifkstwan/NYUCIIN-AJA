// app/api/shoe-types/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const shoeTypes = await prisma.shoeType.findMany({
    where: { isActive: true },
    orderBy: { basePrice: 'asc' },
  })
  return NextResponse.json(shoeTypes)
}