"use client";

import { useState } from "react";

// Define our result type based on the DB schema
interface MaterialResult {
  id: number;
  ea_number: string;
  name: string;
  description: string;
  time_estimation: string;
  similarity: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specs: Record<string, any>;
}

const TEST_CASES = [
  {
    label: "Typos: 5G6 Flex",
    value: "NOIKX-FLEX 5G6 Restparti kabel 5x6mm flex. Mangler EA nummer.",
  },
  {
    label: "Notation: 5x10mm",
    value: "Cable PVIKJ 5x10mm2 Standard PVC cable found on site.",
  },
  {
    label: "Slang: Heavy Duty",
    value:
      "Heavy Duty 240mm Power Cable Stort sort forsyningskabel, ligner FXQJ typen.",
  },
];

export default function MaterialMatcher() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MaterialResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery) return;
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch("/api/materials/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      // 1. Check if the response is valid
      if (!res.ok) {
        // Read the raw text to see the real error (e.g. 404 HTML or 500 stack trace)
        const errorText = await res.text();
        console.error("API Error:", res.status, errorText);
        alert(`Error ${res.status}: ${errorText.slice(0, 100)}`); // Alert the user
        return;
      }

      // 2. Parse JSON only if successful
      const data = await res.json();
      if (data.results) setResults(data.results);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          👷 Material Matcher (PoV)
        </h2>
        <p className="text-sm text-gray-600">
          Simulate an electrician finding an unknown item. The AI analyzes
          technical specs to find the &quot;Golden Record&quot; in Akkord+.
        </p>
      </div>

      {/* Demo Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TEST_CASES.map((test, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(test.value);
              handleSearch(test.value);
            }}
            className="text-xs bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors"
          >
            ✨ {test.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-8">
        <input
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-gray-800 shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe the unknown material..."
          disabled={loading}
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={loading || !query}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium shadow-sm disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Match"}
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {results.map((m, i) => (
          <div
            key={m.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              i === 0
                ? "bg-green-50 border-green-500 shadow-md"
                : "bg-white border-transparent shadow-sm opacity-75"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                {i === 0 && (
                  <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                    BEST MATCH
                  </span>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{m.name}</h3>
                <p className="text-xs text-gray-500 font-mono">
                  EA: {m.ea_number}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  {m.time_estimation}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    min/m
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Confidence: {(m.similarity * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{m.description}</p>

            {/* Technical Specs Grid */}
            <div className="bg-gray-100 rounded-lg p-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
              {Object.entries(m.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="font-semibold capitalize">
                    {k.replace("_", " ")}:
                  </span>
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
