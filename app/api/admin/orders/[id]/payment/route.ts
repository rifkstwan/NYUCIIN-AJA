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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params

    // Ambil email dari DB karena token tidak menyimpan email
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },  // ✅ ganti session.user.id → user.id
      include: { shoeType: true },
    })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    })

    const transaction = await snap.createTransaction({
      transaction_details: { order_id: order.id, gross_amount: order.totalPrice },
      customer_details: { email: dbUser?.email ?? "" },  // ✅ ganti session.user.email → dbUser.email
    })

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: { snapToken: transaction.token, status: "PENDING" },
      create: { orderId: order.id, snapToken: transaction.token, status: "PENDING", amount: order.totalPrice },
    })

    return NextResponse.json({ token: transaction.token })
  } catch (err) {
    console.error('POST payment error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}