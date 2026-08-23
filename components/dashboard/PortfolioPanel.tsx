"use client";

import { useEffect, useState } from "react";
import Panel from "@/components/dashboard/Panel";

type ReturnMetrics = {
  twr: number; // decimal, e.g. 0.1482 = 14.82%
  mwr: number;
};

type RiskMetrics = {
  beta: number;
  volatility: number;
  maxDrawdown: number;
  sharpe: number;
  correlationMatrix: Record<string, Record<string, number>>;
};

type PortfolioData = {
  holdingsValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  returns: ReturnMetrics | null;
  risk: RiskMetrics | null;
};

const asPercent = (decimal: number) => `${(decimal * 100).toFixed(2)}%`;

const PortfolioPanel = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.holdingsValue === "number") setPortfolio(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Panel title="PORTFOLIO" slot="@portfolio">
        <p className="text-gray-500 text-sm">Loading portfolio...</p>
      </Panel>
    );
  }

  if (error || !portfolio) {
    return (
      <Panel title="PORTFOLIO" slot="@portfolio">
        <p className="text-red-500 text-sm">Failed to load portfolio.</p>
      </Panel>
    );
  }

  const isUnrealizedPositive = portfolio.unrealizedPnl >= 0;

  return (
    <Panel title="PORTFOLIO" slot="@portfolio" meta="settled + pending">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-1">
            HOLDINGS VALUE
          </p>
          <p className="text-3xl font-mono font-bold text-gray-100">
            ${portfolio.holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          {/* Day change requires intraday tracking — returns-engine.ts will fill this in later */}
          <p className="text-sm font-mono mt-1 text-gray-500">— today</p>

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
              <p
                className={`text-sm font-mono ${
                  isUnrealizedPositive ? "text-teal-400" : "text-red-500"
                }`}
              >
                {isUnrealizedPositive ? "+" : ""}$
                {portfolio.unrealizedPnl.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                ({isUnrealizedPositive ? "+" : ""}
                {portfolio.unrealizedPnlPct.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-gray-500 tracking-wide">
              RETURN, ANNUALIZED
            </p>
          </div>

          {portfolio.returns ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-gray-300">TWR</span>
                    <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 rounded px-1 py-0.5">
                      GIPS
                    </span>
                  </div>
                  <p
                    className={`text-lg font-mono font-bold ${
                      portfolio.returns.twr >= 0 ? "text-teal-400" : "text-red-500"
                    }`}
                  >
                    {portfolio.returns.twr >= 0 ? "+" : ""}
                    {asPercent(portfolio.returns.twr)}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                    Cash flows neutralized. Approximated at flow boundaries.
                  </p>
                </div>
                <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-gray-300">MWR</span>
                    <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 rounded px-1 py-0.5">
                      XIRR
                    </span>
                  </div>
                  <p
                    className={`text-lg font-mono font-bold ${
                      portfolio.returns.mwr >= 0 ? "text-teal-400" : "text-red-500"
                    }`}
                  >
                    {portfolio.returns.mwr >= 0 ? "+" : ""}
                    {asPercent(portfolio.returns.mwr)}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                    Newton-Raphson, bisection fallback.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800 text-[11px] font-mono">
                <span className="text-gray-500">Δ TWR-MWR</span>
                <span className="text-gray-400">
                  {((portfolio.returns.twr - portfolio.returns.mwr) * 100).toFixed(2)} pp
                </span>
              </div>
            </>
          ) : (
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">Add transactions to see returns</p>
            </div>
          )}

          {/* Risk metrics need backfilled PriceBar history — null until then. */}
          {portfolio.risk && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-2">
                RISK
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-gray-500">BETA</p>
                  <p className="text-sm font-mono text-gray-200">
                    {portfolio.risk.beta.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">VOL</p>
                  <p className="text-sm font-mono text-gray-200">
                    {asPercent(portfolio.risk.volatility)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">MAX DD</p>
                  <p className="text-sm font-mono text-red-500">
                    {asPercent(portfolio.risk.maxDrawdown)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">SHARPE</p>
                  <p className="text-sm font-mono text-gray-200">
                    {portfolio.risk.sharpe.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};

export default PortfolioPanel;
