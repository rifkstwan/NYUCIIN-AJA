"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Budi S.", role: "Karyawan Swasta", text: "Pelayanannya cepat! Sepatu Nike putih saya yang sudah kusam jadi kinclong lagi. Pickup juga tepat waktu.", stars: 5 },
  { name: "Rina K.", role: "Mahasiswi UNDIP", text: "Nyaman banget karena bisa tracking orderan real-time. Nggak perlu nanya-nanya lagi statusnya.", stars: 5 },
  { name: "Arif M.", role: "Pengusaha", text: "Sudah langganan 3 bulan. Kualitas konsisten dan harga terjangkau. Highly recommended!", stars: 5 },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Kata Pelanggan Kami</h2>
          <p className="text-gray-500">Kepuasan pelanggan adalah prioritas utama kami</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex mb-4">
                {Array(t.stars).fill(0).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 text-sm italic">"{t.text}"</p>
              <div>
                <div className="font-bold text-primary-900">{t.name}</div>
                <div className="text-gray-400 text-xs">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}