"use client";

import { useEffect, useState } from "react";
import Panel from "@/components/dashboard/Panel";

type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

const WatchlistPanel = () => {
  const [watchlist, setWatchlist] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWatchlist(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Panel title="WATCHLIST" slot="@watchlist" meta={`${watchlist.length} symbols`}>
      {loading ? (
        <p className="text-sm text-gray-500 py-4 text-center">Loading watchlist...</p>
      ) : error ? (
        <p className="text-sm text-red-500 py-4 text-center">Failed to load watchlist.</p>
      ) : watchlist.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No symbols yet — add one from the Watchlist page.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-800/80">
          {watchlist.map((item) => {
            const isPositive = item.changePercent >= 0;
            return (
              <div
                key={item.symbol}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:bg-gray-800/40 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-semibold text-sm text-gray-100">
                    {item.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-300">
                    {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-xs font-mono font-medium px-2 py-1 rounded ${
                      isPositive ? "bg-teal-400/10 text-teal-400" : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};

export default WatchlistPanel;
