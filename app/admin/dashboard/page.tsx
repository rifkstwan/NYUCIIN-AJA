"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser } from "@/lib/auth-client";
import { Package, Users, CheckCircle, Clock, TrendingUp, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";

interface Stats {
  totalOrders: number;
  activeOrders: number;
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
  user: { name: string };
  shoeType: { name: string };
}

interface Promo {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  BOOKED:    { label: "Diterima",    color: "bg-blue-100 text-blue-700" },
  PICKUP:    { label: "Pickup",      color: "bg-purple-100 text-purple-700" },
  WASHING:   { label: "Dicuci",      color: "bg-orange-100 text-orange-700" },
  DRYING:    { label: "Dikeringkan", color: "bg-yellow-100 text-yellow-700" },
  DELIVERY:  { label: "Dikirim",     color: "bg-cyan-100 text-cyan-700" },
  DONE:      { label: "Selesai",     color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Dibatalkan",  color: "bg-red-100 text-red-700" },
};

const emptyForm = { title: "", description: "", badge: "", isActive: true, startDate: "", endDate: "" };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [promos,       setPromos]       = useState<Promo[]>([]);
  const [loading,      setLoading]      = useState(true);

  const [showModal,  setShowModal]  = useState(false);
  const [editPromo,  setEditPromo]  = useState<Promo | null>(null);
  const [form,       setForm]       = useState({ ...emptyForm });
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formMsg,    setFormMsg]    = useState("");

  useEffect(() => {
    const token = getToken();
    const user  = getUser();
    if (!token || user?.role !== "ADMIN") { router.push("/auth/login"); return; }
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    try {
      const h = { Authorization: `Bearer ${token}` };

      const [sRes, oRes, pRes] = await Promise.all([
        fetch("/api/admin/stats",          { headers: h }),
        fetch("/api/admin/orders?limit=5", { headers: h }),
        fetch("/api/admin/promos",         { headers: h }),
      ]);

      if (sRes.ok) {
        const s = await sRes.json();
        setStats(s);
      }

      if (oRes.ok) {
        const o = await oRes.json();
        setRecentOrders(o.orders ?? o);
      }

      if (pRes.ok) {
        const p = await pRes.json();
        setPromos(p.promos ?? []);
      }

    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditPromo(null);
    setForm({ ...emptyForm });
    setFormMsg("");
    setShowModal(true);
  };

  const openEdit = (p: Promo) => {
    setEditPromo(p);
    setForm({
      title:       p.title,
      description: p.description ?? "",
      badge:       p.badge       ?? "",
      isActive:    p.isActive,
      startDate:   p.startDate   ? p.startDate.slice(0, 10) : "",
      endDate:     p.endDate     ? p.endDate.slice(0, 10)   : "",
    });
    setFormMsg("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormMsg("Judul promo wajib diisi"); return; }
    setSaving(true);
    setFormMsg("");
    try {
      const token  = getToken();
      const url    = editPromo ? `/api/admin/promos/${editPromo.id}` : "/api/admin/promos";
      const method = editPromo ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate || null,
          endDate:   form.endDate   || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (editPromo) {
          setPromos(prev => prev.map(p => p.id === editPromo.id ? data : p));
        } else {
          setPromos(prev => [data, ...prev]);
        }
        setShowModal(false);
      } else {
        setFormMsg(data.error ?? "Gagal menyimpan");
      }
    } catch {
      setFormMsg("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus promo ini?")) return;
    setDeletingId(id);
    try {
      const token = getToken();
      await fetch(`/api/admin/promos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromos(prev => prev.filter(p => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (promo: Promo) => {
    const token = getToken();
    const res   = await fetch(`/api/admin/promos/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !promo.isActive }),
    });
    if (res.ok) {
      setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, isActive: !p.isActive } : p));
    }
  };

  if (loading) return (
    <div className="py-16 text-center text-gray-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      Memuat data...
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-900">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">Ringkasan bisnis NyuciinAja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Order", value: stats?.totalOrders ?? 0,     icon: <Package className="w-5 h-5" />,     color: "text-primary-600", bg: "bg-primary-50" },
          { label: "Aktif",       value: stats?.activeOrders ?? 0,    icon: <Clock className="w-5 h-5" />,       color: "text-orange-500",  bg: "bg-orange-50" },
          { label: "Selesai",     value: stats?.completedOrders ?? 0, icon: <CheckCircle className="w-5 h-5" />, color: "text-green-500",   bg: "bg-green-50" },
          { label: "Total User",  value: stats?.totalUsers ?? 0,      icon: <Users className="w-5 h-5" />,       color: "text-blue-500",    bg: "bg-blue-50" },
          { label: "Revenue",     value: `Rp ${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}k`, icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">

        {/* Kelola Promo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-primary-900">Kelola Promo</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tampil otomatis di landing page</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 bg-primary-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary-700 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {promos.length === 0 ? (
              <div className="py-10 text-center text-gray-300 text-sm">Belum ada promo</div>
            ) : promos.map(p => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.isActive ? "bg-green-400" : "bg-gray-300"}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{p.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.badge && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                          {p.badge}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{p.isActive ? "Aktif" : "Nonaktif"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                      p.isActive
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                  >
                    {deletingId === p.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Terbaru */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-primary-900">Order Terbaru</h2>
            <Link href="/admin/orders" className="text-xs text-primary-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">Belum ada order</div>
            ) : recentOrders.map(order => {
              const s = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">{order.orderNumber}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {order.user?.name} · {order.shoeType?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 hidden sm:block">
                      Rp {order.totalPrice?.toLocaleString("id-ID")}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal Promo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-primary-900">
                {editPromo ? "Edit Promo" : "Tambah Promo"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formMsg && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{formMsg}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Judul Promo *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Contoh: Diskon 20% Fast Cleaning"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Detail promo..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Badge</label>
                  <input
                    value={form.badge}
                    onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
                    placeholder="PROMO / BARU / HOT"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-primary-600"
                    />
                    <span className="text-sm text-gray-600">Aktifkan</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Mulai (opsional)</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Berakhir (opsional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}