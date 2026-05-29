import { prisma } from './prisma'

export async function createNotification({
  title,
  body,
  type,
  orderId,
}: {
  title:    string
  body:     string
  type:     string
  orderId?: string
}) {
  await prisma.notification.create({
    data: { title, body, type, orderId: orderId ?? null },
  })
}