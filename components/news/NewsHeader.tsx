const NewsHeader = ({ updatedAgo }: { updatedAgo: string }) => {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-400 to-blue-600 bg-clip-text text-transparent">
          News
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Headlines filtered to the symbols in your watchlist.
        </p>
      </div>
      <span className="text-xs text-gray-600 whitespace-nowrap pt-1">updated {updatedAgo}</span>
    </div>
  );
};

export default NewsHeader;
