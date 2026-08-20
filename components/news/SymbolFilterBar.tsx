"use client";

type SymbolFilterBarProps = {
  symbols: string[];
  active: string | null;
  onChange: (symbol: string | null) => void;
};

const SymbolFilterBar = ({ symbols, active, onChange }: SymbolFilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <button
        onClick={() => onChange(null)}
        className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-full border transition-colors ${
          active === null
            ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
            : "border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
        }`}
      >
        All watchlist
      </button>
      {symbols.map((symbol) => (
        <button
          key={symbol}
          onClick={() => onChange(symbol)}
          className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            active === symbol
              ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
              : "border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
          }`}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
};

export default SymbolFilterBar;
