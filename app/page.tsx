import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Contact from "@/components/landing/Contact";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ fontFamily: "var(--font-body)", background: "#f8fafc" }}>
      <div style={{
        background: "radial-gradient(ellipse 80% 60% at 60% -10%, #dcfce7 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 100% 50%, #bbf7d0 0%, transparent 50%), #f8fafc"
      }}>
        <Hero />
      </div>
      <div style={{ background: "#ffffff" }}>
        <Services />
      </div>
      <HowItWorks />
      <div style={{ background: "#ffffff" }}>
        <Testimonials />
      </div>
      <div style={{ background: "#ffffff" }}>
        <Contact />
      </div>
      <Pricing />
      <Footer />
    </main>
  );
}