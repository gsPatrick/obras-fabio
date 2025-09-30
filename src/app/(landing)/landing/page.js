// app/(landing)/page.js
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";         // <-- Importar
import { Testimonials } from "@/components/landing/Testimonials"; // <-- Importar
import { Footer } from "@/components/landing/Footer";           // <-- Importar

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}