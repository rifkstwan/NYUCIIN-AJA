"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser } from "@/lib/auth-client";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  shoeType?: { name: string };
  items?: { serviceName: string; quantity: number }[];
}

const statusColor: Record<string, string> = {
  BOOKED:     "#dbeafe",
  CONFIRMED:  "#bfdbfe",
  PICKUP:     "#ede9fe",
  PROCESSING: "#ffedd5",
  DELIVERY:   "#e0e7ff",
  DONE:       "#dcfce7",
  CANCELLED:  "#fee2e2",
};
const statusText: Record<string, string> = {
  BOOKED:     "#1e40af",
  CONFIRMED:  "#1d4ed8",
  PICKUP:     "#6d28d9",
  PROCESSING: "#c2410c",
  DELIVERY:   "#3730a3",
  DONE:       "#16a34a",
  CANCELLED:  "#dc2626",
};
const statusLabel: Record<string, string> = {
  BOOKED:     "Dipesan",
  CONFIRMED:  "Dikonfirmasi",
  PICKUP:     "Dijemput",
  PROCESSING: "Diproses",
  DELIVERY:   "Dikirim",
  DONE:       "Selesai",
  CANCELLED:  "Dibatalkan",
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser]     = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    setUser(getUser());
    fetchOrders(token);
  }, []);

  const fetchOrders = async (token: string) => {
    try {
      const res  = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : (data.orders ?? []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
            Selamat Datang{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p style={{ fontSize: 14, color: "#475569" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/dashboard/pesan"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 10,
            background: "#16a34a", color: "#fff",
            fontSize: 13.5, fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(22,163,74,0.2)",
          }}
        >
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Order Baru
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>

        {/* Total Order */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg style={{ width: 20, height: 20, color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{orders.length}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 6 }}>Total Order</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Sepanjang masa</div>
        </div>

        {/* Order Aktif */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg style={{ width: 20, height: 20, color: "#ca8a04" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
            {orders.filter(o => !["DONE", "CANCELLED"].includes(o.status)).length}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 6 }}>Order Aktif</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Sedang diproses</div>
        </div>

        {/* Selesai */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg style={{ width: 20, height: 20, color: "#059669" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
            {orders.filter(o => o.status === "DONE").length}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 6 }}>Selesai</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Order selesai</div>
        </div>

        {/* Dibatalkan */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg style={{ width: 20, height: 20, color: "#dc2626" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
            {orders.filter(o => o.status === "CANCELLED").length}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 6 }}>Dibatalkan</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Order dibatalkan</div>
        </div>

      </div>

      {/* Order List */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 24px", borderBottom: "1px solid #e2e8f0",
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            Riwayat Order
          </h2>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>{orders.length} order</span>
        </div>

        {loading ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "2.5px solid #e2e8f0", borderTopColor: "#16a34a",
              animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
            }} />
            <p style={{ fontSize: 14, color: "#94a3b8" }}>Memuat data...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: "#f0fdf4", margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg style={{ width: 28, height: 28, color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Belum ada order</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Yuk buat order pertamamu sekarang</p>
            <Link
              href="/dashboard/pesan"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 10,
                background: "#16a34a", color: "#fff",
                fontSize: 13.5, fontWeight: 600, textDecoration: "none",
              }}
            >
              Buat Order Pertama
            </Link>
          </div>
        ) : (
          <div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr 0.9fr 90px",
              padding: "10px 24px", background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontSize: 11.5, fontWeight: 700, color: "#475569",
              textTransform: "uppercase", letterSpacing: "0.4px",
            }}>
              <span>No. Order</span>
              <span>Layanan</span>
              <span>Tanggal</span>
              <span>Total</span>
              <span>Status</span>
            </div>

            {orders.map((order, i) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr 0.9fr 90px",
                  padding: "14px 24px", alignItems: "center",
                  borderBottom: i < orders.length - 1 ? "1px solid #f1f5f9" : "none",
                  fontSize: 13.5, textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontWeight: 600, color: "#16a34a" }}>{order.orderNumber}</span>
                <span style={{ color: "#0f172a", fontWeight: 500 }}>
                  {order.shoeType?.name ?? order.items?.[0]?.serviceName ?? "Cuci Sepatu"}
                </span>
                <span style={{ color: "#475569" }}>
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                  Rp {order.totalPrice?.toLocaleString("id-ID")}
                </span>
                <span style={{
                  padding: "3px 10px", borderRadius: 999,
                  fontSize: 11.5, fontWeight: 600, display: "inline-block",
                  background: statusColor[order.status] ?? "#e2e8f0",
                  color: statusText[order.status] ?? "#475569",
                }}>
                  {statusLabel[order.status] ?? order.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}