"use client";
import { motion } from "framer-motion";

const services = [
  { icon: "👟", title: "Cuci Reguler", desc: "Pembersihan standar untuk sepatu sehari-hari. Hasil bersih dalam 2–3 hari." },
  { icon: "✨", title: "Cuci Express", desc: "Selesai dalam 1 hari. Cocok untuk keperluan mendadak." },
  { icon: "🏆", title: "Deep Cleaning", desc: "Pembersihan menyeluruh hingga sol dan bagian dalam sepatu." },
  { icon: "🎨", title: "Repaint & Restore", desc: "Kembalikan warna sepatu favorit kamu seperti baru." },
  { icon: "🛡️", title: "Waterproofing", desc: "Lapisan anti air agar sepatu tahan segala cuaca." },
  { icon: "🚚", title: "Pickup & Delivery", desc: "Antar jemput ke rumah tanpa biaya tambahan area Semarang." },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Layanan Kami</h2>
          <p className="text-gray-500 max-w-md mx-auto">Semua kebutuhan perawatan sepatu tersedia dalam satu platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 hover:border-primary-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="font-bold text-primary-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}