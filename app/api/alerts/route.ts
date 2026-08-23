import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Alert from "@/models/Alert";
import { fetchQuotes } from "@/lib/finnhub";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const alerts = await Alert.find({ userId: user.id }).sort({ createdAt: -1 }).lean();

    if (alerts.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Enrich with live prices so the UI can show "current vs threshold".
    // One batched call for the distinct symbols, not one per alert.
    const symbols = [...new Set(alerts.map((a) => a.symbol as string))];
    const quotes = await fetchQuotes(symbols);
    const priceBySymbol = new Map(quotes.map((q) => [q.symbol, q.price]));

    const enriched = alerts.map((a) => ({
      ...a,
      _id: String(a._id),
      currentPrice: priceBySymbol.get(a.symbol as string) ?? null,
    }));

    return NextResponse.json(enriched, { status: 200 });
  } catch (err) {
    console.error("[alerts:GET]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, condition, threshold, cooldownMinutes } = body;

    if (!symbol || typeof symbol !== "string" || !symbol.trim()) {
      return NextResponse.json({ message: "symbol is required" }, { status: 400 });
    }

    if (condition !== "ABOVE" && condition !== "BELOW") {
      return NextResponse.json(
        { message: "condition must be ABOVE or BELOW" },
        { status: 400 },
      );
    }

    if (typeof threshold !== "number" || !Number.isFinite(threshold) || threshold <= 0) {
      return NextResponse.json(
        { message: "threshold must be a positive number" },
        { status: 400 },
      );
    }

    if (
      cooldownMinutes !== undefined &&
      (typeof cooldownMinutes !== "number" ||
        !Number.isFinite(cooldownMinutes) ||
        cooldownMinutes < 0)
    ) {
      return NextResponse.json(
        { message: "cooldownMinutes must be a non-negative number" },
        { status: 400 },
      );
    }

    await connectDB();

    // userId comes from the session, never from the body — a client can't
    // create an alert that belongs to someone else.
    const alert = await Alert.create({
      userId: user.id,
      symbol: symbol.trim().toUpperCase(),
      condition,
      threshold,
      ...(cooldownMinutes !== undefined ? { cooldownMinutes } : {}),
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (err) {
    console.error("[alerts:POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    await connectDB();

    // Scoped to the session user: guessing another user's alert id deletes
    // nothing, and the response is indistinguishable from a stale id.
    const deleted = await Alert.findOneAndDelete({ _id: id, userId: user.id });

    if (!deleted) {
      return NextResponse.json({ message: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("[alerts:DELETE]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
