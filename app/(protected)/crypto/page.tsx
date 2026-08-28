"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type CryptoAsset = {
  symbol: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
};

const CryptoPage = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/crypto")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAssets(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 text-lg">Loading crypto assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500 text-lg">Failed to load crypto data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Crypto Assets</h1>
        <p className="text-gray-500 mt-1 text-sm">Live prices for top cryptocurrencies</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const isPositive = asset.changePercent >= 0;
          return (
            <div
              key={asset.ticker}
              className="bg-gray-800 border border-gray-600 rounded-xl p-5 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-gray-700 text-yellow-400">
                    {asset.ticker}
                  </span>
                  <p className="text-gray-300 font-semibold text-base mt-2">{asset.name}</p>
                </div>
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
                  {asset.changePercent?.toFixed(2)}%
                </div>
              </div>

              <p className="text-2xl font-bold text-gray-100">
                ${asset.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </p>

              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>
                  Change:{" "}
                  <span className={isPositive ? "text-teal-400" : "text-red-500"}>
                    {isPositive ? "+" : ""}${asset.change?.toFixed(4)}
                  </span>
                </span>
                <span>H: ${asset.high?.toFixed(2)} · L: ${asset.low?.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoPage;
