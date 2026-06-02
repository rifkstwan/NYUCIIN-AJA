import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const footerLinks = [
  {
    title: "Layanan",
    links: ["Cuci Reguler", "Deep Cleaning", "Premium + Repaint", "Cuci Suede", "Ekspres 6 Jam"],
  },
  {
    title: "Perusahaan",
    links: ["Tentang Kami", "Blog", "Karir", "Kontak"],
  },
  {
    title: "Dukungan",
    links: ["FAQ", "Kebijakan Privasi", "Syarat & Ketentuan", "Lacak Order"],
  },
];

export default function Footer() {
  return (
    <>
      {/* ── CTA ── */}
      <section className="py-20 px-4" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl px-8 py-14 text-center text-white" style={{ background: "#0f172a" }}>
            <h2
              className="font-display font-extrabold mb-3"
              style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.7px" }}
            >
              Siap Punya Sepatu Bersih Lagi?
            </h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: "#94a3b8", fontSize: "15px" }}>
              Daftar gratis dan langsung buat pesanan pertamamu. Antar-jemput gratis area Semarang!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register"
                className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-[10px] transition hover:-translate-y-0.5 hover:bg-[#f1f5f9]"
                style={{ background: "#fff", color: "#0f172a", fontSize: "14.5px" }}
              >
                Daftar Gratis 
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 font-medium px-7 py-3.5 rounded-[10px] border transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "14.5px" }}
              >
                Sudah Punya Akun
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 28px" }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12" style={{ marginBottom: 36 }}>

            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-3">
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", color: "#0f172a" }}>
                  Nyuciin<span style={{ color: "#16a34a" }}>Aja</span>
                </span>
              </Link>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65 }}>
                Platform laundry sepatu online terpercaya di Semarang. Bersih, cepat, dan terjangkau.
              </p>
            </div>

            {/* Link Columns */}
            {footerLinks.map((col) => (
              <div key={col.title}>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {col.title}
                </p>
                <ul style={{ listStyle: "none" }}>
                  {col.links.map((l) => (
                    <li key={l} style={{ marginBottom: 9 }}>
                      <Link href="#" style={{ fontSize: 13, color: "#475569" }} className="hover:text-green-600 transition-colors">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12.5, color: "#475569" }}>
              © {new Date().getFullYear()} Nyuciin Aja. Seluruh hak dilindungi undang-undang.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              <Link href="#" style={{ fontSize: 12, color: "#475569" }} className="hover:text-green-600 transition-colors">Kebijakan Privasi</Link>
              <Link href="#" style={{ fontSize: 12, color: "#475569" }} className="hover:text-green-600 transition-colors">Syarat & Ketentuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}