"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth-client";
import { ArrowLeft, Package, MapPin, Clock } from "lucide-react";

const statusSteps = ["BOOKED", "CONFIRMED", "PICKUP", "PROCESSING", "DELIVERY", "COMPLETED"];

const statusConfig: Record<string, { label: string; emoji: string }> = {
  BOOKED:     { label: "Order Diterima",   emoji: "📋" },
  CONFIRMED:  { label: "Dikonfirmasi",     emoji: "✅" },
  PICKUP:     { label: "Sedang Dijemput",  emoji: "🚗" },
  PROCESSING: { label: "Sedang Diproses",  emoji: "🧼" },
  DELIVERY:   { label: "Sedang Dikirim",   emoji: "🚚" },
  COMPLETED:  { label: "Selesai",          emoji: "🎉" },
  CANCELLED:  { label: "Dibatalkan",       emoji: "❌" },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    fetchOrder(token);
  }, []);

  const fetchOrder = async (token: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrder(data.order ?? data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Order tidak ditemukan
    </div>
  );

  const currentStep = statusSteps.indexOf(order.status);
  const s = statusConfig[order.status] ?? { label: order.status, emoji: "📦" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-primary-600 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-primary-900 to-primary-600 text-white rounded-2xl p-6 mb-6 text-center">
          <div className="text-5xl mb-3">{s.emoji}</div>
          <div className="text-xl font-bold mb-1">{s.label}</div>
          <div className="text-blue-200 text-sm">{order.orderNumber}</div>
        </div>

        {/* Progress Bar */}
        {order.status !== "CANCELLED" && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-primary-900 mb-4">Tracking Order</h3>
            <div className="space-y-3">
              {statusSteps.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                const cfg = statusConfig[step];
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                      done ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"
                    } ${active ? "ring-4 ring-primary-100" : ""}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm ${
                      active ? "font-bold text-primary-900" :
                      done ? "text-gray-600" : "text-gray-400"
                    }`}>
                      {cfg.label}
                    </span>
                    {active && (
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                        Saat ini
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Detail */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-primary-900 mb-4">Detail Order</h3>
          <div className="space-y-3">
            {order.shoeType ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {order.shoeType.name} × {order.quantity} pasang
                </span>
                <span className="font-medium">
                  Rp {(order.shoeType.basePrice * order.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ) : order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.serviceName} × {item.quantity}</span>
                <span className="font-medium">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
            {order.surcharge > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Biaya tambahan</span>
                <span>Rp {order.surcharge.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-600">
                Rp {order.totalPrice?.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-primary-900 mb-4">Informasi</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
              <span>{order.pickupAddress || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>Dibuat: {new Date(order.createdAt).toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}</span>
            </div>
            {order.notes && (
              <div className="flex items-start gap-3 text-gray-600">
                <Package className="w-4 h-4 text-primary-500 mt-0.5" />
                <span>Catatan: {order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Pembayaran / Tombol Bayar */}
        {order.payment ? (
          <div className={`p-4 rounded-xl text-center text-sm font-medium ${
            order.payment.status === "PAID"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          }`}>
            {order.payment.status === "PAID" ? "✅ Pembayaran Lunas" : "⏳ Menunggu Pembayaran"}
            <div className="text-xs font-normal mt-1 opacity-75">
              via {order.payment.paymentMethod} • Rp {order.payment.amount.toLocaleString("id-ID")}
            </div>
          </div>
        ) : order.status === "BOOKED" ? (
          <div>
            <Link
              href={`/dashboard/orders/${order.id}/payment`}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-sm"
            >
              💳 Bayar Sekarang
            </Link>
            <p className="text-center text-xs text-gray-400 mt-2">
              Selesaikan pembayaran untuk memproses order kamu
            </p>
          </div>
        ) : null}

      </div>
    </div>
  );
}