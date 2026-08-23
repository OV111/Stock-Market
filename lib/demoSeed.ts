/**
 * Deterministic seed data for the one-click demo account.
 *
 * Per Vision.md's "Three-Minute Test": a realistic 15-holding portfolio with
 * ~2 years of transaction history, including a stock split, so corporate-
 * actions handling is visible without the reviewer doing anything. Dates are
 * anchored relative to `new Date()` at seed time so "2 years of history" stays
 * true no matter when this runs — not hardcoded to a calendar year that ages.
 *
 * This is data only. No DB/network calls here — lib/demoAccount.ts turns this
 * into actual Transaction rows.
 */

export type SeedTransaction = {
  symbol: string | null;
  type: "BUY" | "SELL" | "DIVIDEND" | "SPLIT" | "DEPOSIT" | "WITHDRAWAL";
  quantity: number;
  pricePerUnit: number;
  fees: number;
  daysAgo: number; // resolved to an actual Date at seed time
};

const DAY = 1;
const MONTH = 30;
const YEAR = 365;

export function buildDemoTransactions(): SeedTransaction[] {
  const tx: SeedTransaction[] = [];

  const deposit = (amount: number, daysAgo: number) =>
    tx.push({ symbol: null, type: "DEPOSIT", quantity: amount, pricePerUnit: 1, fees: 0, daysAgo });

  const buy = (symbol: string, qty: number, price: number, daysAgo: number, fees = 1) =>
    tx.push({ symbol, type: "BUY", quantity: qty, pricePerUnit: price, fees, daysAgo });

  const sell = (symbol: string, qty: number, price: number, daysAgo: number, fees = 1) =>
    tx.push({ symbol, type: "SELL", quantity: qty, pricePerUnit: price, fees, daysAgo });

  const dividend = (symbol: string, amount: number, daysAgo: number) =>
    tx.push({ symbol, type: "DIVIDEND", quantity: amount, pricePerUnit: 1, fees: 0, daysAgo });

  const split = (symbol: string, ratio: number, daysAgo: number) =>
    tx.push({ symbol, type: "SPLIT", quantity: ratio, pricePerUnit: 0, fees: 0, daysAgo });

  // Initial funding — two years ago, the demo investor opens the account.
  deposit(50_000, 2 * YEAR);

  // Core tech, bought early and held — this is the position that gets a split.
  buy("AAPL", 40, 175, 2 * YEAR - 5 * DAY);
  buy("MSFT", 20, 340, 2 * YEAR - 10 * DAY);
  buy("GOOGL", 15, 135, 2 * YEAR - 15 * DAY);

  // NVDA bought early, then split 4:1 partway through the window — the
  // corporate-actions moment this whole seed exists to demonstrate.
  buy("NVDA", 30, 480, 2 * YEAR - 20 * DAY);
  split("NVDA", 4, YEAR + 3 * MONTH);

  // Second funding round — a later deposit, so TWR/MWR genuinely diverge
  // (money-weighted return is sensitive to *when* this cash arrived).
  deposit(20_000, YEAR + 2 * MONTH);

  buy("AMZN", 25, 145, YEAR + 1 * MONTH);
  buy("META", 20, 310, YEAR + 25 * DAY);
  buy("TSLA", 15, 220, YEAR - 10 * DAY);

  // Crypto exposure — the "crypto assets tracked with the same rigor" claim
  // from Vision.md's "Who It Is For" needs at least one holding to back it.
  buy("COIN", 40, 90, 10 * MONTH);

  // Mid-cap / diversified names to round out to 15 distinct holdings.
  buy("NFLX", 10, 480, 9 * MONTH);
  buy("AMD", 60, 140, 8 * MONTH);
  buy("CRM", 20, 260, 7 * MONTH);
  buy("ADBE", 8, 520, 6 * MONTH);
  buy("V", 25, 260, 5 * MONTH);
  buy("SHOP", 50, 65, 4 * MONTH);
  buy("UBER", 45, 68, 3 * MONTH);

  // A realized gain: partial sell of an early winner — this is what makes
  // realizedPnl and FIFO lot consumption visible, not just unrealized numbers.
  sell("AAPL", 15, 225, 2 * MONTH);

  // Dividends on the blue-chip names — feeds the cash-flow timeline XIRR uses.
  dividend("AAPL", 42, 18 * MONTH);
  dividend("AAPL", 45, 12 * MONTH);
  dividend("AAPL", 48, 6 * MONTH);
  dividend("MSFT", 60, 15 * MONTH);
  dividend("MSFT", 63, 9 * MONTH);
  dividend("MSFT", 66, 3 * MONTH);
  dividend("V", 20, 3 * MONTH);

  // A small drawdown moment — sell TSLA at a loss, so unrealized/realized P&L
  // isn't uniformly positive (a portfolio that only ever wins reads as fake).
  sell("TSLA", 5, 195, 1 * MONTH);

  // Recent activity, close to "now" — a reviewer opening the demo should see
  // something within the last few weeks, not a portfolio frozen a year ago.
  buy("AMD", 20, 155, 20 * DAY);
  buy("SHOP", 15, 78, 10 * DAY);
  dividend("AAPL", 50, 5 * DAY);

  return tx;
}

/** Distinct symbols this seed touches — 15 holdings once AAPL's partial sell
 * and NVDA's split are accounted for, matching Vision.md's target count. */
export const DEMO_HOLDING_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "NVDA", "AMZN", "META", "TSLA", "COIN",
  "NFLX", "AMD", "CRM", "ADBE", "V", "SHOP", "UBER",
];
