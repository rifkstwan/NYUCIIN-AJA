import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import midtransClient from "midtrans-client"
import { NextResponse, NextRequest } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = verifyToken(token)
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { id } = await params

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

    const order = await prisma.order.findFirst({
      where: { id },
      include: { shoeType: true },
    })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    })

    const transaction = await snap.createTransaction({
      transaction_details: { order_id: order.id, gross_amount: order.totalPrice },
      customer_details: { email: dbUser?.email ?? "" },
    } as any)

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: { snapToken: transaction.token, status: "PENDING" },
      create: { orderId: order.id, snapToken: transaction.token, status: "PENDING", amount: order.totalPrice },
    })

    return NextResponse.json({ token: transaction.token })
  } catch (err) {
    console.error("POST admin payment error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}