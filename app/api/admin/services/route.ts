import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  const services = await prisma.shoeType.findMany({ orderBy: { basePrice: 'asc' } })
  return NextResponse.json({ services })
}

export async function POST(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { name, basePrice, description, badge, featured, features, isActive } = await req.json()
  if (!name || !basePrice) return NextResponse.json({ error: 'Nama dan harga wajib diisi' }, { status: 400 })

  const service = await prisma.shoeType.create({
    data: {
      name,
      basePrice:   Number(basePrice),
      description: description || null,
      badge:       badge       || null,
      featured:    featured    ?? false,
      features:    features    || [],
      isActive:    isActive    ?? true,
    },
  })
  return NextResponse.json(service, { status: 201 })
}