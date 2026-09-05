import { NextResponse } from "next/server";
import { fetchTopCryptoMovers } from "@/lib/coingecko";

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await fetchTopCryptoMovers());
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch market movers" }, { status: 500 });
  }
}
