import Link from "next/link";

const services = [
  {
    name: "Fast Cleaning",
    desc: "Pencucian instan pada bagian upper dan midsole. Cocok untuk perawatan rutin cepat.",
    price: "Rp 20.000",
    priceRange: null,
    features: ["Cuci bagian upper", "Sikat midsole", "Estimasi selesai cepat", "Antar-jemput tersedia"],
    featured: false,
    badge: null,
  },
  {
    name: "Deep Cleaning",
    desc: "Perawatan pembersihan pada seluruh permukaan Upper, Midsole, Outsole & Insole.",
    price: "Rp 25.000",
    priceRange: null,
    features: ["Cuci upper & insole", "Sikat outsole & midsole", "Anti-jamur dan anti-bakteri", "Foto before dan after"],
    featured: true,
    badge: "Terpopuler",
  },
  {
    name: "Unyellowing",
    desc: "Perawatan pada bagian midsole yang telah menguning untuk menghilangkan warna kuning tanpa repaint.",
    price: "Rp 35.000",
    priceRange: "– Rp 40.000",
    features: ["Hilangkan yellowing midsole", "Tanpa repaint", "Treatment khusus anti-kuning", "Garansi hasil bersih"],
    featured: false,
    badge: null,
  },
];

export default function Services() {
  return (
    <section id="services" className="max-w-6xl mx-auto px-8 py-20">
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <span style={{ display: "inline-block", background: "#dcfce7", color: "#14532d", fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 999, marginBottom: 12 }}>
          Layanan
        </span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 12, color: "#0f172a" }}>
          Pilihan Paket untuk Setiap Sepatu
        </h2>
        <p style={{ fontSize: 15, color: "#475569", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
          Dari cuci biasa sampai unyellowing — semua tersedia dengan harga transparan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {services.map((s) => (
          <div
            key={s.name}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: 20,
              padding: 28,
              border: s.featured ? "1.5px solid #16a34a" : "1.5px solid #e2e8f0",
              boxShadow: s.featured ? "0 0 0 1px #16a34a, 0 4px 16px rgba(22,163,74,0.08)" : "none",
              transition: "all 0.2s",
            }}
            className="hover:-translate-y-1 hover:shadow-xl"
          >
            {s.badge && (
              <span style={{
                position: "absolute", top: -11, left: 22,
                background: "#ea580c", color: "#fff",
                fontSize: 10.5, fontWeight: 700, padding: "3px 11px", borderRadius: 999,
              }}>
                {s.badge}
              </span>
            )}

            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#166534", marginBottom: 16 }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>

            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>{s.name}</h3>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 18 }}>{s.desc}</p>

            <ul style={{ listStyle: "none", marginBottom: 20 }}>
              {s.features.map((f) => (
                <li key={f} style={{ fontSize: 12.5, color: "#475569", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 18, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{s.price}</span>
              {s.priceRange && (
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{s.priceRange}</span>
              )}
              <span style={{ fontSize: 12, color: "#475569" }}>/ pasang</span>
            </div>

            <Link
              href="/auth/register"
              style={{
                display: "block", width: "100%", textAlign: "center",
                padding: "10px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                border: s.featured ? "1.5px solid #16a34a" : "1.5px solid #e2e8f0",
                background: s.featured ? "#16a34a" : "none",
                color: s.featured ? "#fff" : "#0f172a",
                transition: "all 0.15s",
                boxSizing: "border-box",
              }}
              className={s.featured ? "hover:bg-green-700" : "hover:bg-green-600 hover:text-white hover:border-green-600"}
            >
              Pilih Paket
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}