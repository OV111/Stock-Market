import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth";
import { ensureDemoAccount, DEMO_USER_EMAIL } from "@/lib/demoAccount";

/**
 * One-click demo entry — no signup wall, per Vision.md's "Three-Minute Test".
 * Provisions (or reuses) the shared demo account and its seeded transaction
 * history, then issues a real session cookie exactly like sign-in does.
 */
export async function POST() {
  try {
    const { id } = await ensureDemoAccount();
    const token = await signToken({ id, email: DEMO_USER_EMAIL });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ message: "Demo session started" }, { status: 200 });
  } catch (err) {
    console.error("[auth/demo]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
