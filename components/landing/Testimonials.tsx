"use client";
import { useEffect, useRef, useState } from "react";
import { Star, MapPin } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  location: string;
}

const fallbackTestimonials: Testimonial[] = [
  { id: "f1", name: "Rizky A.",  rating: 5, text: "Sepatuku balik kayak baru! Pelayanan cepat dan rapi banget.",        location: "Semarang Tengah" },
  { id: "f2", name: "Dinda P.",  rating: 5, text: "Recommended banget! Harga terjangkau, hasilnya memuaskan.",          location: "Tembalang"       },
  { id: "f3", name: "Bima F.",   rating: 5, text: "Tracking real-time-nya keren, bisa pantau status cuci setiap saat.", location: "Banyumanik"      },
  { id: "f4", name: "Anisa R.",  rating: 4, text: "Sepatu putihku bersih lagi, padahal udah kuning banget. Top!",       location: "Ngaliyan"        },
  { id: "f5", name: "Fajar M.",  rating: 5, text: "Proses pickup dan delivery tepat waktu, sepatu kinclong!",           location: "Pedurungan"      },
];

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl p-6 border border-[#e2e8f0] hover:shadow-md transition mx-2">
      <div className="flex gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((j) => (
          <Star
            key={j}
            className={`w-3.5 h-3.5 ${j <= t.rating ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#e2e8f0]"}`}
          />
        ))}
      </div>
      <p className="text-sm text-[#475569] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: "#dcfce7", color: "#14532d" }}
        >
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
  );
}

// ── Client component karena butuh useState + useEffect untuk scroll ──
export default function Testimonials({ realTestimonials }: { realTestimonials: Testimonial[] }) {
  // < 10 real → gabungkan dummy + real; ≥ 10 real → hanya real
  const list: Testimonial[] =
    realTestimonials.length >= 10
      ? realTestimonials
      : [...realTestimonials, ...fallbackTestimonials];

  // Duplikat untuk efek infinite scroll
  const items = [...list, ...list];

  const trackRef   = useRef<HTMLDivElement>(null);
  const animRef    = useRef<number>(0);
  const offsetRef  = useRef(0);
  const pausedRef  = useRef(false);
  const SPEED      = 0.5; // px per frame

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      if (!pausedRef.current) {
        offsetRef.current += SPEED;
        const halfWidth = track.scrollWidth / 2;
        if (offsetRef.current >= halfWidth) offsetRef.current = 0;
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [list.length]);

  return (
    <section id="testimonials" className="py-20 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
        <span
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
          style={{ background: "#dcfce7", color: "#14532d" }}
        >
          Testimoni
        </span>
        <h2
          className="font-display font-extrabold text-[#0f172a]"
          style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", letterSpacing: "-0.8px" }}
        >
          Kata Pelanggan Kami
        </h2>
        <p className="text-sm text-[#64748b] mt-2">
          {realTestimonials.length > 0
            ? `${realTestimonials.length} ulasan nyata dari pelanggan setia kami`
            : "Bergabunglah dan rasakan bedanya"}
        </p>
      </div>

      {/* Marquee wrapper */}
      <div
        className="relative w-full"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* Fade kiri & kanan */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
          style={{ background: "linear-gradient(to right, white, transparent)" }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
          style={{ background: "linear-gradient(to left, white, transparent)" }} />

        <div className="flex overflow-hidden">
          <div ref={trackRef} className="flex will-change-transform">
            {items.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}