"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #e2e8f0",
    }}>
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Nyuciin Aja"
            width={48}
            height={48}
            className="w-12 h-12 object-contain"
            priority
          />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Nyuciin<span style={{ color: "#16a34a" }}>Aja</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Layanan", href: "#services" },
            { label: "Cara Kerja", href: "#how-it-works" },
            { label: "Ulasan", href: "#testimonials" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13.5, fontWeight: 500, color: "#475569" }}
              className="hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              {item.label}
            </a>
          ))}
          <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 8px" }} />
          <Link
            href="/auth/login"
            style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, color: "#475569" }}
            className="hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, background: "#16a34a", color: "#fff", marginLeft: 4 }}
            className="hover:bg-green-700 transition-all"
          >
            Daftar Gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-2">
          <a href="#services" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Layanan</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cara Kerja</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Ulasan</a>
          <hr className="border-slate-100 my-1" />
          <Link href="/auth/login" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Masuk</Link>
          <Link href="/auth/register" className="px-3 py-2.5 rounded-lg text-sm font-semibold bg-green-600 text-white text-center hover:bg-green-700">Daftar Gratis</Link>
        </div>
      )}
    </nav>
  );
}