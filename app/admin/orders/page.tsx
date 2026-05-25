"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser } from "@/lib/auth-client";
import { Package, Search, Filter } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  quantity: number;
  user: { name: string; phone: string };
  shoeType: { name: string };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  BOOKED:     { label: "Diterima",     color: "bg-blue-100 text-blue-700" },
  CONFIRMED:  { label: "Dikonfirmasi", color: "bg-indigo-100 text-indigo-700" },
  PICKUP:     { label: "Pickup",       color: "bg-purple-100 text-purple-700" },
  PROCESSING: { label: "Diproses",     color: "bg-orange-100 text-orange-700" },
  DELIVERY:   { label: "Dikirim",      color: "bg-cyan-100 text-cyan-700" },
  COMPLETED:  { label: "Selesai",      color: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",   color: "bg-red-100 text-red-700" },
};

const STATUS_OPTIONS = ["SEMUA", "BOOKED", "CONFIRMED", "PICKUP", "PROCESSING", "DELIVERY", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("SEMUA");

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || user?.role !== "ADMIN") { router.push("/auth/login"); return; }
    fetchOrders(token);
  }, []);

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders ?? data);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "SEMUA" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
          Manajemen Order
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>{orders.length} total order</p>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: 16,
        border: "1px solid #e2e8f0", marginBottom: 20,
        display: "flex", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search style={{
            width: 16, height: 16, color: "#94a3b8",
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari order atau nama pelanggan..."
            style={{
              width: "100%", paddingLeft: 36, paddingRight: 12,
              paddingTop: 10, paddingBottom: 10,
              border: "1px solid #e2e8f0", borderRadius: 10,
              fontSize: 13, outline: "none", boxSizing: "border-box",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter style={{ width: 16, height: 16, color: "#94a3b8" }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              border: "1px solid #e2e8f0", borderRadius: 10,
              padding: "10px 12px", fontSize: 13,
              outline: "none", fontFamily: "var(--font-body)",
              background: "#fff", color: "#0f172a",
            }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === "SEMUA" ? "Semua Status" : statusConfig[s]?.label ?? s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Order List */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1px solid #e2e8f0", overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8" }}>
            <div style={{
              width: 32, height: 32, border: "2px solid #16a34a",
              borderTopColor: "transparent", borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 12px",
            }} />
            Memuat data...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            Tidak ada order ditemukan
          </div>
        ) : (
          <div>
            {filtered.map((order, i) => {
              const s = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    borderTop: i === 0 ? "none" : "1px solid #f1f5f9",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      background: "#dcfce7", padding: 10, borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Package style={{ width: 16, height: 16, color: "#16a34a" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                        {order.orderNumber}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {order.user?.name} · {order.shoeType?.name} × {order.quantity}
                      </div>
                      <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 1 }}>
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                      Rp {order.totalPrice?.toLocaleString("id-ID")}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}