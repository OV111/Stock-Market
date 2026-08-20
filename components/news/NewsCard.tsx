type NewsCardProps = {
  symbols: string[];
  source: string;
  timeAgo: string;
  headline: string;
  summary: string;
};

const NewsCard = ({ symbols, source, timeAgo, headline, summary }: NewsCardProps) => {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
        {symbols.map((symbol) => (
          <span
            key={symbol}
            className="font-mono font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5"
          >
            {symbol}
          </span>
        ))}
        <span>{source}</span>
        <span>·</span>
        <span>{timeAgo}</span>
      </div>
      <h3 className="text-gray-100 font-semibold text-base leading-snug mb-1.5">{headline}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{summary}</p>
    </div>
  );
};

export default NewsCard;
