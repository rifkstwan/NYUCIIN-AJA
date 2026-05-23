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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-bold">CuciSepatu<span className="text-primary-500">.id</span>
            <span className="bg-yellow-400 text-primary-900 text-xs font-bold px-2 py-0.5 rounded-full ml-2">ADMIN</span>
          </span>
          <div className="flex gap-6">
            <Link href="/admin/dashboard" className="text-sm text-blue-200 hover:text-white">Dashboard</Link>
            <Link href="/admin/orders" className="text-sm text-white font-medium">Orders</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary-900">Manajemen Order</h1>
          <p className="text-gray-400 text-sm">{orders.length} total order</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari order atau nama pelanggan..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s === "SEMUA" ? "Semua Status" : statusConfig[s]?.label ?? s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Memuat data...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">Tidak ada order ditemukan</div>
          ) : (
            <div className="divide-y">
              {filtered.map((order) => {
                const s = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-50 p-2.5 rounded-xl">
                        <Package className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{order.orderNumber}</div>
                        <div className="text-xs text-gray-400">
                          {order.user?.name} · {order.shoeType?.name} × {order.quantity}
                        </div>
                        <div className="text-xs text-gray-300">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-primary-900 text-sm hidden md:block">
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
      </div>
    </div>
  );
}