import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongoose";
import { fetchQuotes } from "@/lib/finnhub";
import Alert, { IAlert, AlertCondition } from "@/models/Alert";
import User from "@/models/User";

export type EvaluationResult = {
  evaluated: number;
  triggered: number;
  rearmed: number;
  errored: number;
  skippedNoQuote: number;
};

function conditionMet(condition: AlertCondition, price: number, threshold: number): boolean {
  return condition === "ABOVE" ? price > threshold : price < threshold;
}

function cooldownElapsed(alert: IAlert, now: Date): boolean {
  if (!alert.lastTriggeredAt) return true;
  const elapsedMs = now.getTime() - new Date(alert.lastTriggeredAt).getTime();
  return elapsedMs >= alert.cooldownMinutes * 60 * 1000;
}

/**
 * Deliver one alert notification. Mirrors the SMTP-or-log pattern used by
 * app/api/auth/forgot-password/route.ts: real mail when SMTP_HOST is set,
 * console log otherwise so local dev doesn't need a mail server.
 * Throws on delivery failure — the caller uses that to decide whether to
 * stamp `lastNotifiedAt`.
 */
async function sendAlertNotification(
  alert: IAlert,
  price: number,
): Promise<void> {
  const user = await User.findById(alert.userId).select("name email");
  const direction = alert.condition === "ABOVE" ? "rose above" : "fell below";
  const subject = `${alert.symbol} ${direction} $${alert.threshold}`;
  const line = `${alert.symbol} is at $${price} — ${direction} your alert threshold of $${alert.threshold}.`;

  if (!user?.email) {
    console.warn(`[alertEvaluator] alert ${alert._id} has no deliverable user email`);
    return;
  }

  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Stoxly" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Stoxly alert: ${subject}`,
      html: `
        <p>Hi ${user.name},</p>
        <p>${line}</p>
        <p>This alert is now paused and will re-arm once ${alert.symbol} moves back
        to the other side of $${alert.threshold}.</p>
      `,
    });
  } else {
    // Dev fallback — no SMTP configured, log the notification instead.
    console.log(`\n[Stoxly] Alert for ${user.email}: ${line}\n`);
  }
}

/**
 * One evaluator pass over every live alert.
 *
 * Exactly-once delivery rests on a compare-and-swap, not on a read-then-write:
 * we re-assert `status: "ARMED"` inside the update filter itself, so MongoDB
 * decides the winner atomically. If two workers (a cron overlap, a retry after
 * a timeout, two serverless instances) evaluate the same alert at the same
 * instant, both may read it as ARMED — but only one findOneAndUpdate will match
 * a document. The loser gets `null` back and sends nothing. That is why the
 * state transition happens BEFORE the notification: winning the transition is
 * the permission slip to notify.
 *
 * The cost of that ordering is at-most-once rather than at-least-once on the
 * wire — a crash between the swap and the send loses that notification. That's
 * the deliberate trade: for price alerts a missed email is far cheaper than a
 * duplicate storm, and the `lastTriggeredAt`/`lastNotifiedAt` split makes any
 * such gap observable after the fact.
 */
export async function evaluateAlerts(): Promise<EvaluationResult> {
  await connectDB();

  const result: EvaluationResult = {
    evaluated: 0,
    triggered: 0,
    rearmed: 0,
    errored: 0,
    skippedNoQuote: 0,
  };

  // Both states are loaded: ARMED ones may fire, TRIGGERED ones are checked
  // for re-arming. DISABLED is excluded entirely.
  const alerts: IAlert[] = await Alert.find({
    status: { $in: ["ARMED", "TRIGGERED"] },
  });

  if (alerts.length === 0) return result;

  // One batched quote fetch for the distinct symbol set — not one per alert.
  // Ten users watching AAPL costs one upstream request, not ten.
  const symbols = [...new Set(alerts.map((a) => a.symbol))];
  const quotes = await fetchQuotes(symbols);
  const priceBySymbol = new Map(quotes.map((q) => [q.symbol, q.price]));

  const now = new Date();

  for (const alert of alerts) {
    // Per-alert isolation: one bad symbol or one mail failure must not abort
    // the sweep for everyone else (same convention as lib/finnhub.ts).
    try {
      const price = priceBySymbol.get(alert.symbol);
      if (price == null) {
        result.skippedNoQuote += 1;
        continue;
      }

      result.evaluated += 1;
      const met = conditionMet(alert.condition, price, alert.threshold);

      if (alert.status === "ARMED" && met) {
        // Compare-and-swap: `status: "ARMED"` in the FILTER is the guard.
        // A concurrent worker that already flipped this alert makes this
        // filter miss, `won` comes back null, and we never notify twice.
        const won = await Alert.findOneAndUpdate(
          { _id: alert._id, status: "ARMED" },
          { $set: { status: "TRIGGERED", lastTriggeredAt: now } },
          { new: true },
        );

        if (!won) continue; // lost the race — the winner is notifying.

        result.triggered += 1;

        // Only the transition winner reaches here, so this send happens once.
        await sendAlertNotification(won, price);
        // Stamped only after delivery returned without throwing, so a divergence
        // between lastTriggeredAt and lastNotifiedAt means a lost notification.
        await Alert.updateOne({ _id: won._id }, { $set: { lastNotifiedAt: new Date() } });
        continue;
      }

      if (alert.status === "TRIGGERED" && !met && cooldownElapsed(alert, now)) {
        // Re-arm, also as a compare-and-swap so a concurrent pass can't
        // double-count it (or race a fresh trigger back into ARMED).
        const rearmed = await Alert.findOneAndUpdate(
          { _id: alert._id, status: "TRIGGERED" },
          { $set: { status: "ARMED" } },
        );
        if (rearmed) result.rearmed += 1;
        continue;
      }

      // Everything else is a no-op: ARMED and not met (still waiting), or
      // TRIGGERED with the condition still met / cooldown still running.
    } catch (err) {
      result.errored += 1;
      console.error(`[alertEvaluator] alert ${alert._id} failed:`, err);
    }
  }

  return result;
}
