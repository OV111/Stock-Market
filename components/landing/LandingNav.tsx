"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import DotField from "@/components/DotField";

const LandingNav = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 py-2 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <DotField
          dotRadius={1}
          dotSpacing={18}
          bulgeStrength={60}
          glowRadius={120}
          gradientFrom="rgba(59, 130, 246, 0.2)"
          gradientTo="rgba(96, 165, 250, 0.08)"
          glowColor="#050505"
        />
      </div>

      <Link
        href="/"
        className="flex items-center gap-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative size-5">
          <AnimatePresence mode="wait">
            {hovered ? (
              <motion.span
                key="down"
                initial={{ opacity: 0, y: -6, rotate: -10 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <TrendingDown className="text-red-500 size-5" />
              </motion.span>
            ) : (
              <motion.span
                key="up"
                initial={{ opacity: 0, y: 6, rotate: 10 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <TrendingUp className="text-[#3b82f6] size-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.span
          animate={{ color: hovered ? "#ef4444" : "#ffffff" }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold"
        >
          Stoxly
        </motion.span>
      </Link>

      <div className="flex items-center gap-3">
        <Link href="/sign-in">
          <Button variant="ghost" size="lg" className="cursor-pointer">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button size="lg" className="cursor-pointer">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default LandingNav;
