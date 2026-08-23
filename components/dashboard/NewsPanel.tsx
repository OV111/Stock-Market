"use client";

import { useEffect, useState } from "react";
import Panel from "@/components/dashboard/Panel";

type NewsItem = {
  symbol: string;
  source: string;
  headline: string;
  url: string;
  datetime: number; // unix seconds
};

const timeAgo = (unixSeconds: number) => {
  const diffMs = Date.now() - unixSeconds * 1000;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const NewsPanel = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNews(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Panel title="NEWS" slot="@news" meta="filtered to watchlist">
      {loading && <p className="text-gray-500 text-sm py-3">Loading news...</p>}
      {error && <p className="text-red-500 text-sm py-3">Failed to load news.</p>}
      {!loading && !error && (
        <div className="flex flex-col divide-y divide-gray-800/80">
          {news.slice(0, 4).map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 first:pt-0 last:pb-0 block hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-gray-500">
                <span className="text-blue-400 font-semibold">{item.symbol}</span>
                <span>·</span>
                <span>{item.source}</span>
                <span>·</span>
                <span>{timeAgo(item.datetime)}</span>
              </div>
              <p className="text-sm text-gray-200 leading-snug">{item.headline}</p>
            </a>
          ))}
        </div>
      )}
    </Panel>
  );
};

export default NewsPanel;
