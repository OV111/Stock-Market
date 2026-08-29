import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWatchlist extends Document {
  userId: Types.ObjectId;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    symbols: { type: [String], default: [] },
  },
  { timestamps: true },
);

const Watchlist =
  mongoose.models.Watchlist || mongoose.model<IWatchlist>("Watchlist", WatchlistSchema);

export default Watchlist;
