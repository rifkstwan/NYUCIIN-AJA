import Navbar       from "@/components/landing/Navbar";
import Hero         from "@/components/landing/Hero";
import Services     from "@/components/landing/Services";
import HowItWorks   from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Footer       from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "#f8fafc", color: "#0f172a" }}>
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}