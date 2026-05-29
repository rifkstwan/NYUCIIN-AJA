"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Shield, Clock, MapPin, Star, ChevronRight,
  CheckCircle, Truck, Droplets, Wind, Package, ArrowRight,
  Zap, Award, Leaf,
} from "lucide-react";

interface Service {
  id: string; name: string; description?: string;
  basePrice: number; badge?: string; featured: boolean;
  features: string[]; isActive: boolean;
}
interface Promo {
  id: string; title: string; description?: string;
  badge?: string; isActive: boolean;
}

const steps = [
  { icon: <Package className="w-5 h-5" />,  title: "Pesan Online",     desc: "Pilih layanan & jadwal penjemputan lewat aplikasi" },
  { icon: <Truck className="w-5 h-5" />,    title: "Kami Jemput",      desc: "Kurir kami datang ke lokasi kamu tepat waktu" },
  { icon: <Droplets className="w-5 h-5" />, title: "Proses Pencucian", desc: "Sepatu dibersihkan dengan produk premium & aman" },
  { icon: <Wind className="w-5 h-5" />,     title: "Antar Kembali",    desc: "Sepatu bersih & rapi dikirim balik ke rumahmu" },
];

const testimonials = [
  { name: "Rizky A.",  rating: 5, text: "Sepatuku balik kayak baru! Pelayanan cepat dan rapi banget.",        location: "Semarang Tengah" },
  { name: "Dinda P.",  rating: 5, text: "Recommended banget! Harga terjangkau, hasilnya memuaskan.",          location: "Tembalang" },
  { name: "Bima F.",   rating: 5, text: "Tracking real-time-nya keren, bisa pantau status cuci setiap saat.", location: "Banyumanik" },
  { name: "Anisa R.",  rating: 4, text: "Sepatu putihku bersih lagi, padahal udah kuning banget. Top!",       location: "Ngaliyan" },
];

const fallbackServices = [
  {
    name: "Reguler",
    price: 25000,
    badge: "",
    featured: false,
    icon: <Droplets className="w-5 h-5 text-[#16a34a]" />,
    desc: "Cuci bersih standar untuk perawatan rutin sehari-hari.",
    features: ["Cuci upper & insole", "Sikat outsole", "Foto before & after"],
  },
  {
    name: "Deep Cleaning",
    price: 45000,
    badge: "Terpopuler",
    featured: true,
    icon: <Zap className="w-5 h-5 text-[#16a34a]" />,
    desc: "Pembersihan menyeluruh untuk noda membandel & sepatu favorit.",
    features: ["Semua di Reguler", "Whitening upper", "Conditioning sol", "Pengemasan premium"],
  },
  {
    name: "Premium + Repaint",
    price: 85000,
    badge: "",
    featured: false,
    icon: <Award className="w-5 h-5 text-[#16a34a]" />,
    desc: "Restorasi lengkap dengan cat ulang untuk tampilan seperti baru.",
    features: ["Semua di Deep Cleaning", "Cat ulang warna", "Waterproofing", "Garansi 7 hari"],
  },
];

