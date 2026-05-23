"use client";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Reguler",
    price: "25.000",
    per: "per pasang",
    features: ["Cuci luar dalam", "Selesai 2–3 hari", "Pickup & Delivery", "Notifikasi WhatsApp"],
    highlight: false,
  },
  {
    name: "Express",
    price: "45.000",
    per: "per pasang",
    features: ["Cuci luar dalam", "Selesai 1 hari", "Pickup & Delivery", "Notifikasi WhatsApp", "Prioritas antrian"],
    highlight: true,
  },
  {
    name: "Deep Clean",
    price: "65.000",
    per: "per pasang",
    features: ["Deep cleaning menyeluruh", "Selesai 2–3 hari", "Pickup & Delivery", "Notifikasi WhatsApp", "Garansi hasil"],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Harga Transparan</h2>
          <p className="text-gray-500">Tanpa biaya tersembunyi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 border-2 relative ${
                p.highlight
                  ? "bg-primary-600 border-primary-600 text-white shadow-xl scale-105"
                  : "bg-white border-gray-100 text-gray-800"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-primary-900 text-xs font-bold px-4 py-1 rounded-full">
                  PALING POPULER
                </div>
              )}
              <h3 className={`font-bold text-xl mb-2 ${p.highlight ? "text-white" : "text-primary-900"}`}>
                {p.name}
              </h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">Rp {p.price}</span>
                <span className={`text-sm ml-1 ${p.highlight ? "text-blue-200" : "text-gray-400"}`}>{p.per}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 ${p.highlight ? "text-yellow-300" : "text-primary-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`block text-center py-3 rounded-full font-bold transition ${
                  p.highlight
                    ? "bg-yellow-400 text-primary-900 hover:bg-yellow-300"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
              >
                Pesan Sekarang
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}