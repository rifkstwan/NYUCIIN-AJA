"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Shield, Clock, MapPin, Star, ChevronRight,
  CheckCircle, Truck, Droplets, Wind, Package, ArrowRight,
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
  { icon: <Package className="w-6 h-6" />,  title: "Pesan Online",     desc: "Pilih layanan & jadwal penjemputan lewat aplikasi" },
  { icon: <Truck className="w-6 h-6" />,    title: "Kami Jemput",      desc: "Kurir kami datang ke lokasi kamu tepat waktu" },
  { icon: <Droplets className="w-6 h-6" />, title: "Proses Pencucian", desc: "Sepatu dibersihkan dengan produk premium & aman" },
  { icon: <Wind className="w-6 h-6" />,     title: "Antar Kembali",    desc: "Sepatu bersih & rapi dikirim balik ke rumahmu" },
];

const testimonials = [
  { name: "Rizky A.",  rating: 5, text: "Sepatuku balik kayak baru! Pelayanan cepat dan rapi banget.",        location: "Semarang Tengah" },
  { name: "Dinda P.",  rating: 5, text: "Recommended banget! Harga terjangkau, hasilnya memuaskan.",          location: "Tembalang" },
  { name: "Bima F.",   rating: 5, text: "Tracking real-time-nya keren, bisa pantau status cuci setiap saat.", location: "Banyumanik" },
  { name: "Anisa R.",  rating: 4, text: "Sepatu putihku bersih lagi, padahal udah kuning banget. Top!",       location: "Ngaliyan" },
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
    <div className="min-h-screen bg-white font-body">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 text-lg">NyuciinAja</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#layanan"    className="text-sm text-gray-500 hover:text-gray-900 transition">Layanan</a>
            <a href="#cara-kerja" className="text-sm text-gray-500 hover:text-gray-900 transition">Cara Kerja</a>
            <a href="#promo"      className="text-sm text-gray-500 hover:text-gray-900 transition">Promo</a>
            <a href="#ulasan"     className="text-sm text-gray-500 hover:text-gray-900 transition">Ulasan</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden md:block text-sm text-gray-600 hover:text-gray-900 transition font-medium">Masuk</Link>
            <Link href="/auth/register" className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              Mulai Sekarang
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-500">
              <div className="w-5 h-0.5 bg-current mb-1" />
              <div className="w-5 h-0.5 bg-current mb-1" />
              <div className="w-5 h-0.5 bg-current" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
            <a href="#layanan"    onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 py-1">Layanan</a>
            <a href="#cara-kerja" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 py-1">Cara Kerja</a>
            <a href="#promo"      onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 py-1">Promo</a>
            <a href="#ulasan"     onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 py-1">Ulasan</a>
            <Link href="/auth/login" className="text-sm text-gray-600 py-1">Masuk</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Laundry Sepatu #1 di Semarang
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Sepatu Kotor?<br />
              <span className="text-cyan-500">Kami Bersihkan,</span><br />
              Kamu Santai.
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              Layanan cuci sepatu antar-jemput dengan tracking real-time.
              Bersih maksimal, harga transparan, tanpa keluar rumah.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3.5 rounded-2xl transition text-sm">
                Pesan Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#layanan" className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-medium px-6 py-3.5 rounded-2xl transition text-sm">
                Lihat Layanan
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-10">
              {[
                { icon: <Shield className="w-4 h-4" />, text: "Produk aman & tersertifikasi" },
                { icon: <Clock className="w-4 h-4" />,  text: "Estimasi 2–3 hari kerja" },
                { icon: <MapPin className="w-4 h-4" />, text: "Antar-jemput area Semarang" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                  <span className="text-cyan-500">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: "2.000+", label: "Sepatu Dicuci" },
            { value: "500+",   label: "Pelanggan Puas" },
            { value: "4.9★",   label: "Rating Google" },
            { value: "100%",   label: "Antar-Jemput" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl font-extrabold text-cyan-600">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LAYANAN ── */}
      <section id="layanan" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-cyan-600 text-sm font-semibold uppercase tracking-wider mb-2">Layanan Kami</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-gray-900">Pilih Paket yang Tepat</h2>
          </div>
          {services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.filter(s => s.isActive).map(s => (
                <div key={s.id} className={`relative rounded-3xl p-6 border transition hover:shadow-lg ${
                  s.featured ? "bg-cyan-600 text-white border-cyan-600" : "bg-white border-gray-100"
                }`}>
                  {s.badge && (
                    <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full ${
                      s.featured ? "bg-white/20 text-white" : "bg-cyan-50 text-cyan-700"
                    }`}>{s.badge}</span>
                  )}
                  <div className={`text-3xl font-display font-extrabold mb-1 ${s.featured ? "text-white" : "text-cyan-600"}`}>
                    Rp {s.basePrice.toLocaleString("id-ID")}
                  </div>
                  <div className={`text-xs mb-4 ${s.featured ? "text-cyan-100" : "text-gray-400"}`}>per pasang</div>
                  <h3 className={`font-display font-bold text-xl mb-2 ${s.featured ? "text-white" : "text-gray-900"}`}>{s.name}</h3>
                  {s.description && <p className={`text-sm mb-5 leading-relaxed ${s.featured ? "text-cyan-100" : "text-gray-400"}`}>{s.description}</p>}
                  <ul className="space-y-2 mb-6">
                    {s.features.map((f, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm ${s.featured ? "text-cyan-50" : "text-gray-600"}`}>
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.featured ? "text-white" : "text-cyan-500"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition ${
                    s.featured ? "bg-white text-cyan-700 hover:bg-cyan-50" : "bg-cyan-500 text-white hover:bg-cyan-600"
                  }`}>
                    Pilih Paket <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Fast Cleaning",  price: 25000, badge: "Terpopuler",  featured: false, features: ["Cuci upper & insole", "Sikat outsole", "Foto before & after"] },
                { name: "Deep Cleaning",  price: 45000, badge: "Recommended", featured: true,  features: ["Semua di Fast Cleaning", "Whitening upper", "Conditioning sol", "Pengemasan premium"] },
                { name: "Express 1 Hari", price: 65000, badge: "Ekspres",      featured: false, features: ["Proses dalam 24 jam", "Prioritas antar-jemput", "Notifikasi real-time"] },
              ].map((s, i) => (
                <div key={i} className={`relative rounded-3xl p-6 border transition hover:shadow-lg ${
                  s.featured ? "bg-cyan-600 text-white border-cyan-600" : "bg-white border-gray-100"
                }`}>
                  <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full ${
                    s.featured ? "bg-white/20 text-white" : "bg-cyan-50 text-cyan-700"
                  }`}>{s.badge}</span>
                  <div className={`text-3xl font-display font-extrabold mb-1 ${s.featured ? "text-white" : "text-cyan-600"}`}>
                    Rp {s.price.toLocaleString("id-ID")}
                  </div>
                  <div className={`text-xs mb-4 ${s.featured ? "text-cyan-100" : "text-gray-400"}`}>per pasang</div>
                  <h3 className={`font-display font-bold text-xl mb-5 ${s.featured ? "text-white" : "text-gray-900"}`}>{s.name}</h3>
                  <ul className="space-y-2 mb-6">
                    {s.features.map((f, j) => (
                      <li key={j} className={`flex items-start gap-2 text-sm ${s.featured ? "text-cyan-50" : "text-gray-600"}`}>
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.featured ? "text-white" : "text-cyan-500"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition ${
                    s.featured ? "bg-white text-cyan-700 hover:bg-cyan-50" : "bg-cyan-500 text-white hover:bg-cyan-600"
                  }`}>
                    Pilih Paket <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section id="cara-kerja" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-cyan-600 text-sm font-semibold uppercase tracking-wider mb-2">Cara Kerja</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-gray-900">Mudah dalam 4 Langkah</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-4">{s.icon}</div>
                <div className="text-xs font-bold text-gray-300 mb-1">0{i + 1}</div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO ── */}
      {promos.length > 0 && (
        <section id="promo" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <p className="text-cyan-600 text-sm font-semibold uppercase tracking-wider mb-2">Penawaran Spesial</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-gray-900">Promo Aktif</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {promos.map(p => (
                <div key={p.id} className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-3xl p-6 text-white">
                  {p.badge && (
                    <span className="inline-block bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">{p.badge}</span>
                  )}
                  <h3 className="font-display font-bold text-xl mb-2">{p.title}</h3>
                  {p.description && <p className="text-cyan-100 text-sm leading-relaxed">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ULASAN ── */}
      <section id="ulasan" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-cyan-600 text-sm font-semibold uppercase tracking-wider mb-2">Testimoni</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-gray-900">Kata Pelanggan Kami</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{t.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-cyan-600 rounded-3xl px-8 py-14 text-center text-white">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4">Siap Punya Sepatu Bersih Lagi?</h2>
            <p className="text-cyan-100 mb-8 max-w-md mx-auto">Daftar gratis dan langsung buat pesanan pertamamu. Antar-jemput gratis area Semarang!</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/auth/register" className="flex items-center gap-2 bg-white text-cyan-700 font-semibold px-7 py-3.5 rounded-2xl hover:bg-cyan-50 transition">
                Daftar Gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="flex items-center gap-2 border border-white/30 text-white font-medium px-7 py-3.5 rounded-2xl hover:bg-white/10 transition">
                Sudah Punya Akun
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-gray-900">NyuciinAja</span>
          </div>
          <p className="text-xs text-gray-400">© 2024 NyuciinAja. Laundry sepatu online terpercaya di Semarang.</p>
          <div className="flex gap-5">
            <Link href="/auth/login"    className="text-xs text-gray-400 hover:text-gray-600 transition">Masuk</Link>
            <Link href="/auth/register" className="text-xs text-gray-400 hover:text-gray-600 transition">Daftar</Link>
            <Link href="/dashboard"     className="text-xs text-gray-400 hover:text-gray-600 transition">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}