import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transactions";
import { buildDemoTransactions } from "@/lib/demoSeed";

export const DEMO_USER_EMAIL = "demo@stoxly.app";

/**
 * Finds-or-creates the single shared demo user and, only the first time,
 * seeds ~2 years of realistic transaction history. Idempotent by design:
 * every visitor who clicks "Try Demo" lands on the same account rather than
 * spawning a new one, and re-running this never duplicates transactions —
 * both checks are on existence, not on a one-time flag, so this is safe to
 * call on every demo login.
 *
 * No password is set. This account is never reachable through the normal
 * sign-in form (which requires `user.password` — see app/api/auth/sign-in),
 * only through the dedicated /api/auth/demo route that issues a session
 * directly. That keeps "no signup wall" from also meaning "guessable login."
 */
export async function ensureDemoAccount(): Promise<{ id: string }> {
  await connectDB();

  let user = await User.findOne({ email: DEMO_USER_EMAIL });
  if (!user) {
    user = await User.create({
      name: "Demo Investor",
      email: DEMO_USER_EMAIL,
      // no password — see doc comment above
    });
  }

  const existingCount = await Transaction.countDocuments({ userId: user._id });
  if (existingCount === 0) {
    const seedTx = buildDemoTransactions();
    const now = Date.now();

    await Transaction.insertMany(
      seedTx.map((t) => ({
        userId: user._id,
        symbol: t.symbol,
        type: t.type,
        quantity: t.quantity,
        pricePerUnit: t.pricePerUnit,
        fees: t.fees,
        currency: "USD",
        fxRateToBase: 1,
        occurredAt: new Date(now - t.daysAgo * 86_400_000),
      })),
    );
  }

  return { id: user._id.toString() };
}
