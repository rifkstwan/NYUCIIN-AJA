"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-28 pb-20 bg-gradient-to-br from-primary-900 via-primary-600 to-primary-500 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        {/* Text */}
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm mb-6">
            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            <span>Dipercaya 500+ pelanggan di Semarang</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Sepatu Bersih,<br />
            <span className="text-yellow-300">Tanpa Repot</span>
          </h1>

          <p className="text-lg text-blue-100 mb-8 max-w-md">
            Jasa cuci sepatu profesional dengan pickup & delivery ke rumah kamu. 
            Bersih maksimal, diproses 1–3 hari.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 bg-yellow-400 text-primary-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition shadow-lg"
            >
              Pesan Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how"
              className="flex items-center justify-center gap-2 border-2 border-white/50 px-8 py-3 rounded-full font-medium hover:bg-white/10 transition"
            >
              Lihat Cara Kerja
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 justify-center md:justify-start">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-blue-200 text-sm">Pelanggan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">2000+</div>
              <div className="text-blue-200 text-sm">Sepatu dicuci</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.9⭐</div>
              <div className="text-blue-200 text-sm">Rating</div>
            </div>
          </div>
        </motion.div>

        {/* Visual Card */}
        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">👟</div>
              <h3 className="font-bold text-xl">Order Aktif</h3>
            </div>
            {[
              { icon: "📦", label: "Pickup", status: "Selesai", color: "text-green-400" },
              { icon: "🧼", label: "Cuci & Bersihkan", status: "Proses", color: "text-yellow-300" },
              { icon: "🚚", label: "Delivery", status: "Menunggu", color: "text-blue-200" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}