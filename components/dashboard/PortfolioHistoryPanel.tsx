"use client";

import { useEffect, useState } from "react";
import Panel from "./Panel";
import PriceChart from "@/components/stock/PriceChart";

type Snapshot = {
  snapshotDate: string;
  holdingsValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
};

const formatUsd = (value: number) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const PortfolioHistoryPanel = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/snapshots")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSnapshots(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // A single point can't draw a line, so treat <2 as "no history yet" rather
  // than rendering a degenerate chart.
  const hasChart = snapshots.length >= 2;

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const meta = hasChart
    ? `${snapshots.length} days · ${formatUsd(last.holdingsValue)}`
    : undefined;

  // PriceChart is reused as-is (it only reads `close`); the other OHLCV fields
  // are filled from holdingsValue so the existing chart component needs no
  // change and no charting dependency is added.
  const candles = snapshots.map((s) => ({
    timestamp: s.snapshotDate,
    open: s.holdingsValue,
    high: s.holdingsValue,
    low: s.holdingsValue,
    close: s.holdingsValue,
    volume: 0,
  }));

  return (
    <Panel title="PORTFOLIO HISTORY" slot="90D" meta={meta}>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading history...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">Failed to load portfolio history.</p>
      ) : !hasChart ? (
        <p className="text-gray-500 text-sm">
          No portfolio history yet — snapshots are captured daily.
        </p>
      ) : (
        <div className="space-y-3">
          <PriceChart candles={candles} />
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
            <span>{new Date(first.snapshotDate).toLocaleDateString("en-US")}</span>
            <span>{new Date(last.snapshotDate).toLocaleDateString("en-US")}</span>
          </div>
        </div>
      )}
    </Panel>
  );
};

export default PortfolioHistoryPanel;
