import mongoose, { Schema, Document } from "mongoose";

// Mongo native time-series collection — NOT a normal document collection.
// High-cardinality OHLC tick data belongs here, not mixed into app collections
// (see Vision.md's Data Model section). Mongoose creates the collection with
// the `timeseries` option automatically on first use, as long as `autoCreate`
// isn't disabled — no manual createCollection() call needed.

export interface IPriceBar extends Document {
  symbol: string; // metaField — groups the series per symbol
  timestamp: Date; // timeField — required by the timeseries option
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const PriceBarSchema = new Schema<IPriceBar>(
  {
    symbol: { type: String, required: true },
    timestamp: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "symbol",
      granularity: "hours", // daily bars — "hours" is Mongo's coarsest granularity option
    },
    // Time-series collections don't support the usual unique/compound indexes
    // the same way normal collections do — dedupe on read/write in application
    // code (see fetchAndStoreDailyCandles in lib/finnhub.ts) rather than relying
    // on a DB-level unique constraint here.
  },
);

// Index for the actual query pattern: "give me bars for symbol X between two dates"
PriceBarSchema.index({ symbol: 1, timestamp: 1 });

const PriceBar =
  mongoose.models.PriceBar || mongoose.model<IPriceBar>("PriceBar", PriceBarSchema);

export default PriceBar;
