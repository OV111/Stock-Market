"use client";

import BlurText from "@/components/BlurText";
import TrueFocus from "@/components/TrueFocus";

const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center px-6 py-20 gap-6">
      {/* Badge */}
      {/* <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-4 py-1 text-sm font-medium">
        ✨ Real-time Market Data
      </div> */}

      {/* Headline */}
      <div className="flex flex-col items-center gap-2">
        <BlurText
          text="Track Your Personal"
          delay={80}
          animateBy="words"
          direction="top"
          className="text-5xl font-bold text-white"
        />
        <TrueFocus
          sentence="Stocks Portfolio Markets Watchlist"
          borderColor="#3b82f6"
          glowColor="rgba(59, 130, 246, 0.4)"
          animationDuration={0.5}
          pauseBetweenAnimations={1.5}
        />
      </div>

      {/* Subtext */}
      {/* <BlurText
        text="Your all-in-one platform for real-time stock tracking, AI-powered insights, and personalized market alerts."
        delay={40}
        animateBy="words"
        direction="top"
        className="text-gray-400 text-lg max-w-xl"
      /> */}

      {/* Dashboard Preview */}
     
    </section>
  );
};

export default Hero;