export default function LandingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [promos,   setPromos]   = useState<Promo[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/services").then(r => r.ok ? r.json() : null).then(d => { if (d) setServices(d.services ?? d); }).catch(() => {});
    fetch("/api/promos").then(r => r.ok ? r.json() : null).then(d => { if (d) setPromos((d.promos ?? d).filter((p: Promo) => p.isActive)); }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen font-body" style={{ background: "#f8fafc", color: "#0f172a" }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-xl tracking-tight text-[#0f172a]">
              Nyuciin<span className="text-[#16a34a]">Aja</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {["#layanan", "#cara-kerja", "#promo", "#ulasan"].map((href, i) => (
              <a key={i} href={href}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition">
                {["Layanan", "Cara Kerja", "Promo", "Ulasan"][i]}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block w-px h-5 bg-[#e2e8f0]" />
            <Link href="/auth/login" className="hidden md:block text-sm font-medium text-[#475569] hover:text-[#0f172a] transition px-3 py-1.5">
              Masuk
            </Link>
            <Link href="/auth/register"
              className="text-sm font-semibold px-5 py-2 rounded-lg text-white transition hover:opacity-90"
              style={{ background: "#16a34a" }}>
              Daftar Gratis
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#475569]">
              <div className="w-5 h-0.5 bg-current mb-1" />
              <div className="w-5 h-0.5 bg-current mb-1" />
              <div className="w-5 h-0.5 bg-current" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#e2e8f0] px-4 py-4 flex flex-col gap-2">
            {["#layanan", "#cara-kerja", "#promo", "#ulasan"].map((href, i) => (
              <a key={i} href={href} onClick={() => setMenuOpen(false)}
                className="text-sm text-[#475569] py-1.5 px-2 rounded-lg hover:bg-[#f1f5f9]">
                {["Layanan", "Cara Kerja", "Promo", "Ulasan"][i]}
              </a>
            ))}
            <Link href="/auth/login" className="text-sm text-[#475569] py-1.5 px-2">Masuk</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{ background: "#dcfce7", color: "#14532d" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse flex-shrink-0" />
              Laundry Sepatu #1 di Semarang
            </div>
            <h1 className="font-display font-extrabold leading-tight mb-5"
              style={{ fontSize: "clamp(2rem,5vw,3.375rem)", letterSpacing: "-1.8px", color: "#0f172a" }}>
              Sepatu Kotor?<br />
              <em className="not-italic" style={{ color: "#16a34a" }}>Kami Bersihkan,</em><br />
              Kamu Santai.
            </h1>
            <p className="text-[#475569] mb-8 leading-relaxed max-w-lg" style={{ fontSize: "16.5px" }}>
              Layanan cuci sepatu antar-jemput dengan tracking real-time.
              Bersih maksimal, harga transparan, tanpa keluar rumah.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/auth/register"
                className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-[10px] transition hover:-translate-y-0.5"
                style={{ background: "#16a34a", fontSize: "14.5px", boxShadow: "0 4px 16px rgba(22,163,74,0.28)" }}>
                Pesan Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#layanan"
                className="flex items-center gap-2 font-semibold px-6 py-3 rounded-[10px] border transition hover:border-[#16a34a] hover:text-[#16a34a]"
                style={{ background: "#fff", color: "#0f172a", borderColor: "#e2e8f0", fontSize: "14.5px" }}>
                Lihat Layanan
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              {[
                { icon: <Shield className="w-3.5 h-3.5" />, text: "Produk aman & tersertifikasi" },
                { icon: <Clock className="w-3.5 h-3.5" />,  text: "Estimasi 2–3 hari kerja" },
                { icon: <MapPin className="w-3.5 h-3.5" />, text: "Antar-jemput area Semarang" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[#475569]" style={{ fontSize: "13px" }}>
                  <span className="text-[#16a34a]">{f.icon}</span>
                  {f.text}
                  {i < 2 && <span className="w-1 h-1 rounded-full bg-[#e2e8f0] ml-3" />}
                </div>
              ))}
            </div>
          </div>

          {/* Hero Card */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-7" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08),0 4px 16px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-5">
                <span className="font-display font-bold text-sm text-[#0f172a] flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#16a34a]" /> Status Order Aktif
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#14532d" }}>3 aktif</span>
              </div>
              {[
                { id: "#ORD-2401", name: "Nike Air Force 1",  layanan: "Deep Cleaning",       status: "Dicuci",   statusColor: "#fef9c3", statusText: "#854d0e" },
                { id: "#ORD-2402", name: "Vans Old Skool",    layanan: "Premium + Repaint",    status: "Dijemput", statusColor: "#dbeafe", statusText: "#1e40af" },
                { id: "#ORD-2403", name: "Converse Chuck 70", layanan: "Reguler",              status: "Booking",  statusColor: "#f1f5f9", statusText: "#475569" },
              ].map((o, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#f1f5f9] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#f1f5f9" }}>
                      <Droplets className="w-4 h-4 text-[#475569]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0f172a]">{o.name}</div>
                      <div className="text-xs text-[#475569]">{o.id} · {o.layanan}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: o.statusColor, color: o.statusText }}>{o.status}</span>
                </div>
              ))}
              {/* Track bar */}
              <div className="mt-5 p-3 rounded-xl border border-[#e2e8f0]" style={{ background: "#f8fafc" }}>
                <div className="text-xs font-semibold text-[#475569] uppercase tracking-wide mb-3">Progress Cuci</div>
                <div className="flex items-center gap-1">
                  {["Dijemput", "Dicuci", "Dikeringkan", "Diantar"].map((label, i) => (
                    <div key={i} className="flex items-center gap-1 flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 text-xs ${i <= 1 ? "bg-[#16a34a] border-[#16a34a] text-white" : i === 2 ? "bg-white border-[#16a34a] text-[#16a34a]" : "bg-white border-[#e2e8f0] text-[#e2e8f0]"}`}>
                          {i <= 1 ? <CheckCircle className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>
                        <span className="text-[9px] text-[#475569] text-center leading-tight w-12">{label}</span>
                      </div>
                      {i < 3 && <div className={`flex-1 h-0.5 mb-4 ${i < 2 ? "bg-[#16a34a]" : "bg-[#e2e8f0]"}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-10 border-y border-[#e2e8f0]" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: "2.000+", label: "Sepatu Dicuci" },
            { value: "500+",   label: "Pelanggan Puas" },
            { value: "4.9★",   label: "Rating Google" },
            { value: "100%",   label: "Antar-Jemput" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display font-extrabold text-3xl text-[#16a34a]">{s.value}</div>
              <div className="text-sm text-[#475569] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LAYANAN ── */}
      <section id="layanan" className="py-20 px-4" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ background: "#dcfce7", color: "#14532d" }}>Layanan Kami</span>
            <h2 className="font-display font-extrabold text-[#0f172a] mb-3" style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.8px" }}>
              Pilih Paket yang Tepat
            </h2>
            <p className="text-[#475569] text-sm max-w-md mx-auto leading-relaxed">Semua paket sudah termasuk antar-jemput gratis area Semarang</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services.length > 0
              ? services.filter(s => s.isActive).map(s => ({
                  name: s.name, price: s.basePrice, badge: s.badge ?? "",
                  featured: s.featured, features: s.features, desc: s.description ?? "",
                  icon: <Droplets className="w-5 h-5 text-[#16a34a]" />,
                }))
              : fallbackServices
            ).map((s, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-7 border transition hover:shadow-lg"
                style={{ borderColor: s.featured ? "#16a34a" : "#e2e8f0", boxShadow: s.featured ? "0 0 0 1px #16a34a" : undefined }}>
                {s.badge && (
                  <span className="absolute -top-3 left-5 text-[10.5px] font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: "#ea580c" }}>{s.badge}</span>
                )}
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-4" style={{ background: "#dcfce7" }}>
                  {s.icon}
                </div>
                <h3 className="font-display font-bold text-[#0f172a] mb-2" style={{ fontSize: "17px" }}>{s.name}</h3>
                {s.desc && <p className="text-[#475569] text-sm leading-relaxed mb-4">{s.desc}</p>}
                <ul className="space-y-1.5 mb-5">
                  {s.features.map((f: string, j: number) => (
                    <li key={j} className="flex items-center gap-2 text-[#475569]" style={{ fontSize: "12.5px" }}>
                      <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#e2e8f0]">
                  <div>
                    <span className="font-display font-extrabold text-[#0f172a]" style={{ fontSize: "24px" }}>
                      Rp {s.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-[#475569] ml-1">/ pasang</span>
                  </div>
                  <Link href="/auth/register"
                    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition hover:bg-[#16a34a] hover:text-white hover:border-[#16a34a]"
                    style={{ borderColor: "#e2e8f0", color: "#0f172a" }}>
                    Pilih <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section id="cara-kerja" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ background: "#dcfce7", color: "#14532d" }}>Cara Kerja</span>
            <h2 className="font-display font-extrabold text-[#0f172a]" style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.8px" }}>
              Mudah dalam 4 Langkah
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-13 h-13 rounded-full flex items-center justify-center font-display font-extrabold text-lg text-white mx-auto mb-4"
                  style={{ width: 52, height: 52, background: "#16a34a" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "#f1f5f9" }}>
                  <span className="text-[#475569]">{s.icon}</span>
                </div>
                <h3 className="font-display font-bold text-[#0f172a] mb-2" style={{ fontSize: "15px" }}>{s.title}</h3>
                <p className="text-[#475569] leading-snug" style={{ fontSize: "13px" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO ── */}
      {promos.length > 0 && (
        <section id="promo" className="py-20 px-4" style={{ background: "#f8fafc" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ background: "#dcfce7", color: "#14532d" }}>Penawaran Spesial</span>
              <h2 className="font-display font-extrabold text-[#0f172a]" style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.8px" }}>
                Promo Aktif
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {promos.map(p => (
                <div key={p.id} className="rounded-2xl p-6 text-white" style={{ background: "#0f172a" }}>
                  {p.badge && (
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
                      style={{ background: "#ea580c" }}>{p.badge}</span>
                  )}
                  <h3 className="font-display font-bold text-xl mb-2">{p.title}</h3>
                  {p.description && <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ULASAN ── */}
      <section id="ulasan" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ background: "#dcfce7", color: "#14532d" }}>Testimoni</span>
            <h2 className="font-display font-extrabold text-[#0f172a]" style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.8px" }}>
              Kata Pelanggan Kami
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] hover:shadow-md transition">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(j => (
                    <Star key={j} className={`w-3.5 h-3.5 ${j <= t.rating ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#e2e8f0]"}`} />
                  ))}
                </div>
                <p className="text-sm text-[#475569] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: "#dcfce7", color: "#14532d" }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0f172a]">{t.name}</div>
                    <div className="text-xs text-[#475569] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {t.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl px-8 py-14 text-center text-white" style={{ background: "#0f172a" }}>
            <h2 className="font-display font-extrabold mb-3" style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.7px" }}>
              Siap Punya Sepatu Bersih Lagi?
            </h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: "#94a3b8", fontSize: "15px" }}>
              Daftar gratis dan langsung buat pesanan pertamamu. Antar-jemput gratis area Semarang!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/auth/register"
                className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-[10px] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9]"
                style={{ background: "#fff", color: "#0f172a", fontSize: "14.5px" }}>
                Daftar Gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login"
                className="flex items-center gap-2 font-medium px-7 py-3.5 rounded-[10px] border transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "14.5px" }}>
                Sudah Punya Akun
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-[#e2e8f0] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-extrabold text-lg text-[#0f172a] tracking-tight">
            Nyuciin<span className="text-[#16a34a]">Aja</span>
          </span>
          <p className="text-xs text-[#475569]">© 2024 NyuciinAja. Laundry sepatu online terpercaya di Semarang.</p>
          <div className="flex gap-5">
            <Link href="/auth/login"    className="text-xs text-[#475569] hover:text-[#0f172a] transition">Masuk</Link>
            <Link href="/auth/register" className="text-xs text-[#475569] hover:text-[#0f172a] transition">Daftar</Link>
            <Link href="/dashboard"     className="text-xs text-[#475569] hover:text-[#0f172a] transition">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}