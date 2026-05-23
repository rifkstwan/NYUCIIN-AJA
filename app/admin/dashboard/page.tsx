"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser, logout } from "@/lib/auth-client";
import { Package, Users, CheckCircle, Clock, Shirt, LogOut, TrendingUp } from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || user?.role !== "ADMIN") {
      router.push("/auth/login");
      return;
    }
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats", { headers });
      const statsText = await statsRes.text();
      console.log("STATS:", statsText);
      if (statsText) {
        const statsData = JSON.parse(statsText);
        if (statsRes.ok) setStats(statsData);
        else setError(`Stats error: ${statsData.message}`);
      }

      // Fetch orders
      const ordersRes = await fetch("/api/admin/orders?limit=10", { headers });
      const ordersText = await ordersRes.text();
      console.log("ORDERS:", ordersText);
      if (ordersText) {
        const ordersData = JSON.parse(ordersText);
        if (ordersRes.ok) setRecentOrders(ordersData.orders ?? ordersData);
        else setError(prev => prev + ` Orders error: ${ordersData.message}`);
      }
    } catch (err) {
      console.error("fetchData error:", err);
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-primary-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Shirt className="w-4 h-4" />
            </div>
            <span className="font-bold">CuciSepatu<span className="text-primary-500">.id</span></span>
            <span className="bg-yellow-400 text-primary-900 text-xs font-bold px-2 py-0.5 rounded-full ml-2">ADMIN</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="text-sm text-white font-medium">Dashboard</Link>
            <Link href="/admin/orders" className="text-sm text-blue-200 hover:text-white transition">Orders</Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition">
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary-900">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Ringkasan bisnis CuciSepatu.id</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat data...
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Total Order",  value: stats?.totalOrders ?? 0,    icon: <Package className="w-5 h-5" />,      color: "text-primary-600" },
                { label: "Menunggu",     value: stats?.pendingOrders ?? 0,  icon: <Clock className="w-5 h-5" />,        color: "text-orange-500" },
                { label: "Selesai",      value: stats?.completedOrders ?? 0, icon: <CheckCircle className="w-5 h-5" />, color: "text-green-500" },
                { label: "Total User",   value: stats?.totalUsers ?? 0,     icon: <Users className="w-5 h-5" />,        color: "text-blue-500" },
                { label: "Revenue",      value: `Rp ${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}k`, icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-500" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className={`${s.color} mb-2`}>{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-400 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="font-bold text-primary-900">Order Terbaru</h2>
                <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline">
                  Lihat semua →
                </Link>
              </div>
              <div className="divide-y">
                {recentOrders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">Belum ada order</div>
                ) : recentOrders.map((order) => {
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
                            {order.user?.name} · {order.shoeType?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-primary-900 text-sm hidden sm:block">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}