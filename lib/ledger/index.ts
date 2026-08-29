import { applyEvent } from "./fold";
import { buildPosition } from "./position";
import type {
  CostBasisMethod,
  LedgerState,
  Position,
  Transaction,
} from "./types";

export function computeLedger(
  transactions: Transaction[],
  method: CostBasisMethod = "FIFO",
): LedgerState {
  const initialState: LedgerState = {
    lots: [],
    realizedGains: [],
    costBasisMethod: method,
  };

  return [...transactions]
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .reduce(applyEvent, initialState);
}

export function computePositions(
  state: LedgerState,
  prices: Record<string, number>,
): Position[] {
  const symbols = new Set(
    state.lots
      .filter((lot) => lot.shares > 0)
      .map((lot) => lot.symbol),
  );

  return [...symbols]
    .map((symbol) => buildPosition(symbol, state.lots, prices[symbol] ?? 0))
    .filter((position) => position.totalShares > 0);
}
