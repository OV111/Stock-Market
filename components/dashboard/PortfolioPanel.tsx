"use client";

import { useEffect, useState } from "react";
import Panel from "@/components/dashboard/Panel";

type PortfolioData = {
  holdingsValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
};

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
          {/* TWR/MWR and drift metrics come from returns-engine.ts — not yet available */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-500">Return metrics not yet available</p>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default PortfolioPanel;
