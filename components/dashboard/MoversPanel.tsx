"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Panel from "@/components/dashboard/Panel";

type Mover = {
  symbol: string;
  name: string;
  image: string;
  price: number;
  change: number;
  changePercent: number;
};

type MoversData = { gainers: Mover[]; losers: Mover[] };

const MoverRow = ({ mover }: { mover: Mover }) => {
  const isPositive = mover.changePercent >= 0;
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-2.5 first:pt-0 last:pb-0 hover:bg-gray-800/40">
      <div className="flex min-w-0 items-center gap-2">
        <Image src={mover.image} alt="" width={24} height={24} className="size-6 shrink-0" />
        <div className="min-w-0">
          <span className="block truncate font-mono text-sm font-semibold text-gray-100">{mover.symbol.toUpperCase()}</span>
          <span className="block truncate text-[11px] text-gray-500">{mover.name}</span>
        </div>
      </div>
      <div className="ml-3 flex shrink-0 items-center gap-3">
        <span className="font-mono text-sm text-gray-300">${mover.price.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
        <span className={`rounded px-2 py-1 font-mono text-xs font-medium ${isPositive ? "bg-teal-400/10 text-teal-400" : "bg-red-500/10 text-red-500"}`}>
          {isPositive ? "+" : ""}{mover.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

const MoversPanel = () => {
  const [data, setData] = useState<MoversData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch("/api/market/movers")
        .then((response) => response.json())
        .then((json) => {
          if (Array.isArray(json.gainers) && Array.isArray(json.losers)) setData(json);
          else setError(true);
        })
        .catch(() => setError(true));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Panel title="CRYPTO MOVERS" slot="@movers" meta="Top 100 by market cap · 24h">
      {error ? (
        <p className="py-4 text-sm text-red-500">Couldn&apos;t load crypto movers.</p>
      ) : !data ? (
        <p className="py-4 text-sm text-gray-500">Loading crypto movers...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <MoversColumn title="TOP GAINERS" dotClass="bg-teal-400" movers={data.gainers} />
          <MoversColumn title="TOP LOSERS" dotClass="bg-red-500" movers={data.losers} />
        </div>
      )}
    </Panel>
  );
};

const MoversColumn = ({ title, dotClass, movers }: { title: string; dotClass: string; movers: Mover[] }) => (
  <div>
    <div className="mb-2 flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${dotClass}`} /><h3 className={`text-[11px] font-semibold tracking-wide ${title === "TOP GAINERS" ? "text-teal-400" : "text-red-500"}`}>{title}</h3></div>
    {movers.length ? <div className="flex flex-col divide-y divide-gray-800/80">{movers.map((mover) => <MoverRow key={mover.symbol} mover={mover} />)}</div> : <p className="py-3 text-sm text-gray-500">No data available.</p>}
  </div>
);

export default MoversPanel;
