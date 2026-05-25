import Link from "next/link";

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
    <footer style={{ background: "#fff", borderTop: "1px solid #e2e8f0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 28px" }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12" style={{ marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.5px", color: "#0f172a" }}>
              Nyuciin<span style={{ color: "#16a34a" }}>Aja</span>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65 }}>
              Platform laundry sepatu online terpercaya di Semarang. Bersih, cepat, dan terjangkau.
            </p>
          </div>

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
  );
}