import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  const { error } = requireAdmin(req)
  if (error) return error

  const { id } = await params  // ✅ await

  const notification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })
  return NextResponse.json(notification)
}