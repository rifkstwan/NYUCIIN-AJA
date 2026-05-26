"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-client";
import { Package } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  quantity: number;
  createdAt: string;
  shoeType: { name: string };
  payment?: { status: string } | null;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  BOOKED:     { label: "Dipesan",      color: "bg-blue-100 text-blue-700" },
  PICKUP:     { label: "Pickup",       color: "bg-purple-100 text-purple-700" },
  WASHING:    { label: "Dicuci",       color: "bg-orange-100 text-orange-700" },
  DRYING:     { label: "Dikeringkan",  color: "bg-yellow-100 text-yellow-700" },
  DELIVERY:   { label: "Diantar",      color: "bg-cyan-100 text-cyan-700" },
  DONE:       { label: "Selesai",      color: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",   color: "bg-red-100 text-red-700" },
};

const paymentConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Belum Dibayar", color: "bg-yellow-100 text-yellow-700" },
  PAID:    { label: "Lunas",         color: "bg-green-100 text-green-700" },
  FAILED:  { label: "Gagal",         color: "bg-red-100 text-red-700" },
};

export default function RiwayatPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => setOrders(data.orders ?? data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Riwayat Order</h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>Semua pesanan kamu</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8" }}>
            <div style={{
              width: 32, height: 32, border: "2px solid #16a34a",
              borderTopColor: "transparent", borderRadius: "50%",
              animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
            }} />
            Memuat data...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            Belum ada order
          </div>
        ) : (
          orders.map((order, i) => {
            const s = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
            const p = order.payment
              ? (paymentConfig[order.payment.status] ?? { label: order.payment.status, color: "bg-gray-100 text-gray-600" })
              : null;
            const isPending = order.payment?.status === "PENDING";
            return (
              <div
                key={order.id}
                style={{ borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}
              >
                <div
                  onClick={() => router.push(`/dashboard/tracking?order=${order.id}`)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: isPending ? "16px 24px 8px" : "16px 24px",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      background: "#dcfce7", padding: 10, borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Package style={{ width: 16, height: 16, color: "#16a34a" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>{order.orderNumber}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {order.shoeType?.name} × {order.quantity}
                      </div>
                      <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 1 }}>
                        {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                      Rp {order.totalPrice?.toLocaleString("id-ID")}
                    </span>
                    {p && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.color}`}>
                        {p.label}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                </div>

                {isPending && (
                  <div style={{ padding: "0 24px 16px", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/dashboard/orders/${order.id}/payment`);
                      }}
                      style={{
                        background: "#16a34a", color: "#fff",
                        border: "none", borderRadius: 8,
                        padding: "8px 20px", fontSize: 13,
                        fontWeight: 600, cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}