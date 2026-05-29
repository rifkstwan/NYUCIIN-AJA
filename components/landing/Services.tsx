import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  badge?: string;
  featured: boolean;
  features: string[];
  isActive: boolean;
}

async function getServices(): Promise<Service[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/services`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.services ?? data).filter((s: Service) => s.isActive);
  } catch {
    return [];
  }
}

const fallbackServices: Service[] = [
  {
    id: "1",
    name: "Fast Cleaning",
    description: "Pencucian instan pada bagian upper dan midsole.",
    basePrice: 20000,
    badge: "",
    featured: false,
    features: ["Cuci upper & midsole", "Sikat ringan outsole", "Foto before & after"],
    isActive: true,
  },
  {
    id: "2",
    name: "Deep Cleaning",
    description: "Perawatan pembersihan pada seluruh permukaan (Upper, Midsole, Outsole & Insole).",
    basePrice: 25000,
    badge: "Terpopuler",
    featured: true,
    features: ["Cuci semua permukaan", "Anti-jamur treatment", "Foto before & after", "Pengemasan rapi"],
    isActive: true,
  },
  {
    id: "3",
    name: "Unyellowing",
    description: "Perawatan pada bagian midsole yang menguning tanpa repaint.",
    basePrice: 35000,
    badge: "",
    featured: false,
    features: ["Deep cleaning full", "Unyellowing midsole", "Tanpa repaint", "Hasil tahan lama"],
    isActive: true,
  },
];

export default async function Services() {
  const services = await getServices();
  const list = services.length > 0 ? services : fallbackServices;

  return (
    <section id="layanan" className="py-20 px-4" style={{ background: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ background: "#dcfce7", color: "#14532d" }}>Layanan Kami</span>
          <h2 className="font-display font-extrabold text-[#0f172a] mb-3"
            style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.8px" }}>
            Pilih Paket yang Tepat
          </h2>
          <p className="text-[#475569] text-sm max-w-md mx-auto leading-relaxed">
            Semua paket sudah termasuk antar-jemput gratis area Semarang
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((s) => (
            <div
              key={s.id}
              className="relative bg-white rounded-2xl p-7 border transition hover:shadow-lg hover:-translate-y-1"
              style={{
                borderColor: s.featured ? "#16a34a" : "#e2e8f0",
                boxShadow: s.featured ? "0 0 0 1px #16a34a, 0 4px 16px rgba(22,163,74,0.08)" : undefined,
              }}
            >
              {s.badge && (
                <span className="absolute -top-3 left-5 text-[10.5px] font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: "#ea580c" }}>{s.badge}</span>
              )}
              <div className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-4"
                style={{ background: "#dcfce7" }}>
                <svg className="w-5 h-5" style={{ color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-[#0f172a] mb-2" style={{ fontSize: "17px" }}>
                {s.name}
              </h3>
              {s.description && (
                <p className="text-[#475569] text-sm leading-relaxed mb-4">{s.description}</p>
              )}
              <ul className="space-y-1.5 mb-5">
                {s.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[#475569]" style={{ fontSize: "12.5px" }}>
                    <CheckCircle className="w-3.5 h-3.5 text-[#16a34a] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#e2e8f0]">
                <div>
                  <span className="font-display font-extrabold text-[#0f172a]" style={{ fontSize: "24px" }}>
                    Rp {s.basePrice.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-[#475569] ml-1">/ pasang</span>
                </div>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition hover:bg-[#16a34a] hover:text-white hover:border-[#16a34a]"
                  style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
                >
                  Pilih
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}