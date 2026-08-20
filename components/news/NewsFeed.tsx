"use client";

import { useState, useMemo } from "react";
import SymbolFilterBar from "@/components/news/SymbolFilterBar";
import NewsCard from "@/components/news/NewsCard";

type NewsItem = {
  symbols: string[];
  source: string;
  timeAgo: string;
  headline: string;
  summary: string;
};

const news: NewsItem[] = [
  {
    symbols: ["NVDA"],
    source: "Reuters",
    timeAgo: "12m ago",
    headline: "Nvidia lifts data-center outlook as Blackwell shipments accelerate into Q4",
    summary:
      "Management pointed to stronger-than-expected demand from hyperscale customers heading into the holiday quarter.",
  },
  {
    symbols: ["AAPL"],
    source: "Bloomberg",
    timeAgo: "48m ago",
    headline: "Apple begins volume production of foldable iPhone display, supplier says",
    summary:
      "Supply-chain checks point to a 2027 launch window, with panel yields improving faster than earlier estimates.",
  },
  {
    symbols: ["TSLA"],
    source: "WSJ",
    timeAgo: "1h ago",
    headline: "Tesla trims Model Y pricing in China as domestic competition intensifies",
    summary:
      "The cut follows similar moves from BYD and Nio, as automakers compete for share in a slowing EV market.",
  },
  {
    symbols: ["MSFT"],
    source: "CNBC",
    timeAgo: "2h ago",
    headline: "Microsoft signs multi-year capacity deal to expand Azure AI footprint in Europe",
    summary:
      "The agreement adds new data-center capacity in Ireland and the Netherlands starting next fiscal year.",
  },
  {
    symbols: ["AMZN", "GOOGL"],
    source: "Reuters",
    timeAgo: "3h ago",
    headline: "Cloud price war resumes as Amazon and Google cut storage rates",
    summary: "Both companies lowered egress fees for the second time this year, pressuring margins across the sector.",
  },
];

const watchlistSymbols = ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "NVDA"];

const NewsFeed = () => {
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeSymbol) return news;
    return news.filter((item) => item.symbols.includes(activeSymbol));
  }, [activeSymbol]);

  return (
    <div>
      <SymbolFilterBar symbols={watchlistSymbols} active={activeSymbol} onChange={setActiveSymbol} />
      <div className="flex flex-col gap-4">
        {filtered.map((item, i) => (
          <NewsCard key={i} {...item} />
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-12">
            No recent headlines for this symbol.
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
