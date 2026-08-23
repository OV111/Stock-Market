import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Price alert state machine.
 *
 *   ARMED ──(price crosses threshold in the alert's direction)──▶ TRIGGERED
 *     ▲                                                              │
 *     └──(price back on the non-triggering side AND cooldown elapsed)┘
 *
 * ARMED     — watching. The evaluator may fire it.
 * TRIGGERED — already fired and notified exactly once. While in this state the
 *             alert does NOT re-fire, no matter how many evaluator passes see
 *             the condition still met.
 * DISABLED  — user-paused; the evaluator ignores it entirely.
 *
 * Why the round trip matters: a price sitting right at the threshold will cross
 * it dozens of times a minute. If "condition met" alone sent a notification,
 * that's dozens of emails. Requiring the price to travel back to the
 * non-triggering side before re-arming is hysteresis — the alert can only fire
 * again after a genuine round trip, not after jitter. `cooldownMinutes` adds a
 * time floor on top of that, so even a real round trip inside the cooldown
 * window won't re-arm.
 *
 * `lastTriggeredAt` vs `lastNotifiedAt` are deliberately separate:
 * the first records "we detected the crossing and won the state transition",
 * the second records "delivery actually succeeded". If they diverge, a
 * notification was lost in transit and that is visible rather than silent.
 */

export type AlertCondition = "ABOVE" | "BELOW";
export type AlertStatus = "ARMED" | "TRIGGERED" | "DISABLED";

export interface IAlert extends Document {
  userId: Types.ObjectId;
  symbol: string;
  condition: AlertCondition;
  threshold: number;
  status: AlertStatus;
  lastTriggeredAt?: Date;
  lastNotifiedAt?: Date;
  cooldownMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    condition: { type: String, enum: ["ABOVE", "BELOW"], required: true },
    threshold: { type: Number, required: true },
    status: {
      type: String,
      enum: ["ARMED", "TRIGGERED", "DISABLED"],
      default: "ARMED",
    },
    lastTriggeredAt: { type: Date },
    lastNotifiedAt: { type: Date },
    cooldownMinutes: { type: Number, default: 60 },
  },
  { timestamps: true },
);

// Serving one user's alerts page, and looking up alerts for a symbol.
AlertSchema.index({ userId: 1, symbol: 1 });
// The evaluator sweeps by status across all users, so this one is not
// user-scoped on purpose.
AlertSchema.index({ status: 1 });

const Alert = mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema);

export default Alert;
