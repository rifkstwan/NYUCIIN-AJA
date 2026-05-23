import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  const { error, user } = requireAuth(req);
  if (error) return error;

  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shoeType: true, payment: true },
    });

    if (!order || order.userId !== user!.id) {
      return NextResponse.json({ message: "Order tidak ditemukan" }, { status: 404 });
    }

    if (order.payment?.status === "PAID") {
      return NextResponse.json({ message: "Order sudah dibayar" }, { status: 400 });
    }

    // Generate Snap Token via Midtrans
    const authString = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64");
    const transactionId = `${order.orderNumber}-${Date.now()}`;

    const midtransRes = await fetch(
      process.env.MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: transactionId,
            gross_amount: order.totalPrice,
          },
          customer_details: {
            first_name: user!.name,
            email: user!.email,
          },
        }),
      }
    );

    const snapData = await midtransRes.json();

    if (!snapData.token) {
      return NextResponse.json({ message: "Gagal generate token", detail: snapData }, { status: 500 });
    }

    // Simpan atau update payment record
    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        snapToken: snapData.token,
        transactionId,
        amount: order.totalPrice,
        status: "PENDING",
      },
      update: {
        snapToken: snapData.token,
        transactionId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ snapToken: snapData.token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}