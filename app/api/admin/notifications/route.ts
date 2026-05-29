import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const unreadOnly = searchParams.get('unread') === 'true'

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: unreadOnly ? { isRead: false } : {},
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { isRead: false } }),
    ])

    return NextResponse.json({ data: notifications, unreadCount })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error) return error
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()

    // markAllRead: true → tandai semua sudah dibaca
    if (body.markAllRead) {
      await prisma.notification.updateMany({ data: { isRead: true } })
      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    // id: string → tandai satu notif
    if (body.id) {
      const updated = await prisma.notification.update({
        where: { id: body.id },
        data: { isRead: true },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}