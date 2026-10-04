"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TickerCard } from "@/components/ingest/TickerCard";
import { fetchAPI } from "@/lib/api";

export default function IngestPage() {
  const [assets, setAssets] = useState<{ ticker: string; name: string }[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchNodes = async () => {
    try {
      const data = await fetchAPI("/get-tickers");
      if (data.nodes) {
        setAssets(data.nodes);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const newTicker = searchInput.trim().toUpperCase();
    setSearchInput("");

    try {
      await fetchAPI(`/ingest?ticker=${newTicker}`, { method: "POST" });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090b] min-h-screen text-zinc-100">
      <div className="border-b border-[#1f1f23] bg-[#0c0c0e]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Available Data</h1>
            <p className="text-xs text-zinc-400 mt-1">Managed SEC Form 10-K filings and indexed vector entities</p>
          </div>

          <form onSubmit={handleAddTicker} className="flex items-center gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ticker symbol NVDA"
              className="h-9 w-52 bg-[#141417] border-[#27272a] focus-visible:ring-1 focus-visible:ring-zinc-400 text-white  text-xs rounded uppercase placeholder:text-zinc-500 placeholder:normal-case"
            />
            <Button
              type="submit"
              className="h-9 px-4 bg-zinc-100 text-zinc-900 hover:bg-white text-xs font-semibold rounded transition-colors"
            >
              Add Ticker
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Tracked Entities ({assets.length})
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[156px] bg-[#111113] border border-[#222225] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {assets.map((asset) => (
              <TickerCard key={asset.ticker} ticker={asset.ticker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}