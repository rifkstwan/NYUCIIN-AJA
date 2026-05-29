"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser } from "@/lib/auth-client";
import {
  Package, Users, CheckCircle, Clock, TrendingUp,
  Plus, Pencil, Trash2, Loader2, X,
  Bell, Eye, EyeOff, Download, Star,
} from "lucide-react";

// ── Types ──
interface Stats { totalOrders: number; activeOrders: number; completedOrders: number; totalUsers: number; totalRevenue: number }
interface RecentOrder { id: string; orderNumber: string; status: string; totalPrice: number; user: { name: string }; shoeType: { name: string } }
interface Promo { id: string; title: string; description?: string; badge?: string; isActive: boolean; startDate?: string; endDate?: string }
interface Service { id: string; name: string; description?: string; basePrice: number; badge?: string; featured: boolean; features: string[]; isActive: boolean }
interface Testimonial { id: string; rating: number; comment?: string; isVisible: boolean; createdAt: string; user: { name: string }; order: { shoeType: { name: string } } }
interface Notif { id: string; title: string; body: string; type: string; isRead: boolean; orderId?: string; createdAt: string }

const statusConfig: Record<string, { label: string; color: string }> = {
  BOOKED:    { label: "Diterima",    color: "bg-blue-100 text-blue-700" },
  PICKUP:    { label: "Pickup",      color: "bg-purple-100 text-purple-700" },
  WASHING:   { label: "Dicuci",      color: "bg-orange-100 text-orange-700" },
  DRYING:    { label: "Dikeringkan", color: "bg-yellow-100 text-yellow-700" },
  DELIVERY:  { label: "Dikirim",     color: "bg-cyan-100 text-cyan-700" },
  DONE:      { label: "Selesai",     color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Dibatalkan",  color: "bg-red-100 text-red-700" },
};

const emptyPromo   = { title: "", description: "", badge: "", isActive: true, startDate: "", endDate: "" };
const emptyService = { name: "", description: "", basePrice: "", badge: "", featured: false, features: "", isActive: true };

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats,        setStats]        = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [promos,       setPromos]       = useState<Promo[]>([]);
  const [services,     setServices]     = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [notifs,       setNotifs]       = useState<Notif[]>([]);
  const [unread,       setUnread]       = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [showNotifs,   setShowNotifs]   = useState(false);
  const [exporting,    setExporting]    = useState<string | null>(null);

  // promo modal
  const [showPromoModal,  setShowPromoModal]  = useState(false);
  const [editPromo,       setEditPromo]       = useState<Promo | null>(null);
  const [promoForm,       setPromoForm]       = useState({ ...emptyPromo });
  const [promoSaving,     setPromoSaving]     = useState(false);
  const [promoDeletingId, setPromoDeletingId] = useState<string | null>(null);
  const [promoMsg,        setPromoMsg]        = useState("");

  // service modal
  const [showServiceModal,  setShowServiceModal]  = useState(false);
  const [editService,       setEditService]       = useState<Service | null>(null);
  const [serviceForm,       setServiceForm]       = useState({ ...emptyService });
  const [serviceSaving,     setServiceSaving]     = useState(false);
  const [serviceDeletingId, setServiceDeletingId] = useState<string | null>(null);
  const [serviceMsg,        setServiceMsg]        = useState("");

  // testimoni
  const [testDeletingId, setTestDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    const user  = getUser();
    if (!token || user?.role !== "ADMIN") { router.push("/auth/login"); return; }
    fetchData(token);
    // poll notifikasi tiap 30 detik
    const interval = setInterval(() => fetchNotifs(token), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifs = useCallback(async (token: string) => {
    const res = await fetch("/api/admin/notifications", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const d = await res.json(); setNotifs(d.notifications); setUnread(d.unreadCount); }
  }, []);

  const fetchData = async (token: string) => {
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [sRes, oRes, pRes, svRes, tRes, nRes] = await Promise.all([
        fetch("/api/admin/stats",          { headers: h }),
        fetch("/api/admin/orders?limit=5", { headers: h }),
        fetch("/api/admin/promos",         { headers: h }),
        fetch("/api/admin/services",       { headers: h }),
        fetch("/api/admin/testimonials",   { headers: h }),
        fetch("/api/admin/notifications",  { headers: h }),
      ]);
      if (sRes.ok)  setStats(await sRes.json());
      if (oRes.ok)  { const o = await oRes.json(); setRecentOrders(o.orders ?? o); }
      if (pRes.ok)  { const p = await pRes.json(); setPromos(p.promos ?? []); }
      if (svRes.ok) { const sv = await svRes.json(); setServices(sv.services ?? []); }
      if (tRes.ok)  { const t = await tRes.json(); setTestimonials(t.reviews ?? []); }
      if (nRes.ok)  { const n = await nRes.json(); setNotifs(n.notifications); setUnread(n.unreadCount); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── NOTIF helpers ──
  const openNotifs = async () => {
    setShowNotifs(true);
    if (unread > 0) {
      const token = getToken();
      await fetch("/api/admin/notifications", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setUnread(0);
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  // ── EXPORT helpers ──
  const handleExport = async (type: string) => {
    setExporting(type);
    const token = getToken();
    const res   = await fetch(`/api/admin/export?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      a.download     = `${type}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(null);
  };

  // ── TESTIMONI helpers ──
  const toggleTestimonial = async (t: Testimonial) => {
    const token = getToken();
    const res   = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isVisible: !t.isVisible }),
    });
    if (res.ok) setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, isVisible: !x.isVisible } : x));
  };
  const handleDeleteTest = async (id: string) => {
    if (!confirm("Hapus testimoni ini?")) return;
    setTestDeletingId(id);
    const token = getToken();
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setTestimonials(prev => prev.filter(x => x.id !== id));
    setTestDeletingId(null);
  };

  // ── PROMO helpers ──
  const openCreatePromo = () => { setEditPromo(null); setPromoForm({ ...emptyPromo }); setPromoMsg(""); setShowPromoModal(true); };
  const openEditPromo   = (p: Promo) => {
    setEditPromo(p);
    setPromoForm({ title: p.title, description: p.description ?? "", badge: p.badge ?? "", isActive: p.isActive, startDate: p.startDate?.slice(0,10) ?? "", endDate: p.endDate?.slice(0,10) ?? "" });
    setPromoMsg(""); setShowPromoModal(true);
  };
  const handleSavePromo = async () => {
    if (!promoForm.title.trim()) { setPromoMsg("Judul promo wajib diisi"); return; }
    setPromoSaving(true); setPromoMsg("");
    try {
      const token = getToken();
      const url   = editPromo ? `/api/admin/promos/${editPromo.id}` : "/api/admin/promos";
      const res   = await fetch(url, { method: editPromo ? "PATCH" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...promoForm, startDate: promoForm.startDate || null, endDate: promoForm.endDate || null }) });
      const data  = await res.json();
      if (res.ok) { setPromos(prev => editPromo ? prev.map(p => p.id === editPromo.id ? data : p) : [data, ...prev]); setShowPromoModal(false); }
      else setPromoMsg(data.error ?? "Gagal menyimpan");
    } catch { setPromoMsg("Gagal menyimpan"); }
    finally { setPromoSaving(false); }
  };
  const handleDeletePromo = async (id: string) => {
    if (!confirm("Hapus promo ini?")) return;
    setPromoDeletingId(id);
    await fetch(`/api/admin/promos/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setPromos(prev => prev.filter(p => p.id !== id));
    setPromoDeletingId(null);
  };
  const togglePromo = async (p: Promo) => {
    const res = await fetch(`/api/admin/promos/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ isActive: !p.isActive }) });
    if (res.ok) setPromos(prev => prev.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
  };

  // ── SERVICE helpers ──
  const openCreateService = () => { setEditService(null); setServiceForm({ ...emptyService }); setServiceMsg(""); setShowServiceModal(true); };
  const openEditService   = (s: Service) => {
    setEditService(s);
    setServiceForm({ name: s.name, description: s.description ?? "", basePrice: String(s.basePrice), badge: s.badge ?? "", featured: s.featured ?? false, features: (s.features ?? []).join("\n"), isActive: s.isActive ?? true });
    setServiceMsg(""); setShowServiceModal(true);
  };
  const handleSaveService = async () => {
    if (!serviceForm.name.trim() || !serviceForm.basePrice) { setServiceMsg("Nama dan harga wajib diisi"); return; }
    setServiceSaving(true); setServiceMsg("");
    try {
      const token    = getToken();
      const url      = editService ? `/api/admin/services/${editService.id}` : "/api/admin/services";
      const features = serviceForm.features.split("\n").map(f => f.trim()).filter(Boolean);
      const res      = await fetch(url, { method: editService ? "PATCH" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...serviceForm, basePrice: Number(serviceForm.basePrice), features }) });
      const data     = await res.json();
      if (res.ok) { setServices(prev => editService ? prev.map(s => s.id === editService.id ? data : s) : [data, ...prev]); setShowServiceModal(false); }
      else setServiceMsg(data.error ?? "Gagal menyimpan");
    } catch { setServiceMsg("Gagal menyimpan"); }
    finally { setServiceSaving(false); }
  };
  const handleDeleteService = async (id: string) => {
    if (!confirm("Hapus layanan ini?")) return;
    setServiceDeletingId(id);
    await fetch(`/api/admin/services/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setServices(prev => prev.filter(s => s.id !== id));
    setServiceDeletingId(null);
  };
  const toggleService = async (s: Service) => {
    const res = await fetch(`/api/admin/services/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ isActive: !s.isActive }) });
    if (res.ok) setServices(prev => prev.map(x => x.id === s.id ? { ...x, isActive: !x.isActive } : x));
  };

  if (loading) return (
    <div className="py-16 text-center text-gray-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      Memuat data...
    </div>
  );

  return (
    <div>
      {/* Header + Notif + Export */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Ringkasan bisnis NyuciinAja</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Export */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 hidden group-hover:block w-40">
              <button onClick={() => handleExport('orders')} disabled={exporting === 'orders'} className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50">
                {exporting === 'orders' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />} Data Order (CSV)
              </button>
              <button onClick={() => handleExport('revenue')} disabled={exporting === 'revenue'} className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50">
                {exporting === 'revenue' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />} Data Revenue (CSV)
              </button>
            </div>
          </div>

          {/* Notifikasi */}
          <div className="relative">
            <button onClick={openNotifs} className="relative p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-600">
              <Bell className="w-4.5 h-4.5 w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-30">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-primary-900">Notifikasi</span>
                  <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifs.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">Belum ada notifikasi</div>
                  ) : notifs.map(n => (
                    <div key={n.id} className={`px-4 py-3 ${!n.isRead ? "bg-primary-50" : ""}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-primary-500" : "bg-gray-300"}`} />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Order", value: stats?.totalOrders     ?? 0, icon: <Package className="w-5 h-5" />,     color: "text-primary-600", bg: "bg-primary-50" },
          { label: "Aktif",       value: stats?.activeOrders    ?? 0, icon: <Clock className="w-5 h-5" />,       color: "text-orange-500",  bg: "bg-orange-50" },
          { label: "Selesai",     value: stats?.completedOrders ?? 0, icon: <CheckCircle className="w-5 h-5" />, color: "text-green-500",   bg: "bg-green-50" },
          { label: "Total User",  value: stats?.totalUsers      ?? 0, icon: <Users className="w-5 h-5" />,       color: "text-blue-500",    bg: "bg-blue-50" },
          { label: "Revenue",     value: `Rp ${((stats?.totalRevenue ?? 0)/1000).toFixed(0)}k`, icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1 — Promo + Layanan */}
      <div className="grid md:grid-cols-2 gap-5 mb-5">

        {/* Kelola Promo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-primary-900">Kelola Promo</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tampil otomatis di landing page</p>
            </div>
            <button onClick={openCreatePromo} className="flex items-center gap-1.5 bg-primary-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary-700 transition">
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
                      {p.badge && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">{p.badge}</span>}
                      <span className="text-xs text-gray-400">{p.isActive ? "Aktif" : "Nonaktif"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <button onClick={() => togglePromo(p)} className={`px-2 py-1 rounded-lg text-xs font-medium transition ${p.isActive ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                    {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button onClick={() => openEditPromo(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeletePromo(p.id)} disabled={promoDeletingId === p.id} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50">
                    {promoDeletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kelola Layanan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-primary-900">Kelola Layanan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Harga & paket tampil di landing page</p>
            </div>
            <button onClick={openCreateService} className="flex items-center gap-1.5 bg-primary-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary-700 transition">
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {services.length === 0 ? (
              <div className="py-10 text-center text-gray-300 text-sm">Belum ada layanan</div>
            ) : services.map(s => (
              <div key={s.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.isActive ? "bg-green-400" : "bg-gray-300"}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{s.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-primary-600">Rp {s.basePrice.toLocaleString('id-ID')}</span>
                      {s.badge    && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-medium">{s.badge}</span>}
                      {s.featured && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Featured</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <button onClick={() => toggleService(s)} className={`px-2 py-1 rounded-lg text-xs font-medium transition ${s.isActive ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                    {s.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button onClick={() => openEditService(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteService(s.id)} disabled={serviceDeletingId === s.id} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50">
                    {serviceDeletingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 — Testimoni */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-primary-900">Kelola Testimoni</h2>
            <p className="text-xs text-gray-400 mt-0.5">Review ≥4 bintang yang diaktifkan tampil di landing page</p>
          </div>
          <span className="text-xs text-gray-400">{testimonials.filter(t => t.isVisible).length} aktif / {testimonials.length} total</span>
        </div>
        <div className="divide-y divide-gray-50">
          {testimonials.length === 0 ? (
            <div className="py-10 text-center text-gray-300 text-sm">Belum ada testimoni</div>
          ) : testimonials.slice(0, 8).map(t => (
            <div key={t.id} className={`flex items-center justify-between px-6 py-3.5 ${!t.isVisible ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(t.user.name ?? "P").slice(0,2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{t.user.name}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                    {t.order.shoeType.name} — {t.comment ? `"${t.comment.slice(0,60)}${t.comment.length > 60 ? '…' : ''}"` : "Tanpa komentar"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                <button onClick={() => toggleTestimonial(t)} className={`p-1.5 rounded-lg transition ${t.isVisible ? "hover:bg-gray-100 text-gray-400 hover:text-gray-600" : "hover:bg-green-50 text-gray-300 hover:text-green-600"}`} title={t.isVisible ? "Sembunyikan" : "Tampilkan"}>
                  {t.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => handleDeleteTest(t.id)} disabled={testDeletingId === t.id} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50">
                  {testDeletingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3 — Order Terbaru */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-primary-900">Order Terbaru</h2>
          <Link href="/admin/orders" className="text-xs text-primary-600 hover:underline">Lihat semua →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">Belum ada order</div>
          ) : recentOrders.map(order => {
            const s = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
            return (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition">
                <div>
                  <div className="text-sm font-medium text-gray-800">{order.orderNumber}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{order.user?.name} · {order.shoeType?.name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 hidden sm:block">Rp {order.totalPrice?.toLocaleString("id-ID")}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Modal Promo ── */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-primary-900">{editPromo ? "Edit Promo" : "Tambah Promo"}</h2>
              <button onClick={() => setShowPromoModal(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {promoMsg && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{promoMsg}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Judul Promo *</label>
                <input value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} placeholder="Contoh: Diskon 20% Fast Cleaning" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Deskripsi</label>
                <textarea value={promoForm.description} onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))} placeholder="Detail promo..." rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Badge</label>
                  <input value={promoForm.badge} onChange={e => setPromoForm(p => ({ ...p, badge: e.target.value }))} placeholder="PROMO / BARU / HOT" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={promoForm.isActive} onChange={e => setPromoForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
                    <span className="text-sm text-gray-600">Aktifkan</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Mulai</label>
                  <input type="date" value={promoForm.startDate} onChange={e => setPromoForm(p => ({ ...p, startDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Berakhir</label>
                  <input type="date" value={promoForm.endDate} onChange={e => setPromoForm(p => ({ ...p, endDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowPromoModal(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleSavePromo} disabled={promoSaving} className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                {promoSaving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Layanan ── */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-primary-900">{editService ? "Edit Layanan" : "Tambah Layanan"}</h2>
              <button onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {serviceMsg && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{serviceMsg}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Layanan *</label>
                <input value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))} placeholder="Contoh: Deep Cleaning" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Deskripsi</label>
                <textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))} placeholder="Penjelasan singkat layanan..." rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Harga (Rp) *</label>
                  <input type="number" value={serviceForm.basePrice} onChange={e => setServiceForm(p => ({ ...p, basePrice: e.target.value }))} placeholder="25000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Badge</label>
                  <input value={serviceForm.badge} onChange={e => setServiceForm(p => ({ ...p, badge: e.target.value }))} placeholder="Terpopuler / Baru" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Fitur <span className="font-normal text-gray-400">(satu per baris)</span></label>
                <textarea value={serviceForm.features} onChange={e => setServiceForm(p => ({ ...p, features: e.target.value }))} placeholder={"Cuci upper & insole\nSikat outsole\nFoto before & after"} rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={serviceForm.featured} onChange={e => setServiceForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm text-gray-600">Featured (highlight hijau)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={serviceForm.isActive} onChange={e => setServiceForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm text-gray-600">Aktif</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowServiceModal(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleSaveService} disabled={serviceSaving} className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                {serviceSaving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay tutup notif */}
      {showNotifs && <div className="fixed inset-0 z-20" onClick={() => setShowNotifs(false)} />}
    </div>
  );
}