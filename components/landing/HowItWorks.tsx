const steps = [
  {
    num: "1",
    title: "Pesan Online",
    desc: "Pilih layanan, isi alamat, dan tentukan jadwal penjemputan melalui website",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Kurir Menjemput",
    desc: "Kurir datang ke rumahmu tepat waktu sesuai jadwal yang kamu pilih",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Proses Cuci",
    desc: "Sepatu dibersihkan oleh teknisi berpengalaman dengan produk premium",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    num: "4",
    title: "Diantar Kembali",
    desc: "Sepatu bersih diantarkan langsung ke pintumu dalam kondisi terbaik",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-8 py-20">
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <span style={{ display: "inline-block", background: "#dcfce7", color: "#14532d", fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 999, marginBottom: 12 }}>
          Cara Kerja
        </span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 12, color: "#0f172a" }}>
          Mudah dalam 4 Langkah
        </h2>
        <p style={{ fontSize: 15, color: "#475569", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
          Proses yang sederhana dan transparan dari awal hingga selesai
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => (
          <div key={step.num} style={{ textAlign: "center", padding: "28px 16px" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#16a34a", color: "#fff",
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              {step.num}
            </div>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "#f1f5f9", color: "#475569",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              {step.icon}
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>{step.title}</h3>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.55 }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}