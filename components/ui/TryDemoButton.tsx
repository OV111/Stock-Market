"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type TryDemoButtonProps = {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  fullWidth?: boolean;
  onNavigate?: () => void; // lets callers close a mobile menu, etc.
};

/**
 * One click, no signup wall — per Vision.md's "Three-Minute Test." Posts to
 * /api/auth/demo, which provisions the shared seeded demo account and issues
 * a real session cookie, then routes straight to the dashboard.
 */
const TryDemoButton = ({
  className,
  variant = "outline",
  size = "lg",
  fullWidth,
  onNavigate,
}: TryDemoButtonProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      if (!res.ok) throw new Error();
      onNavigate?.();
      router.push("/dashboard");
      router.refresh(); // re-run server components (e.g. LandingNav) with the new session
    } catch {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={`cursor-pointer ${fullWidth ? "w-full" : ""} ${className ?? ""}`}
    >
      <Sparkles className="size-4" />
      {loading ? "Loading demo…" : "Try Demo"}
    </Button>
  );
};

export default TryDemoButton;
