import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { evaluateAlerts } from "@/lib/alertEvaluator";

/**
 * Alert evaluator worker.
 *
 * Manual trigger for now — POST it from the browser/Postman to run one sweep.
 * This becomes a Vercel Cron entry in vercel.json later (see Vision.md's
 * "Systems Problems" section), same trajectory as app/api/pricebars/sync.
 *
 * Auth reasoning: this is a system worker, not a user action — it evaluates
 * every user's alerts, so scoping it to a session user makes no sense. Vercel
 * Cron can't hold a session cookie either. So the real guard is a shared secret
 * in the Authorization header. When CRON_SECRET is unset (local dev) we fall
 * back to requiring a logged-in user, so the route is never wide open —
 * failing closed in both configurations rather than only in production.
 *
 * The evaluator itself is safe to call repeatedly: every state transition is a
 * conditional update, so a double-fired cron or a retry after a timeout cannot
 * produce a duplicate notification.
 */
export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    } else {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    const summary = await evaluateAlerts();

    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error("[alerts/evaluate:POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
