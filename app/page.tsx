import Navbar       from "@/components/landing/Navbar";
import Hero         from "@/components/landing/Hero";
import Services     from "@/components/landing/Services";
import HowItWorks   from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Footer       from "@/components/landing/Footer";

// ✅ Fetch data real di server, kirim sebagai prop ke Testimonials (client component)
async function getRealTestimonials() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/testimonials`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.testimonials ?? [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const realTestimonials = await getRealTestimonials();

  return (
    <main className="min-h-screen" style={{ background: "#f8fafc", color: "#0f172a" }}>
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      {/* ✅ realTestimonials dikirim sebagai prop */}
      <Testimonials realTestimonials={realTestimonials} />
      <Footer />
    </main>
  );
}