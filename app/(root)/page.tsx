import Footer from "@/components/landing/Footer";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Summary from "@/components/landing/Summary";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="relative overflow-hidden">
      <LandingNav user={user} />
      <Hero />
      <Features />
      <Summary />
      <Footer />
    </main>
  );
}
