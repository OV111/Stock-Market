import type {
  LedgerState,
  Lot,
  RealizedGain,
  Transaction,
} from "./types";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function holdingTerm(openDate: Date, closeDate: Date): RealizedGain["term"] {
  const holdingDays = (closeDate.getTime() - openDate.getTime()) / MILLISECONDS_PER_DAY;

  return holdingDays < 365 ? "SHORT" : "LONG";
}

export function applyEvent(state: LedgerState, tx: Transaction): LedgerState {
  switch (tx.type) {
    case "BUY": {
      if (tx.shares === undefined || tx.price === undefined) {
        return state;
      }

      const lot: Lot = {
        id: tx.lotId ?? tx.id,
        symbol: tx.symbol,
        openDate: tx.date,
        shares: tx.shares,
        costPerShare: tx.price,
        originalCostPerShare: tx.price,
      };

      return { ...state, lots: [...state.lots, lot] };
    }

    case "SELL": {
      if (tx.shares === undefined || tx.price === undefined) {
        return state;
      }

      let sharesToSell = tx.shares;
      const lots = [...state.lots].sort((left, right) =>
        state.costBasisMethod === "LIFO"
          ? right.openDate.getTime() - left.openDate.getTime()
          : left.openDate.getTime() - right.openDate.getTime(),
      );
      const remainingLots: Lot[] = [];
      const realizedGains: RealizedGain[] = [...state.realizedGains];

      for (const lot of lots) {
        if (lot.symbol !== tx.symbol || sharesToSell === 0) {
          remainingLots.push(lot);
          continue;
        }

        const sharesClosed = Math.min(lot.shares, sharesToSell);
        const proceeds = sharesClosed * tx.price;

        realizedGains.push({
          type: "TRADE",
          lotId: lot.id,
          symbol: lot.symbol,
          openDate: lot.openDate,
          closeDate: tx.date,
          shares: sharesClosed,
          costPerShare: lot.costPerShare,
          proceeds,
          pnl: proceeds - sharesClosed * lot.costPerShare,
          term: holdingTerm(lot.openDate, tx.date),
        });

        sharesToSell -= sharesClosed;

        if (lot.shares > sharesClosed) {
          remainingLots.push({ ...lot, shares: lot.shares - sharesClosed });
        }
      }

      if (sharesToSell > 0) {
        throw new Error(
          `Oversell: tried to sell ${tx.shares} shares of ${tx.symbol} but only ${tx.shares - sharesToSell} available`,
        );
      }

      return { ...state, lots: remainingLots, realizedGains };
    }

    case "SPLIT": {
      if (tx.splitRatio === undefined) {
        return state;
      }

      const ratio = tx.splitRatio;

      return {
        ...state,
        lots: state.lots.map((lot) =>
          lot.symbol === tx.symbol
            ? {
                ...lot,
                shares: lot.shares * ratio,
                costPerShare: lot.costPerShare / ratio,
              }
            : lot,
        ),
      };
    }

    case "DIVIDEND": {
      if (tx.cashAmount === undefined) {
        return state;
      }

      return {
        ...state,
        realizedGains: [
          ...state.realizedGains,
          {
            type: "DIVIDEND",
            lotId: tx.lotId ?? tx.id,
            symbol: tx.symbol,
            openDate: tx.date,
            closeDate: tx.date,
            shares: 0,
            costPerShare: 0,
            proceeds: tx.cashAmount,
            pnl: tx.cashAmount,
            term: "SHORT",
          },
        ],
      };
    }

    case "DEPOSIT":
    case "WITHDRAWAL":
    case "REVERSE_SPLIT":
    case "SPINOFF":
      return state;
  }
}
