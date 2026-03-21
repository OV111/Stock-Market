import Footer from "@/components/landing/Footer";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";

export default function Home() {
  return (
    <main>
      <LandingNav />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
