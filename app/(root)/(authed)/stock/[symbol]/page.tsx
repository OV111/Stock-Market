"use client";

import { use, useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import PriceChart from "@/components/stock/PriceChart";

type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

type CompanyProfile = {
  symbol: string;
  name: string;
  logo: string;
  industry: string;
  marketCapitalization: number;
  currency: string;
  exchange: string;
};

type NewsItem = {
  symbol: string;
  source: string;
  headline: string;
  summary: string;
  url: string;
  datetime: number;
};

type CandleBar = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type InsiderFiling = {
  accessionNumber: string;
  filingDate: string;
  formType: string;
  filerName: string | null;
  documentUrl: string;
};

type StockData = {
  quote: Quote | null;
  profile: CompanyProfile | null;
  news: NewsItem[];
  candles: CandleBar[] | null;
  insiderFilings: InsiderFiling[];
};

const timeAgo = (unixSeconds: number) => {
  const diffMs = Date.now() - unixSeconds * 1000;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatMarketCap = (marketCapMillions: number) => {
  if (marketCapMillions >= 1_000_000) return `$${(marketCapMillions / 1_000_000).toFixed(2)}T`;
  if (marketCapMillions >= 1_000) return `$${(marketCapMillions / 1_000).toFixed(2)}B`;
  return `$${marketCapMillions.toFixed(0)}M`;
};

type StockPageProps = {
  params: Promise<{ symbol: string }>;
};

const StockPage = ({ params }: StockPageProps) => {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();

  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/stocks/${upperSymbol}`)
      .then((r) => r.json())
      .then((json) => {
        if (json && !json.error) setData(json);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [upperSymbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 text-lg">Loading {upperSymbol}...</p>
      </div>
    );
  }

  if (error || !data || !data.quote) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500 text-lg">Failed to load data for {upperSymbol}.</p>
      </div>
    );
  }

  const { quote, profile, news, candles, insiderFilings } = data;
  const isPositive = quote.changePercent >= 0;
  const hasChart = Array.isArray(candles) && candles.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            {profile?.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logo}
                alt={`${upperSymbol} logo`}
                className="w-12 h-12 rounded-lg bg-gray-700 object-contain p-1"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                  {profile?.name ?? upperSymbol}
                </h1>
                <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-gray-700 text-yellow-400">
                  {upperSymbol}
                </span>
              </div>
              {profile?.exchange && (
                <p className="text-gray-500 mt-1 text-sm">{profile.exchange}</p>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-3xl md:text-4xl font-bold font-mono text-gray-100">
              ${quote.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div
              className={`inline-flex items-center gap-1 text-sm font-medium font-mono px-2 py-1 rounded mt-2 ${
                isPositive ? "bg-teal-400/10 text-teal-400" : "bg-red-500/10 text-red-500"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isPositive ? "+" : ""}
              {quote.change?.toFixed(2)} ({isPositive ? "+" : ""}
              {quote.changePercent?.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Stats row */}
        {profile && (
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-700">
            {profile.marketCapitalization != null && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Market Cap</p>
                <p className="text-sm font-mono text-gray-200 mt-1">
                  {formatMarketCap(profile.marketCapitalization)}
                </p>
              </div>
            )}
            {profile.industry && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Industry</p>
                <p className="text-sm text-gray-200 mt-1">{profile.industry}</p>
              </div>
            )}
            {profile.currency && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Currency</p>
                <p className="text-sm font-mono text-gray-200 mt-1">{profile.currency}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price chart */}
      {hasChart && (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Price History (90d)
          </h2>
          <PriceChart candles={candles!} />
        </div>
      )}

      {/* Insider activity — SEC EDGAR Form 4 filings, metadata only for now */}
      {insiderFilings.length > 0 && (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Insider Activity
          </h2>
          <div className="flex flex-col divide-y divide-gray-800/80">
            {insiderFilings.map((filing) => (
              <a
                key={filing.accessionNumber}
                href={filing.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-gray-700 text-blue-400">
                    Form {filing.formType}
                  </span>
                  <span>{filing.filerName ?? "Insider transaction"}</span>
                </div>
                <span className="text-xs font-mono text-gray-500">{filing.filingDate}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* News */}
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">News</h2>
        {news.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No recent news for {upperSymbol}.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-800/80">
            {news.slice(0, 10).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 first:pt-0 last:pb-0 block hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-gray-500">
                  <span className="text-blue-400 font-semibold">{item.symbol}</span>
                  <span>·</span>
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{timeAgo(item.datetime)}</span>
                </div>
                <p className="text-sm text-gray-200 leading-snug">{item.headline}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPage;
