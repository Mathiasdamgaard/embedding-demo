"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface ProductSearchResult {
  id: number;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  similarity: number;
}

export default function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastSearchedQuery = useRef("");

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.statusText || response.status}`
        );
      }

      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        setResults([]);
        if (data.error) setError(data.error);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Fetch error:", err);
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
      lastSearchedQuery.current = searchQuery;
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      if (query !== lastSearchedQuery.current) {
        performSearch(query);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Fast Semantic Search (Live)
      </h2>

      <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
            <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing (e.g., 'red shoes')..."
            />
            {loading && (
                <div className="absolute right-3 top-3">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
        >
          Search
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-4 pt-2">
        {error && <p className="text-red-500 font-medium">Error: {error}</p>}

        {!loading &&
          results.length === 0 &&
          !error &&
          query.trim().length > 2 &&
          query === lastSearchedQuery.current && (
            <p className="text-gray-500 text-center">
              No products found matching &quot;{query}&quot;.
            </p>
          )}

        {results.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow-md flex space-x-4 items-start"
          >
            <div className="shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={64}
                height={64}
                className="object-cover rounded-md"
                unoptimized
              />
            </div>

            <div className="grow">
              <h3 className="font-bold text-lg text-gray-800">
                {product.name}
              </h3>
              <p className="text-purple-600 font-semibold mb-1">
                ${product.price}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
              <span className="text-xs text-gray-400 mt-1">
                Similarity: {product.similarity.toFixed(4)}
              </span>
            </div>
          </div>
        ))}

        {!query.trim() && !loading && (
          <p className="text-gray-400 text-center mt-20">
            Start typing to see AI results instantly.
          </p>
        )}
      </div>
    </div>
  );
}