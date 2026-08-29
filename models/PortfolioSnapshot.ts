import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * CACHE, not a source of truth: unlike Holding (always derived live from
 * Transaction via holdings-engine.ts, never stored), PortfolioSnapshot IS
 * deliberately stored — it's a materialized view of "portfolio value on date X"
 * so charts don't have to replay the full transaction log + historical prices
 * on every render. Safe to delete at any time and regenerate from
 * Transaction + PriceBar data.
 */
export interface IPortfolioSnapshot extends Document {
  userId: Types.ObjectId;
  snapshotDate: Date; // normalized to midnight UTC — one snapshot per user per day
  holdingsValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  assetAllocation?: Record<string, number>; // symbol -> fraction of portfolio value
  createdAt: Date;
}

const PortfolioSnapshotSchema = new Schema<IPortfolioSnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    snapshotDate: { type: Date, required: true },
    holdingsValue: { type: Number, required: true },
    costBasis: { type: Number, required: true },
    unrealizedPnl: { type: Number, required: true },
    unrealizedPnlPct: { type: Number, required: true },
    assetAllocation: { type: Schema.Types.Mixed, default: undefined },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PortfolioSnapshotSchema.index(
  { userId: 1, snapshotDate: 1 },
  { unique: true },
);

const PortfolioSnapshot =
  mongoose.models.PortfolioSnapshot ||
  mongoose.model<IPortfolioSnapshot>("PortfolioSnapshot", PortfolioSnapshotSchema);

export default PortfolioSnapshot;
