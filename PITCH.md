# Stoxly — Elevator Pitch

## Short version

Stoxly is a portfolio analytics platform for stocks and crypto, built to do the financial math correctly, not just display prices. The core is an append-only transaction ledger — positions are derived from it, never stored directly — which is what lets it correctly handle stock splits, dividends, and backdated trades without corrupting cost basis. On top of that it calculates real portfolio metrics: time-weighted and money-weighted returns (TWR/XIRR), lot-level tax accounting (FIFO/LIFO), and risk analytics like beta, volatility, Sharpe ratio, and a correlation matrix. There's also an AI layer that generates plain-language market summaries, but it's strictly grounded — it can only report numbers it received from a tool call against real portfolio data, never invent or predict prices.

## Layer breakdown (if asked for more detail)

1. **Ledger & data model** — transactions as an event log with `Decimal128` for money (not floats), frozen FX rates per transaction, bitemporal dates (`occurredAt` vs `createdAt`) so corrections don't corrupt history.
2. **Financial calculations** — TWR, XIRR (Newton-Raphson with bisection fallback), realized/unrealized P&L, correct handling of splits/dividends.
3. **Risk analytics** — beta vs benchmark, rolling volatility, max drawdown, Sharpe ratio, correlation matrix across holdings.
4. **Live market data** — Finnhub integration with request coalescing/singleflight and a circuit breaker to handle rate limits gracefully.
5. **Alerts** — price threshold alerts with idempotent, exactly-once delivery (no duplicate-fire on price oscillation).
6. **AI summaries** — Claude-powered, tool-grounded ("only numbers it fetched, never hallucinated"), explains what moved and why — not predictions.
7. **Auth & persistence** — JWT sessions, Google OAuth, MongoDB-backed watchlists/portfolios.

## One-liner (differentiation)

Most portfolio trackers get the math wrong the moment you make a second deposit or the stock splits — this one is built on an event-sourced ledger specifically so that can't happen.

## Honesty note

Some of this (alerts worker, risk analytics, full AI grounding) is on the roadmap rather than fully shipped yet — see `Vision.md` build sequence and `CLAUDE.md` known gaps. If asked directly, be upfront about built vs. planned; "here's what I designed for" is still a strong answer.
