// app/api/orders/[id]/payment/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
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
      email: session.user.email,
    },
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { snapToken: transaction.token, status: "PENDING" },
    create: { orderId: order.id, snapToken: transaction.token, status: "PENDING", amount: order.totalPrice },
  });

  return NextResponse.json({ token: transaction.token });
}