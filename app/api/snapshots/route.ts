import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";
import PortfolioSnapshot from "@/models/PortfolioSnapshot";

const DEFAULT_DAYS = 90;

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const daysParam = new URL(request.url).searchParams.get("days");
    const parsed = Number(daysParam);
    const days = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_DAYS;

    await connectDB();

    const cutoff = new Date(Date.now() - days * 86_400_000);

    const snapshots = await PortfolioSnapshot.find({
      userId: user.id,
      snapshotDate: { $gte: cutoff },
    })
      .sort({ snapshotDate: 1 })
      .lean();

    // Empty array is the expected case for a user with no snapshots yet —
    // never a 404, so the client can render an "no history yet" state.
    return NextResponse.json(snapshots, { status: 200 });
  } catch (err) {
    console.error("[snapshots:GET]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
