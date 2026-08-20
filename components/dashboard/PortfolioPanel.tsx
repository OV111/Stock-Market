import Panel from "@/components/dashboard/Panel";

const portfolio = {
  holdingsValue: 248910.44,
  dayChange: 3204.18,
  dayChangePercent: 1.3,
  costBasis: 196447.02,
  unrealized: 52463.42,
  since: "2023-04-11",
  twr: 14.82,
  mwr: 11.06,
  twrNote: "Daily-chained, cash flows neutralized. 847 sub-periods.",
  mwrNote: "Newton solve, tol 1e-7, converged in 6 iters over 47 flows.",
  driftPp: 3.76,
  driftNote: "timing drag from Q1 deposits",
};

const PortfolioPanel = () => {
  const isDayPositive = portfolio.dayChange >= 0;

  return (
    <Panel title="PORTFOLIO" slot="@portfolio" meta="as of 14:32 ET · settled + pending">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-1">
            HOLDINGS VALUE
          </p>
          <p className="text-3xl font-mono font-bold text-gray-100">
            ${portfolio.holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-mono mt-1 ${isDayPositive ? "text-teal-400" : "text-red-500"}`}>
            {isDayPositive ? "+" : ""}${portfolio.dayChange.toFixed(2)}{" "}
            {isDayPositive ? "+" : ""}
            {portfolio.dayChangePercent.toFixed(2)}%{" "}
            <span className="text-gray-500">today</span>
          </p>

          <div className="flex gap-8 mt-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-1">
                COST BASIS
              </p>
              <p className="text-sm font-mono text-gray-300">
                ${portfolio.costBasis.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-1">
                UNREALIZED
              </p>
              <p className="text-sm font-mono text-teal-400">
                +${portfolio.unrealized.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-gray-500 tracking-wide">
              RETURN, ANNUALIZED
            </p>
            <p className="text-[11px] font-mono text-gray-600">since {portfolio.since}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold text-gray-300">TWR</span>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 rounded px-1 py-0.5">
                  GIPS
                </span>
              </div>
              <p className="text-lg font-mono font-bold text-teal-400">
                +{portfolio.twr.toFixed(2)}%
              </p>
              <p className="text-[10px] text-gray-500 mt-1 leading-snug">{portfolio.twrNote}</p>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold text-gray-300">MWR</span>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 rounded px-1 py-0.5">
                  XIRR
                </span>
              </div>
              <p className="text-lg font-mono font-bold text-teal-400">
                +{portfolio.mwr.toFixed(2)}%
              </p>
              <p className="text-[10px] text-gray-500 mt-1 leading-snug">{portfolio.mwrNote}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800 text-[11px] font-mono">
            <span className="text-gray-500">Δ TWR-MWR</span>
            <span className="text-gray-400">
              {portfolio.driftPp.toFixed(2)} pp — {portfolio.driftNote}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default PortfolioPanel;
