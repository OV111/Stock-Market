import Footer from "@/components/landing/Footer";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Summary from "@/components/landing/Summary";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Background blobs */}
      {/* <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[60px] left-0 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-[100px] left-[80%] w-[300px] h-[300px] rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="absolute top-[200px] right-[10%] w-[300px] h-[300px] rounded-full bg-teal-400/8 blur-[100px]" />
      </div> */}
      <LandingNav />
      <Hero />
      <Features />
      <Summary />
      <Footer />
    </main>
  );
}
