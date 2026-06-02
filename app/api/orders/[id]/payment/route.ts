// app/api/orders/[id]/payment/route.ts
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Await params (Next.js 15+)
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { shoeType: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });

  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: order.id,
      gross_amount: order.totalPrice,
    },
    customer_details: {
      email: user.id, // ganti dengan user.email kalau tersedia di token
    },
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { snapToken: transaction.token, status: "PENDING" },
    create: {
      orderId: order.id,
      snapToken: transaction.token,
      status: "PENDING",
      amount: order.totalPrice,
    },
  });

  return NextResponse.json({ token: transaction.token });
}