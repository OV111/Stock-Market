"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

const Footer = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <footer className="w-full border-t mt-0">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4  gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 w-fit"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <div className="relative size-6">
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
                      <TrendingDown className="text-red-500 size-6" />
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
                      <TrendingUp className="text-[#3b82f6] size-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <motion.span
                animate={{ color: hovered ? "#ef4444" : "#ffffff" }}
                transition={{ duration: 0.2 }}
                className="font-bold text-xl"
              >
                Stoxly
              </motion.span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Real-time stock tracking, market insights, and smart watchlists —
              all in one place.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <h4 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
              Product
            </h4>
            <Link href="/root" className="footer-link text-sm">
              Dashboard
            </Link>
            <Link href="/root/search" className="footer-link text-sm">
              Search Stocks
            </Link>
            <Link href="/root/watchlist" className="footer-link text-sm">
              Watchlist
            </Link>
            <Link href="/root/news" className="footer-link text-sm">
              Market News
            </Link>
          </div>

          {/* Markets */}
          <div className="flex flex-col gap-3">
            <h4 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
              Markets
            </h4>
            <Link href="/root" className="footer-link text-sm">NASDAQ</Link>
            <Link href="/root" className="footer-link text-sm">NYSE</Link>
            <Link href="/root" className="footer-link text-sm">S&P 500</Link>
            <Link href="/root/crypto" className="footer-link text-sm">Crypto</Link>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-3">
            <h4 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
              Account
            </h4>
            <Link href="/sign-in" className="footer-link text-sm">
              Sign In
            </Link>
            <Link href="/sign-up" className="footer-link text-sm">
              Get Started
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Stoxly. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Market data provided by{" "}
            <span className="text-gray-500">Finnhub</span> &{" "}
            <span className="text-gray-500">TradingView</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
