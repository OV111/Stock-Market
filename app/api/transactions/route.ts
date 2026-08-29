import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Transaction from "@/models/Transactions";

const TRANSACTION_TYPES = [
  "BUY",
  "SELL",
  "DIVIDEND",
  "SPLIT",
  "DEPOSIT",
  "WITHDRAWAL",
];
const CURRENCIES = ["USD", "AMD", "EUR", "CNY", "GBP"];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      symbol,
      type,
      quantity,
      pricePerUnit,
      fees,
      currency,
      fxRateToBase,
      occurredAt,
    } = body;

    if (!type || !TRANSACTION_TYPES.includes(type)) {
      return NextResponse.json(
        { message: "Invalid or missing type" },
        { status: 400 },
      );
    }

    if (!currency || !CURRENCIES.includes(currency)) {
      return NextResponse.json(
        { message: "Invalid or missing currency" },
        { status: 400 },
      );
    }
    if (quantity === undefined || pricePerUnit === undefined) {
      return NextResponse.json(
        { message: "quantity and pricePerUnit are required" },
        { status: 400 },
      );
    }
    if (!occurredAt) {
      return NextResponse.json(
        { message: "occurredAt is required" },
        { status: 400 },
      );
    }
    if (type !== "DEPOSIT" && type !== "WITHDRAWAL" && !symbol) {
      return NextResponse.json(
        { message: "symbol is required for this transaction type" },
        { status: 400 },
      );
    }
    await connectDB();
    const transaction = new Transaction({
      userId: user.id,
      symbol: symbol ?? null,
      type,
      quantity,
      pricePerUnit,
      fees: fees ?? 0,
      currency,
      fxRateToBase: fxRateToBase ?? 1,
      occurredAt: new Date(occurredAt),
    });
    await transaction.save();
    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error("[transactions:POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const transactions = await Transaction.find({ userId: user.id }).sort({
      occurredAt: 1,
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (err) {
    console.error("[transactions:GET]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
