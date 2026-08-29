import type { Lot, Position } from "./types";

export function buildPosition(
  symbol: string,
  lots: Lot[],
  currentPrice: number,
): Position {
  const openLots = lots.filter(
    (lot) => lot.symbol === symbol && lot.shares > 0,
  );
  const totalShares = openLots.reduce((total, lot) => total + lot.shares, 0);
  const totalCostBasis = openLots.reduce(
    (total, lot) => total + lot.shares * lot.costPerShare,
    0,
  );
  const avgCostBasis = totalShares === 0 ? 0 : totalCostBasis / totalShares;
  const marketValue = totalShares * currentPrice;
  const unrealizedPnL = marketValue - totalCostBasis;
  const unrealizedPnLPct =
    totalCostBasis === 0 ? 0 : (unrealizedPnL / totalCostBasis) * 100;

  return {
    symbol,
    lots: openLots,
    totalShares,
    avgCostBasis,
    totalCostBasis,
    marketValue,
    unrealizedPnL,
    unrealizedPnLPct,
  };
}
