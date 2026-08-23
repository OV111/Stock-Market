import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  symbol: string | null;
  type: "BUY" | "SELL" | "DIVIDEND" | "SPLIT" | "DEPOSIT" | "WITHDRAWAL";
  quantity: mongoose.Types.Decimal128;
  pricePerUnit: mongoose.Types.Decimal128;
  fees: mongoose.Types.Decimal128;
  currency: "USD" | "AMD" | "EUR" | "CNY" | "GBP";
  fxRateToBase: mongoose.Types.Decimal128;
  occurredAt: Date;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, default: null },
    type: {
      type: String,
      enum: ["BUY", "SELL", "DIVIDEND", "SPLIT", "DEPOSIT", "WITHDRAWAL"],
      required: true,
    },
    quantity: { type: Schema.Types.Decimal128, required: true },
    pricePerUnit: { type: Schema.Types.Decimal128, required: true },
    fees: { type: Schema.Types.Decimal128, default: 0 },
    currency: { type: String, enum: ["USD", "AMD", "EUR"], required: true },
    fxRateToBase: { type: Schema.Types.Decimal128, required: true },
    occurredAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
