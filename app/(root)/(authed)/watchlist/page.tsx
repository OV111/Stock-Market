"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, X } from "lucide-react";

type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

const WatchlistPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadWatchlist = () => {
    setLoading(true);
    setError(false);
    return fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuotes(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = newSymbol.trim();
    if (!symbol || submitting) return;

    setSubmitting(true);
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      setNewSymbol("");
      await loadWatchlist();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    setQuotes((prev) => prev.filter((q) => q.symbol !== symbol));
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    loadWatchlist();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Watchlist</h1>
        <p className="text-gray-500 mt-1 text-sm">Track the symbols you care about</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 max-w-sm">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Add symbol (e.g. AAPL)"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-500"
        />
        <button
          type="submit"
          disabled={submitting || !newSymbol.trim()}
          className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <p className="text-gray-500 text-lg">Loading watchlist...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <p className="text-red-500 text-lg">Failed to load watchlist.</p>
        </div>
      ) : quotes.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No symbols yet — add one above to start tracking it.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quotes.map((quote) => {
            const isPositive = quote.changePercent >= 0;
            return (
              <div
                key={quote.symbol}
                className="bg-gray-800 border border-gray-600 rounded-xl p-5 hover:border-gray-500 transition-colors relative"
              >
                <button
                  onClick={() => handleRemove(quote.symbol)}
                  aria-label={`Remove ${quote.symbol}`}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start justify-between mb-4 pr-6">
                  <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-gray-700 text-yellow-400">
                    {quote.symbol}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded ${
                      isPositive
                        ? "bg-teal-400/10 text-teal-400"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {isPositive ? "+" : ""}
                    {quote.changePercent?.toFixed(2)}%
                  </div>
                </div>

                <p className="text-2xl font-bold text-gray-100 font-mono">
                  $
                  {quote.price?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
                </p>

                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>
                    Change:{" "}
                    <span className={isPositive ? "text-teal-400" : "text-red-500"}>
                      {isPositive ? "+" : ""}${quote.change?.toFixed(4)}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
