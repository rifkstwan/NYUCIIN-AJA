"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser, logout } from "@/lib/auth-client";
import { 
  Package, Plus, LogOut, Shirt, 
  Clock, CheckCircle, Truck, XCircle 
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: { serviceName: string; quantity: number }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: "Menunggu",   color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
  CONFIRMED:  { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700",   icon: <CheckCircle className="w-3 h-3" /> },
  PICKUP:     { label: "Pickup",     color: "bg-purple-100 text-purple-700", icon: <Truck className="w-3 h-3" /> },
  PROCESSING: { label: "Diproses",   color: "bg-orange-100 text-orange-700", icon: <Package className="w-3 h-3" /> },
  DELIVERY:   { label: "Dikirim",    color: "bg-indigo-100 text-indigo-700", icon: <Truck className="w-3 h-3" /> },
  COMPLETED:  { label: "Selesai",    color: "bg-green-100 text-green-700",   icon: <CheckCircle className="w-3 h-3" /> },
  CANCELLED:  { label: "Dibatalkan", color: "bg-red-100 text-red-700",       icon: <XCircle className="w-3 h-3" /> },
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

useEffect(() => {
  const token = getToken();
  if (!token) { router.push("/auth/login"); return; }

  setUser(getUser()); // ← tambahkan ini

  fetchOrders(token);
}, []);

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const stats = {
    total: orders.length,
    active: orders.filter(o => !["COMPLETED", "CANCELLED"].includes(o.status)).length,
    completed: orders.filter(o => o.status === "COMPLETED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Shirt className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-primary-900">CuciSepatu<span className="text-primary-500">.id</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Halo, <strong>{user?.name}</strong></span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Dashboard</h1>
            <p className="text-gray-400 text-sm">Kelola pesanan cuci sepatumu</p>
          </div>
          <Link
            href="/dashboard/orders/new"
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Order Baru</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Order", value: stats.total, color: "text-primary-600" },
            { label: "Order Aktif", value: stats.active, color: "text-orange-500" },
            { label: "Selesai", value: stats.completed, color: "text-green-500" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Order List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-primary-900">Riwayat Order</h2>
            <span className="text-sm text-gray-400">{orders.length} order</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Memuat data...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">👟</div>
              <p className="text-gray-400 mb-4">Belum ada order</p>
              <Link
                href="/dashboard/orders/new"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition"
              >
                <Plus className="w-4 h-4" /> Buat Order Pertama
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => {
                const s = statusConfig[order.status] || statusConfig.PENDING;
                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-50 p-2.5 rounded-xl">
                        <Package className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{order.orderNumber}</div>
                        <div className="text-sm text-gray-400">
                          {order.items?.[0]?.serviceName || "Cuci Sepatu"} •{" "}
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-primary-900 hidden sm:block">
                        Rp {order.totalPrice.toLocaleString("id-ID")}
                      </span>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>
                        {s.icon} {s.label}
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