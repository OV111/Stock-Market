import Panel from "@/components/dashboard/Panel";

type Mover = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

const gainers: Mover[] = [
  { symbol: "NVDA", name: "NVIDIA Corp", price: 184.62, change: 9.41, changePercent: 5.37 },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 162.08, change: 6.12, changePercent: 3.92 },
  { symbol: "SMCI", name: "Super Micro Computer", price: 41.77, change: 1.36, changePercent: 3.37 },
  { symbol: "MU", name: "Micron Technology", price: 118.94, change: 3.21, changePercent: 2.77 },
  { symbol: "PLTR", name: "Palantir Technologies", price: 78.15, change: 1.84, changePercent: 2.41 },
];

const losers: Mover[] = [
  { symbol: "INTC", name: "Intel Corp", price: 21.06, change: -1.28, changePercent: -5.73 },
  { symbol: "PFE", name: "Pfizer Inc", price: 24.31, change: -0.96, changePercent: -3.8 },
  { symbol: "NKE", name: "Nike Inc", price: 68.42, change: -2.11, changePercent: -2.99 },
  { symbol: "BA", name: "Boeing Co", price: 154.87, change: -3.42, changePercent: -2.16 },
  { symbol: "WBA", name: "Walgreens Boots", price: 9.14, change: -0.17, changePercent: -1.83 },
];

const MoverRow = ({ mover }: { mover: Mover }) => {
  const isPositive = mover.changePercent >= 0;
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:bg-gray-800/40 rounded-lg px-2 -mx-2 transition-colors">
      <div className="flex flex-col">
        <span className="font-mono font-semibold text-sm text-gray-100">{mover.symbol}</span>
        <span className="text-[11px] text-gray-500">{mover.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-gray-300">{mover.price.toFixed(2)}</span>
        <span className={`text-xs font-mono ${isPositive ? "text-teal-400" : "text-red-500"}`}>
          {isPositive ? "+" : ""}
          {mover.change.toFixed(2)}
        </span>
        <span
          className={`text-xs font-mono font-medium px-2 py-1 rounded ${
            isPositive ? "bg-teal-400/10 text-teal-400" : "bg-red-500/10 text-red-500"
          }`}
        >
          {isPositive ? "+" : ""}
          {mover.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

const MoversPanel = () => {
  return (
    <Panel title="MOVERS" slot="@movers" meta="S&P 500 · 15m delayed">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <h3 className="text-[11px] font-semibold text-teal-400 tracking-wide">TOP GAINERS</h3>
          </div>
          <div className="flex flex-col divide-y divide-gray-800/80">
            {gainers.map((mover) => (
              <MoverRow key={mover.symbol} mover={mover} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <h3 className="text-[11px] font-semibold text-red-500 tracking-wide">TOP LOSERS</h3>
          </div>
          <div className="flex flex-col divide-y divide-gray-800/80">
            {losers.map((mover) => (
              <MoverRow key={mover.symbol} mover={mover} />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default MoversPanel;
