export type TransactionType =
  | "BUY"
  | "SELL"
  | "SPLIT"
  | "REVERSE_SPLIT"
  | "DIVIDEND"
  | "SPINOFF"
  | "DEPOSIT"
  | "WITHDRAWAL";

export interface Transaction {
  id: string;
  accountId: string;
  symbol: string;
  type: TransactionType;
  date: Date;
  /** Always positive; transaction type determines direction. */
  shares?: number;
  price?: number;
  cashAmount?: number;
  splitRatio?: number;
  relatedSymbol?: string;
  lotId?: string;
}

export interface Lot {
  id: string;
  symbol: string;
  openDate: Date;
  shares: number;
  costPerShare: number;
  originalCostPerShare: number;
}

export type CostBasisMethod = "FIFO" | "LIFO" | "SPECIFIC_LOT";

export interface RealizedGain {
  type: "TRADE" | "DIVIDEND" | "SPINOFF";
  lotId: string;
  symbol: string;
  openDate: Date;
  closeDate: Date;
  shares: number;
  costPerShare: number;
  proceeds: number;
  pnl: number;
  term: "SHORT" | "LONG";
}

export interface LedgerState {
  lots: Lot[];
  realizedGains: RealizedGain[];
  costBasisMethod: CostBasisMethod;
}

export interface Position {
  symbol: string;
  lots: Lot[];
  totalShares: number;
  avgCostBasis: number;
  totalCostBasis: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
}
