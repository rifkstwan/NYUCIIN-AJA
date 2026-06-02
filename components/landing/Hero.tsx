import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ── Types ──────────────────────────────────────────────
interface Promo {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  isActive: boolean;
}

// ── Fetch promo pertama yang aktif ────────────────────
async function getFirstPromo(): Promise<Promo | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/promos`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const list: Promo[] = (data.promos ?? data).filter((p: Promo) => p.isActive);
    return list[0] ?? null;
  } catch {
    return null;
  }
}

// ── Static data ────────────────────────────────────────
const trackSteps = [
  { label: "Booking",  done: true  },
  { label: "Jemput",   done: true  },
  { label: "Cuci",     active: true },
  { label: "Kering",   done: false },
  { label: "Antar",    done: false },
  { label: "Selesai",  done: false },
];

const featureList = [
  {
    icon: (
      <svg className="w-4 h-4" style={{ color: "#166534" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    text: "Antar-jemput gratis ke seluruh kota",
  },
  {
    icon: (
      <svg className="w-4 h-4" style={{ color: "#166534" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    text: "Bayar mudah via GoPay, OVO, Virtual Account",
  },
  {
    icon: (
      <svg className="w-4 h-4" style={{ color: "#166534" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    text: "Kumpul poin reward setiap transaksi",
  },
];

const trustItems = [
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    text: "Garansi bersih",
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    text: "Antar-jemput gratis",
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: "Selesai 24 jam",
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    text: "Rating 4.9",
  },
];

// ── Component ──────────────────────────────────────────
export default async function Hero() {
  const promo = await getFirstPromo();

  const promoBanner = promo ?? {
    title: "Diskon 20%",
    description: "untuk pesanan pertama kamu",
    badge: "Penawaran Pertama",
  };

  return (
    <section className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

      {/* ── LEFT ── */}
      <div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#dcfce7", color: "#14532d",
          fontSize: 12, fontWeight: 600,
          padding: "5px 14px 5px 10px", borderRadius: 999, marginBottom: 22,
        }}>
          Dipercaya 1.200+ pelanggan di Semarang
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(40px, 5vw, 54px)",
          fontWeight: 800, lineHeight: 1.07,
          letterSpacing: "-1.8px", color: "#0f172a", marginBottom: 20,
        }}>
          Sepatu Bersih,<br />
          <em style={{ color: "#16a34a", fontStyle: "normal" }}>Tanpa Ribet</em>
        </h1>

        <p style={{
          fontSize: 16.5, lineHeight: 1.72,
          color: "#475569", marginBottom: 34,
          maxWidth: 480, fontWeight: 400,
        }}>
          Layanan cuci sepatu profesional dengan teknologi terkini. Kurir jemput
          dan antar langsung ke pintumu, selesai dalam 24 jam.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
          <Link
            href="/auth/register"
            style={{
              padding: "13px 24px", borderRadius: 10, fontSize: 14.5, fontWeight: 600,
              background: "#16a34a", color: "#fff", display: "inline-flex", alignItems: "center",
              transition: "all 0.15s", boxShadow: "0 4px 16px rgba(22,163,74,0.28)",
            }}
            className="hover:bg-green-700 hover:-translate-y-0.5"
          >
            Mulai Sekarang
          </Link>
          <a
            href="#how-it-works"
            style={{
              padding: "13px 24px", borderRadius: 10, fontSize: 14.5, fontWeight: 600,
              background: "#fff", color: "#0f172a",
              border: "1.5px solid #e2e8f0", transition: "all 0.15s",
              textDecoration: "none", display: "inline-flex", alignItems: "center",
            }}
            className="hover:border-green-600 hover:text-green-600"
          >
            Lihat Cara Kerja
          </a>
        </div>

        {/* Trust items — tanpa titik pemisah */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {trustItems.map((t) => (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#475569" }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: "#dcfce7",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#16a34a",
              }}>
                {t.icon}
              </div>
              {t.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT CARD ── */}
      <div style={{
        background: "#fff", borderRadius: 28,
        border: "1px solid #e2e8f0", padding: 28,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column", gap: 20,
      }}>

        {/* PROMO BANNER */}
        <div style={{ background: "#16a34a", borderRadius: 14, padding: "20px 22px", color: "#fff" }}>
          {promoBanner.badge && (
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.75, marginBottom: 4 }}>
              {promoBanner.badge}
            </p>
          )}
          <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 2 }}>
            {promoBanner.title}
          </p>
          {promoBanner.description && (
            <p style={{ fontSize: 13, opacity: 0.82 }}>{promoBanner.description}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { value: "1.200+", label: "Pelanggan" },
            { value: "24 Jam", label: "Pengerjaan" },
            { value: "4.9",    label: "Rating" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: 14, textAlign: "center",
            }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tracking Preview */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#475569", marginBottom: 12 }}>
            Tracking Real-time
          </p>
          <div style={{ display: "flex", alignItems: "center" }}>
            {trackSteps.map((step, i) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center", flex: i < trackSteps.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    border: `2px solid ${step.done ? "#16a34a" : step.active ? "#16a34a" : "#e2e8f0"}`,
                    background: step.done ? "#16a34a" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: step.done ? "#fff" : step.active ? "#16a34a" : "#e2e8f0",
                  }}>
                    {step.done ? (
                      <svg style={{ width: 10, height: 10 }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : step.active ? (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                    ) : null}
                  </div>
                  <span style={{ fontSize: 9, color: "#475569", textAlign: "center", lineHeight: 1.3 }}>{step.label}</span>
                </div>
                {i < trackSteps.length - 1 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: step.done ? "#16a34a" : "#e2e8f0",
                    marginBottom: 14, marginLeft: 2, marginRight: 2,
                  }} />
                )}
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "#475569" }}>
            Pantau status sepatumu kapan saja secara langsung
          </p>
        </div>

        {/* Feature List */}
        <div style={{ display: "grid", gap: 10 }}>
          {featureList.map((f) => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#0f172a" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: "#dcfce7",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {f.icon}
              </div>
              {f.text}
            </div>
          ))}
        </div>

      </div>
      {/* ── END RIGHT CARD ── */}

    </section>
  );
}