import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  const promos = await prisma.promo.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ promos })
}

export async function POST(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { title, description, badge, isActive, startDate, endDate } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title wajib diisi' }, { status: 400 })

  const promo = await prisma.promo.create({
    data: {
      title,
      description: description || null,
      badge:       badge       || null,
      isActive:    isActive    ?? true,
      startDate:   startDate   ? new Date(startDate) : null,
      endDate:     endDate     ? new Date(endDate)   : null,
    },
  })
  return NextResponse.json(promo, { status: 201 })
}