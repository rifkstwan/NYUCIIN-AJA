import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  const unreadCount = await prisma.notification.count({ where: { isRead: false } })
  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const { error } = requireAdmin(req)
  if (error) return error

  // Mark all as read
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}