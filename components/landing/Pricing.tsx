import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Clock } from "lucide-react";

const perks = [
  { icon: <Sparkles className="w-4 h-4" />, text: "Diskon 20% pesanan pertama" },
  { icon: <Shield className="w-4 h-4" />,   text: "Garansi uang kembali" },
  { icon: <Clock className="w-4 h-4" />,    text: "Selesai dalam 24 jam" },
];

export default function Pricing() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 88px" }}>
      <div
        style={{
          background: "#0f172a",
          borderRadius: 28,
          padding: "64px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 260, height: 260, borderRadius: "50%",
          background: "rgba(22,163,74,0.12)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(22,163,74,0.07)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(22,163,74,0.15)", color: "#86efac",
            fontSize: 12, fontWeight: 600,
            padding: "5px 14px", borderRadius: 999, marginBottom: 24,
            border: "1px solid rgba(134,239,172,0.2)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#4ade80", display: "inline-block",
            }} />
            Penawaran Terbatas
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 800, letterSpacing: "-1px",
            color: "#fff", marginBottom: 16, lineHeight: 1.15,
          }}>
            Sepatumu Kotor?<br />
            <span style={{ color: "#4ade80" }}>Yuk Nyuciin Aja.</span>
          </h2>

          <p style={{
            fontSize: 15.5, color: "#94a3b8",
            marginBottom: 36, lineHeight: 1.7,
            maxWidth: 460, margin: "0 auto 36px",
          }}>
            Bergabung dengan 1.200+ pelanggan puas di Semarang.
            Daftar sekarang dan nikmati berbagai keuntungan eksklusif.
          </p>

          {/* Perks */}
          <div style={{
            display: "flex", justifyContent: "center",
            flexWrap: "wrap", gap: 12, marginBottom: 36,
          }}>
            {perks.map((p) => (
              <div
                key={p.text}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 999, padding: "7px 16px",
                  fontSize: 13, color: "#e2e8f0",
                }}
              >
                <span style={{ color: "#4ade80" }}>{p.icon}</span>
                {p.text}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/auth/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 28px", borderRadius: 10,
                fontSize: 14.5, fontWeight: 700,
                background: "#16a34a", color: "#fff",
                boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
                transition: "all 0.15s",
              }}
              className="hover:bg-green-500 hover:-translate-y-0.5"
            >
              Daftar & Klaim Diskon <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "13px 28px", borderRadius: 10,
                fontSize: 14.5, fontWeight: 600,
                background: "transparent", color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "all 0.15s",
              }}
              className="hover:bg-white/10"
            >
              Sudah Punya Akun
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}