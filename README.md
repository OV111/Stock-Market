# Stoxly

Stoxly is a portfolio analytics platform for stocks and crypto, built to get the financial math right — not just display prices. Most trackers compute returns as a naive `(current − cost) / cost`, which quietly breaks the moment a second deposit or a stock split happens. Stoxly's core is an append-only transaction ledger: holdings are *derived* from that log, never stored as mutable rows, which is what makes splits, dividends, and backdated trades tractable instead of corrupting cost basis.

On top of that ledger sit real portfolio metrics — time-weighted and money-weighted returns (TWR/XIRR), lot-level tax accounting (FIFO/LIFO), and risk analytics (beta, volatility, Sharpe ratio, correlation matrix) — plus an AI layer that explains what happened in a portfolio and why, grounded strictly in tool-fetched numbers, never a price prediction.

See [Vision.md](./Vision.md) for the full product philosophy and data model, and [PITCH.md](./PITCH.md) for a short elevator pitch.

## Status

This project is under active development. Auth and live market data are the most complete subsystems so far; the ledger, risk analytics, alerts, and AI layer are designed (see `Vision.md`) but not all shipped yet. See [Known gaps](#known-gaps) below for exactly what's built vs. planned — no need to guess from the code.

## Features

**Built:**
- Full auth: email/password (bcrypt) + Google OAuth, JWT sessions via `jose`, password reset via email
- Live market data via Finnhub — top gainers/losers, index performance, per-symbol quotes
- Dashboard shell with market movers, crypto view, symbol detail pages
- Route protection middleware

**Planned (see [Vision.md](./Vision.md) build sequence):**
- Event-sourced transaction ledger (`Decimal128` money, no floats) with derived holdings
- TWR / XIRR return calculations, FIFO/LIFO cost basis, realized/unrealized P&L
- Corporate actions handling (splits, reverse splits, dividends, spinoffs)
- Risk analytics: beta, rolling volatility, max drawdown, Sharpe ratio, correlation matrix
- Request coalescing + circuit breaker over the Finnhub rate limit
- Price alerts with idempotent, exactly-once delivery
- Claude-powered summaries, grounded via tool use — no hallucinated numbers, no price predictions

## Tech stack

| Layer     | Technology |
| --------- | ---------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| UI        | Tailwind CSS 4, shadcn/ui + Radix primitives, Framer Motion |
| Data      | Finnhub API |
| Database  | MongoDB via Mongoose |
| Auth      | JWT sessions (`jose`), bcrypt, Google OAuth |
| Email     | Nodemailer (password reset) |
| AI        | Claude API — tool use + grounding validation (planned) |

## Project structure

```
app/
  (auth)/          sign-in, sign-up, forgot/reset password
  root/             authenticated app shell — dashboard, crypto, stock/[symbol], search
  api/              route handlers — auth, stocks, market, crypto
components/
  dashboard/        dashboard widgets (e.g. MarketMovers)
  landing/          marketing/landing page sections
  ui/                shared primitives (Header, NavItems, button, skeleton)
lib/                 shared server logic — mongoose.ts, auth.ts, finnhub.ts
models/               Mongoose schemas
middleware.ts         route protection
```

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (e.g. MongoDB Atlas)
- A [Finnhub](https://finnhub.io/) API key
- A Google OAuth client ID (for Google sign-in)

### Setup

```bash
npm install
```

Create a `.env.local` in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FINNHUB_API_KEY=your_finnhub_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
# SMTP settings for password reset email (Nodemailer)
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |

## Known gaps

- No Watchlist/Portfolio/Alert models or routes yet
- No AI/Claude integration yet
- `app/api/market/chart/route.ts` is an empty stub
- No test suite

## What this is not

- Not a brokerage — no trade execution
- Not a financial advisor — nothing in the app is investment advice
- Not a paper-trading/matching-engine simulator
- Not a social network

## License

No license specified yet.

---

Built by Vahe Ohanyan. © 2026 Stoxly.
