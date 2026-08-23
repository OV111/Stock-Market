"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type SymbolSearchResult = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // the query the current `results` actually belong to — so the empty state
  // says "No results for X" using the searched term, not what's being typed
  const [searchedQuery, setSearchedQuery] = useState("");

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSearchedQuery("");
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    // debounce: each keystroke re-runs the effect, and the cleanup cancels the
    // pending timer, so only a 300ms pause actually fires a request.
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setResults(data);
          else setError(true);
          setSearchedQuery(trimmed);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Search</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Find a stock by symbol or company name
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbols (e.g. AAPL, Tesla)"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-500"
        />
      </div>

      {!query.trim() ? (
        <p className="text-gray-500 text-sm">
          Start typing to search for a stock.
        </p>
      ) : loading ? (
        <p className="text-gray-500 text-sm">Searching...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">Search failed. Try again.</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No results for &quot;{searchedQuery}&quot;
        </p>
      ) : (
        <ul className="space-y-2">
          {results.map((result) => (
            <li key={`${result.symbol}-${result.displaySymbol}`}>
              <Link
                href={`/stock/${result.symbol}`}
                className="flex items-center justify-between gap-4 bg-gray-800 border border-gray-600 rounded-xl px-5 py-4 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-gray-700 text-yellow-400 shrink-0">
                    {result.displaySymbol || result.symbol}
                  </span>
                  <span className="text-sm text-gray-100 truncate">
                    {result.description}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono shrink-0">
                  {result.type}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchPage;
