import Link from "next/link";

export default function Pricing() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 88px" }}>
      <div style={{
        background: "#0f172a",
        color: "#fff",
        borderRadius: 28,
        padding: 56,
        textAlign: "center",
      }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.7px" }}>
          Sepatumu Kotor? Yuk Nyuciin Aja
        </h2>
        <p style={{ fontSize: 15.5, opacity: 0.75, marginBottom: 28, lineHeight: 1.6 }}>
          Daftar sekarang dan dapatkan diskon 20% untuk pesanan pertamamu
        </p>
        <Link
          href="/auth/register"
          style={{
            display: "inline-block",
            padding: "13px 30px", borderRadius: 10,
            fontSize: 14.5, fontWeight: 600,
            background: "#fff", color: "#0f172a",
            transition: "all 0.15s",
          }}
          className="hover:bg-slate-100 hover:-translate-y-0.5"
        >
          Daftar dan Klaim Diskon
        </Link>
      </div>
    </section>
  );
}