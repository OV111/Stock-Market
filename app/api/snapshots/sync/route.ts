import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { snapshotPortfolioForUser } from "@/lib/portfolioSnapshotSync";

/**
 * Manual trigger for now — call this while logged in to compute and cache
 * today's portfolio snapshot for the current user. Once proven working,
 * this becomes a daily Vercel Cron job instead of a user-triggered route
 * (same pattern as app/api/pricebars/sync/route.ts).
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await snapshotPortfolioForUser(user.id);

    return NextResponse.json({ snapshot }, { status: 200 });
  } catch (err) {
    console.error("[snapshots/sync:POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
