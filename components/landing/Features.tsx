"use client";
import { useState, useEffect } from "react";
import {
  ChartNoAxesCombined,
  ArrowDownNarrowWide,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MarketChart from "@/components/landing/MarketChart";

type Stock = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

type MarketStat = {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
};

const StockSkeleton = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex justify-between items-center">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
      </div>
    ))}
  </div>
);

const Features = () => {
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [losers, setLosers] = useState<Stock[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [gainersRes, losersRes] = await Promise.all([
        fetch("/api/stocks/gainers"),
        fetch("/api/stocks/losers"),
      ]);
      setGainers(await gainersRes.json());
      setLosers(await losersRes.json());
      setLoading(false);
    };
    const fetchStats = async () => {
      const res = await fetch("/api/market/stats");
      setMarketStats(await res.json());
      setStatsLoading(false);
    };
    fetchData();
    fetchStats();
  }, []);

  return (
    <section className="container py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-blue-400 to-blue-600 bg-clip-text text-transparent">
          Today&apos;s Market Movers
        </h2>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Stay ahead with live top gainers, losers, and key market index
          performance updated in real time.
        </p>
      </div>
      <div className="flex justify-center items-center gap-4 mx-0">
        {/* Top Gainers */}
        <div className="h-100 w-full rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-3">
            <div className="flex items-center justify-center bg-green-500/10 rounded-lg p-2">
              <ChartNoAxesCombined className="text-green-400 size-4" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Top Gainers</p>
              <p className="text-gray-500 text-xs">Best performing today</p>
            </div>
          </div>
          {loading ? (
            <StockSkeleton />
          ) : (
            <div></div>
            // <div className="flex flex-col gap-3">
            //   {gainers?.map((stock) => (
            //     <div className="flex justify-between" key={stock.symbol}>
            //       <span className="text-green-400 font-medium">
            //         {stock.symbol}
            //       </span>
            //       <span className="text-gray-400">
            //         ${stock.price.toFixed(2)}
            //       </span>
            //       <span className="text-green-400">
            //         +${stock.change.toFixed(2)}
            //       </span>
            //       <span className="text-green-400">
            //         +{stock.changePercent.toFixed(2)}%
            //       </span>
            //     </div>
            //   ))}
            // </div>
          )}
        </div>

        {/* Top Losers */}
        <div className="h-100 w-full rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-3">
            <div className="flex items-center justify-center bg-red-500/10 rounded-lg p-2">
              <ArrowDownNarrowWide className="text-red-400 size-4" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Top Losers</p>
              <p className="text-gray-500 text-xs">Worst performing today</p>
            </div>
          </div>
          {/* {loading ? (
            <StockSkeleton />
          ) : (
            <div className="flex flex-col gap-3">
              {losers.map((stock) => (
                <div key={stock.symbol} className="flex justify-between">
                  <span className="text-red-400 font-medium">
                    {stock.symbol}
                  </span>
                  <span className="text-gray-400">
                    ${stock.price.toFixed(2)}
                  </span>
                  <span className="text-red-400">
                    -${Math.abs(stock.change).toFixed(2)}
                  </span>
                  <span className="text-red-400">
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )} */}
        </div>
      </div>
      {/* Market Stats Bar */}
      {/* <div className="mx-0 mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          : marketStats.map((stat) => {
              const isPositive = stat.changePercent >= 0;
              return (
                <div
                  key={stat.symbol}
                  className="flex flex-col gap-1 rounded-xl border  px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-medium">
                      {stat.label}
                    </span>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <span className="text-white font-bold text-lg">
                    ${stat.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}
                  >
                    {isPositive ? "+" : ""}
                    {stat.changePercent.toFixed(2)}%
                    <span className="text-gray-500 font-normal ml-1">
                      ({isPositive ? "+" : ""}
                      {stat.change.toFixed(2)})
                    </span>
                  </span>
                </div>
              );
            })}
      </div> */}
    </section>
  );
};

export default Features;
