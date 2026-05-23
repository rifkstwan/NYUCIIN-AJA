import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req);
  if (error) return error;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const [totalOrders, pendingOrders, completedOrders, totalUsers, revenueData] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: {
            in: [
              OrderStatus.BOOKED,
              OrderStatus.CONFIRMED,
              OrderStatus.PICKUP,
              OrderStatus.PROCESSING,
            ],
          },
        },
      }),
      prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.aggregate({
        where: { status: OrderStatus.COMPLETED },
        _sum: { totalPrice: true },
      }),
    ]);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalUsers,
      totalRevenue: revenueData._sum.totalPrice ?? 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}