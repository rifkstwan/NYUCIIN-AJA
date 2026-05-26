"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth-client";
import { TrendingUp, Package, CheckCircle, XCircle, Users } from "lucide-react";

interface Stats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface MonthlyRevenue { month: string; revenue: number }
interface ServiceRevenue { name: string; revenue: number; count: number }

export default function AdminRevenuePage() {
  const router = useRouter();
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [monthly,   setMonthly]   = useState<MonthlyRevenue[]>([]);
  const [byService, setByService] = useState<ServiceRevenue[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const token = getToken();
    const user  = getUser();
    if (!token || user?.role !== "ADMIN") { router.push("/auth/login"); return; }
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [s, r]  = await Promise.all([
        fetch("/api/admin/stats",   { headers }).then(r => r.json()),
        fetch("/api/admin/revenue", { headers }).then(r => r.json()),
      ]);
      setStats(s);
      setMonthly(r.monthly   ?? []);
      setByService(r.byService ?? []);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...monthly.map(m => m.revenue), 1);

  if (loading) return (
    <div className="py-16 text-center text-gray-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      Memuat data...
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Revenue & Statistik</h1>
        <p className="text-gray-400 text-sm mt-1">Ringkasan performa bisnis CuciSepatu.id</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Revenue",
            value: `Rp ${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}k`,
            icon: <TrendingUp className="w-5 h-5" />,
            color: "text-primary-600",
            bg: "bg-primary-50",
          },
          {
            label: "Total Order",
            value: stats?.totalOrders ?? 0,
            icon: <Package className="w-5 h-5" />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Order Selesai",
            value: stats?.completedOrders ?? 0,
            icon: <CheckCircle className="w-5 h-5" />,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Order Aktif",
            value: stats?.activeOrders ?? 0,
            icon: <Package className="w-5 h-5" />,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            label: "Dibatalkan",
            value: stats?.cancelledOrders ?? 0,
            icon: <XCircle className="w-5 h-5" />,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Total Pelanggan",
            value: stats?.totalUsers ?? 0,
            icon: <Users className="w-5 h-5" />,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className={`${s.bg} ${s.color} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        {/* Revenue per Bulan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-primary-900">Revenue per Bulan</h2>
            <p className="text-xs text-gray-400 mt-0.5">6 bulan terakhir (order selesai)</p>
          </div>
          <div className="px-6 py-5">
            {monthly.every(m => m.revenue === 0) ? (
              <p className="text-sm text-gray-300 italic text-center py-8">Belum ada data revenue</p>
            ) : (
              <div className="space-y-3">
                {monthly.map(m => (
                  <div key={m.month}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{m.month}</span>
                      <span className="font-medium text-gray-900">
                        Rp {m.revenue.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Revenue per Layanan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-primary-900">Revenue per Layanan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Berdasarkan order yang selesai</p>
          </div>
          <div className="px-6 py-5">
            {byService.length === 0 ? (
              <p className="text-sm text-gray-300 italic text-center py-8">Belum ada data</p>
            ) : (
              <div className="space-y-4">
                {byService.map((s, i) => {
                  const maxSvc = Math.max(...byService.map(b => b.revenue), 1);
                  const colors = [
                    "bg-primary-500", "bg-blue-500", "bg-purple-500",
                    "bg-orange-500", "bg-cyan-500",
                  ];
                  return (
                    <div key={s.name}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-medium text-gray-700">{s.name}</span>
                        <span className="text-gray-400">{s.count} order · <span className="font-medium text-gray-900">Rp {s.revenue.toLocaleString("id-ID")}</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                          style={{ width: `${(s.revenue / maxSvc) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}