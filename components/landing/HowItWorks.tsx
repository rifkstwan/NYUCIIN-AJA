"use client";
import { motion } from "framer-motion";

const steps = [
  { no: "01", icon: "📱", title: "Buat Order", desc: "Daftar & pilih layanan yang kamu butuhkan." },
  { no: "02", icon: "🚚", title: "Pickup", desc: "Kurir kami jemput sepatu ke alamat kamu." },
  { no: "03", icon: "🧼", title: "Proses Cuci", desc: "Dicuci profesional, real-time tracking tersedia." },
  { no: "04", icon: "✅", title: "Diterima", desc: "Sepatu bersih diantar kembali ke rumah." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Cara Kerja</h2>
          <p className="text-gray-500">Mudah dan cepat hanya dalam 4 langkah</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-primary-100" />
              )}
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 relative z-10">
                {s.icon}
              </div>
              <div className="text-xs font-bold text-primary-500 mb-1">{s.no}</div>
              <h3 className="font-bold text-primary-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}