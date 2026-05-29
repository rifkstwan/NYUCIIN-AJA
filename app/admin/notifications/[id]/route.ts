import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = requireAdmin(req)
  if (error) return error

  const notification = await prisma.notification.update({
    where: { id: params.id },
    data:  { isRead: true },
  })
  return NextResponse.json(notification)
}