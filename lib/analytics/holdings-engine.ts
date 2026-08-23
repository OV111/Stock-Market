import { ITransaction } from "@/models/Transactions";
import { Holding } from "./types";

export function buildHoldings(transactions: ITransaction[]): Holding[] {
  const sorted = [...transactions].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
  );

  const holdingsBySymbol = new Map<string, Holding>();

  for (const tx of sorted) {
    if (!tx.symbol) continue; // DEPOSIT/WITHDRAWAL don't touch holdings

    const quantity = Number(tx.quantity.toString());
    const pricePerUnit = Number(tx.pricePerUnit.toString());

    let holding = holdingsBySymbol.get(tx.symbol);
    if (!holding) {
      holding = {
        symbol: tx.symbol,
        lots: [],
        totalQuantity: 0,
        totalCostBasis: 0,
        avgCostPerUnit: 0,
        realizedPnl: 0,
      };
      holdingsBySymbol.set(tx.symbol, holding);
    }

    switch (tx.type) {
      case "BUY": {
        holding.lots.push({
          quantity,
          costPerUnit: pricePerUnit,
          occurredAt: tx.occurredAt,
        });
        break;
      }

      case "SELL": {
        let remainingToSell = quantity;
        while (remainingToSell > 0 && holding.lots.length > 0) {
          const lot = holding.lots[0]; // FIFO: oldest lot first
          const sold = Math.min(lot.quantity, remainingToSell);

          holding.realizedPnl += (pricePerUnit - lot.costPerUnit) * sold;

          lot.quantity -= sold;
          remainingToSell -= sold;
          if (lot.quantity === 0) holding.lots.shift();
        }
        break;
      }

      case "SPLIT": {
        // `quantity` is overloaded here as the split ratio, e.g. 4 for a 4:1 split
        const ratio = quantity;
        for (const lot of holding.lots) {
          lot.quantity *= ratio;
          lot.costPerUnit /= ratio;
        }
        break;
      }

      case "DIVIDEND":
        // doesn't change holdings — feeds the cash-flow timeline instead
        break;
    }
  }

  for (const holding of holdingsBySymbol.values()) {
    holding.totalQuantity = holding.lots.reduce((sum, l) => sum + l.quantity, 0);
    holding.totalCostBasis = holding.lots.reduce(
      (sum, l) => sum + l.quantity * l.costPerUnit,
      0,
    );
    holding.avgCostPerUnit =
      holding.totalQuantity > 0 ? holding.totalCostBasis / holding.totalQuantity : 0;
  }

  return Array.from(holdingsBySymbol.values()).filter((h) => h.totalQuantity > 0);
}
