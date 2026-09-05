// validators/schemas.ts
import { z } from "zod";

// MarketData schema for runtime validation
export const MarketDataSchema = z.object({
  priceUsd: z.number().positive(),
  marketCap: z.number().positive(),
  volume24h: z.number().nonnegative(),
  circulatingSupply: z.number().nonnegative(),
  totalSupply: z.number().nonnegative(),
  maxSupply: z.number().nullable(),
  priceChange24h: z.number(),
  volatility30d: z.number().nonnegative(),
  // ... add all fields
});

export const TechnicalIndicatorsSchema = z.object({
  rsi14: z.number().min(0).max(100),
  macd: z.object({
    value: z.number(),
    signal: z.number(),
    histogram: z.number(),
  }),
  // ... etc
});

// Example of usage in collector:
// const parsed = MarketDataSchema.safeParse(apiResponse);
// if (!parsed.success) { /* handle error */ }
