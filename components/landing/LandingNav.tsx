import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingNav = () => {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-2">
      <Link href="/" className="flex items-center gap-2">
        <TrendingUp className="text-[#3b82f6] size-5" />
        <span className="text-xl font-bold text-white">Stoxly</span>
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
