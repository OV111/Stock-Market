"use client";
import { useState, useEffect } from "react";
import { ChartNoAxesCombined, ArrowDownNarrowWide } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MarketChart from "@/components/landing/MarketChart";

type Stock = {
  symbol: string;
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
  const [loading, setLoading] = useState(true);

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
    fetchData();
  }, []);

  return (
    <section>
      <div className="flex justify-center items-center gap-4 mx-6">
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
            <div className="flex flex-col gap-3">
              {gainers.map((stock) => (
                <div className="flex justify-between" key={stock.symbol}>
                  <span className="text-green-400 font-medium">
                    {stock.symbol}
                  </span>
                  <span className="text-gray-400">
                    ${stock.price.toFixed(2)}
                  </span>
                  <span className="text-green-400">
                    +{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
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
          {loading ? (
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
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* TradingView Chart */}
      <div className="rounded-sm border border-gray-800 mx-6 mt-4 overflow-hidden">
        {/* <div
          className="tradingview-widget-container"
          style={{ height: "800px" }}
        >
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=SP%3ASPX&interval=D&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=0&toolbarbg=1e222d&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en"
            style={{ width: "100%", height: "800px" }}
            allowTransparency
            allowFullScreen
          />
        </div> */}
      </div>
    </section>
  );
};

export default Features;
