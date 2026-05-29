import { Star, MapPin } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  location: string;
  isActive: boolean;
}

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/testimonials`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.testimonials ?? data).filter((t: Testimonial) => t.isActive);
  } catch {
    return [];
  }
}

const fallbackTestimonials = [
  { id: "1", name: "Rizky A.",  rating: 5, text: "Sepatuku balik kayak baru! Pelayanan cepat dan rapi banget.",        location: "Semarang Tengah", isActive: true },
  { id: "2", name: "Dinda P.",  rating: 5, text: "Recommended banget! Harga terjangkau, hasilnya memuaskan.",          location: "Tembalang",       isActive: true },
  { id: "3", name: "Bima F.",   rating: 5, text: "Tracking real-time-nya keren, bisa pantau status cuci setiap saat.", location: "Banyumanik",      isActive: true },
  { id: "4", name: "Anisa R.",  rating: 4, text: "Sepatu putihku bersih lagi, padahal udah kuning banget. Top!",       location: "Ngaliyan",        isActive: true },
];

export default async function Testimonials() {
  const testimonials = await getTestimonials();
  const list = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <section id="ulasan" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ background: "#dcfce7", color: "#14532d" }}>Testimoni</span>
          <h2 className="font-display font-extrabold text-[#0f172a]"
            style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.8px" }}>
            Kata Pelanggan Kami
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {list.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] hover:shadow-md transition">
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Star key={j} className={`w-3.5 h-3.5 ${j <= t.rating ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#e2e8f0]"}`} />
                ))}
              </div>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: "#dcfce7", color: "#14532d" }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0f172a]">{t.name}</div>
                  <div className="text-xs text-[#475569] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}