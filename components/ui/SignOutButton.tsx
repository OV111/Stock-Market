"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-400
      hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
    >
      <LogOut className="size-4" />
      Sign out
    </button>
  );
};

export default SignOutButton;
