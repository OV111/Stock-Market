import Panel from "@/components/dashboard/Panel";

type WatchlistItem = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
};

const watchlist: WatchlistItem[] = [
  { symbol: "AAPL", name: "Apple", price: 229.87, changePercent: 0.84 },
  { symbol: "MSFT", name: "Microsoft", price: 431.2, changePercent: 1.12 },
  { symbol: "TSLA", name: "Tesla", price: 246.55, changePercent: -2.07 },
  { symbol: "AMZN", name: "Amazon", price: 201.44, changePercent: 0.36 },
  { symbol: "GOOGL", name: "Alphabet", price: 176.92, changePercent: -0.48 },
  { symbol: "BTC", name: "Bitcoin", price: 96214.0, changePercent: 3.05 },
];

const WatchlistPanel = () => {
  return (
    <Panel title="WATCHLIST" slot="@watchlist" meta={`${watchlist.length} symbols`}>
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
                <span className="text-xs text-gray-500">{item.name}</span>
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
    </Panel>
  );
};

export default WatchlistPanel;
