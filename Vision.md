# Vision — Stoxly

## What It Is

Stoxly is a personal finance dashboard for tracking stocks, crypto assets, and market movements in one place. It is built for people who want real clarity on their portfolio — not a brokerage, not a social platform, not an algorithmic trading tool. Just clean, fast, live data, AI-powered insights, and the tools to make sense of it all.

---

## Why It Exists

Most market tracking tools are either too simple (a basic price lookup) or too overwhelming (Bloomberg-level dashboards built for professionals). Stoxly sits between those extremes — powerful enough to be genuinely useful, clean enough to not require a manual.

The goal is to remove friction from staying informed. Open the app, see what matters, get an AI summary of what moved and why, act if you need to.

---

## Core Principles

**Live over stale.**
Every price, every percentage, every market stat should reflect what is happening now — not cached from an hour ago. Real-time data is the baseline, not a premium feature.

**Clarity over noise.**
The dashboard shows what you need. Top gainers, top losers, key index performance, your watchlist, and an AI digest of what matters. Not 40 widgets fighting for attention.

**Personal over generic.**
Stoxly is built around your portfolio and the stocks you actually follow. Market news is filtered to what you track. AI summaries are scoped to your watchlist. Alerts fire when your assets move.

**Fast and lightweight.**
Dark UI, sharp typography, minimal chrome. The interface loads fast and stays out of the way.

---

## What It Does

### Portfolio & Watchlist
Track the stocks and crypto assets you care about. Save them to a personal watchlist, monitor price movements and percentage changes, and manage your holdings in one place. Persistent across sessions — your data, always available.

### Market Overview
Top gainers and losers updated live. Key index performance — S&P 500, Nasdaq, Dow, and others — at a glance. No digging required.

### Real-Time Charts
Interactive price history charts powered by TradingView. Intraday, weekly, monthly — with clean rendering that doesn't slow the page down.

### AI-Generated Market Summaries
After market hours or on demand, Stoxly generates a concise AI summary of what happened across your watchlist — which assets moved, why, and what news drove it. Streamed live into the UI. Not generic market commentary — your portfolio, summarized.

### Price Alerts
Set a target price for any stock or crypto asset. Get notified when it hits. Simple threshold alerts — no complex conditional logic, just the signal you asked for.

### Stock & Crypto Detail Pages
Per-symbol deep dives: real-time price, interactive chart, key stats, and the latest news filtered to that asset. Everything needed to make an informed decision, on one page.

### Market News
Financial news filtered by what you follow. No generic headlines — just news relevant to your watchlist, surfaced in real time.

### Search
Find any stock or crypto asset instantly. Symbol or company name — fast and unambiguous.

---

## Who It Is For

- Individual investors who want a cleaner alternative to Yahoo Finance or Google Finance
- Crypto holders who want stocks and digital assets tracked in the same place
- Anyone who checks the market daily and wants that check to take 10 seconds, not 2 minutes

---

## What It Is Not

- Not a brokerage — Stoxly does not execute trades
- Not a financial advisor — nothing here is investment advice
- Not a social network — no feeds, no followers, no sentiment scores from strangers

---

## Tech Foundation

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Framework  | Next.js 15 (App Router, SSR + Client Components)  |
| UI         | Tailwind CSS, Framer Motion, shadcn/ui            |
| Data       | Finnhub API, TradingView widgets                  |
| AI         | Claude API (streaming market summaries)           |
| Auth       | Next.js auth routes, JWT session                  |
| Database   | MongoDB (Mongoose)                                |

---

## Technical Signals

Built to demonstrate end-to-end engineering across a real domain:

- **API integration** — Finnhub for live market data, news, and symbol search
- **Data visualization** — TradingView charts, live price feeds, index performance
- **AI features** — Streaming Claude summaries scoped to user watchlist
- **Real-time systems** — Live price updates, SSE streaming for AI output
- **FinTech domain** — Portfolio logic, asset tracking, price alert thresholds, multi-asset support (stocks + crypto)
- **Full-stack auth** — JWT sessions, persistent user state, MongoDB-backed watchlists

---

## Long-Term Direction

The core — fast, live, personal — stays constant. Future additions:

- Portfolio performance tracking with gain/loss history over time
- Price alerts via email or push notification
- Expanded crypto coverage beyond major assets
- Sector and industry breakdown views
- Mobile-optimized experience

---

*Built by Vahe Ohanyan. © 2025 Stoxly.*