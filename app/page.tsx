import Footer from "@/components/landing/Footer";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Summary from "@/components/landing/Summary";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <LandingNav />
      <Hero />
      <Features />
      <Summary />
      <Footer />
    </main>
  );
}
