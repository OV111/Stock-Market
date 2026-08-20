import Panel from "@/components/dashboard/Panel";

type NewsItem = {
  symbol: string;
  source: string;
  timeAgo: string;
  headline: string;
};

const news: NewsItem[] = [
  {
    symbol: "NVDA",
    source: "Reuters",
    timeAgo: "12m ago",
    headline: "Nvidia lifts data-center outlook as Blackwell shipments accelerate into Q4",
  },
  {
    symbol: "AAPL",
    source: "Bloomberg",
    timeAgo: "48m ago",
    headline: "Apple begins volume production of foldable iPhone display, supplier says",
  },
  {
    symbol: "TSLA",
    source: "WSJ",
    timeAgo: "1h ago",
    headline: "Tesla trims Model Y pricing in China as domestic competition intensifies",
  },
  {
    symbol: "MSFT",
    source: "CNBC",
    timeAgo: "2h ago",
    headline: "Microsoft signs multi-year capacity deal to expand Azure AI footprint in Europe",
  },
];

const NewsPanel = () => {
  return (
    <Panel title="NEWS" slot="@news" meta="filtered to watchlist">
      <div className="flex flex-col divide-y divide-gray-800/80">
        {news.map((item, i) => (
          <div key={i} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-gray-500">
              <span className="text-blue-400 font-semibold">{item.symbol}</span>
              <span>·</span>
              <span>{item.source}</span>
              <span>·</span>
              <span>{item.timeAgo}</span>
            </div>
            <p className="text-sm text-gray-200 leading-snug">{item.headline}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default NewsPanel;
