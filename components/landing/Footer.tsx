import { TrendingUp } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t mt-0">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4  gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-white font-bold text-xl">Stoxly</span>
            </div>
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

          {/* Account */}
          <div className="flex flex-col gap-3">
            <h4 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
              Markets
            </h4>
            <span className="text-gray-500 text-sm">NASDAQ</span>
            <span className="text-gray-500 text-sm">NYSE</span>
            <span className="text-gray-500 text-sm">S&P 500</span>
            <span className="text-gray-500 text-sm">Crypto</span>
          </div>
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

          {/* Markets */}
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
