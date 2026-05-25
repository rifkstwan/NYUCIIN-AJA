const testimonials = [
  {
    name: "Andi Rahmadan",
    sub: "Pelanggan setia · Semarang",
    initials: "AR",
    rating: 5,
    content: "Hasilnya benar-benar bagus. Nike AF1 putih saya yang sudah menguning kembali putih lagi. Pelayanan cepat dan sangat responsif.",
  },
  {
    name: "Dinda Sari",
    sub: "5 pesanan · Ungaran",
    initials: "DS",
    rating: 5,
    content: "Layanan antar-jemput sangat membantu, tidak perlu keluar rumah sama sekali. Sepatu kembali bersih, rapi, dan wangi. Sangat direkomendasikan.",
  },
  {
    name: "Bagas Nugroho",
    sub: "Pelanggan baru · Salatiga",
    initials: "BN",
    rating: 4,
    content: "Paket deep cleaning sangat sepadan untuk sepatu koleksi. Foto before dan after-nya juga membantu untuk melihat perkembangannya.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" style={{ background: "#fff" }}>
      <div className="max-w-6xl mx-auto px-8 py-20">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span style={{ display: "inline-block", background: "#dcfce7", color: "#14532d", fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 999, marginBottom: 12 }}>
            Ulasan Pelanggan
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 12, color: "#0f172a" }}>
            Kata Mereka tentang Nyuciin Aja
          </h2>
          <p style={{ fontSize: 15, color: "#475569", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
            Lebih dari 4.800 pelanggan sudah mempercayai kami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: 24,
                transition: "all 0.2s",
              }}
              className="hover:shadow-md hover:border-slate-300"
            >
              <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} style={{ width: 14, height: 14, color: i < t.rating ? "#f59e0b" : "#e2e8f0" }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.68, color: "#475569", marginBottom: 18 }}>
                &ldquo;{t.content}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#dcfce7", color: "#14532d",
                  fontWeight: 700, fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{t.name}</p>
                  <p style={{ fontSize: 11.5, color: "#475569", marginTop: 1 }}>{t.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}