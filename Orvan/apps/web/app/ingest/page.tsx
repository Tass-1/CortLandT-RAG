"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TickerCard } from "@/components/ingest/TickerCard";

const INITIAL_ASSETS = [
  { ticker: "MSFT", name: "Microsoft Corporation", basePrice: 420.55 },
  { ticker: "AAPL", name: "Apple Inc.", basePrice: 173.50 },
  { ticker: "NVDA", name: "NVIDIA Corporation", basePrice: 880.20 },
  { ticker: "TSLA", name: "Tesla, Inc.", basePrice: 175.34 },
  { ticker: "AMZN", name: "Amazon.com, Inc.", basePrice: 185.20 },
  { ticker: "META", name: "Meta Platforms, Inc.", basePrice: 502.30 },
  { ticker: "JPM", name: "JPMorgan Chase & Co.", basePrice: 198.40 },
  { ticker: "GOOGL", name: "Alphabet Inc.", basePrice: 165.80 },
  { ticker: "PLTR", name: "Palantir Technologies", basePrice: 23.50 },
];

export default function IngestPage() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [searchInput, setSearchInput] = useState("");

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    const newTicker = searchInput.trim().toUpperCase();
    
    if (assets.some(a => a.ticker === newTicker)) {
      setSearchInput("");
      return;
    }

    setAssets((prev) => [
      { ticker: newTicker, name: "Custom Added Entity", basePrice: Math.floor(Math.random() * 300) + 50 },
      ...prev
    ]);
    setSearchInput("");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] p-8 md:p-12">
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border)] pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Market Intelligence Hub</h1>
            <p className="text-[var(--muted)] text-base max-w-xl">
              Monitor live entities and trigger autonomous SEC Form 10-K ingestion into the Qdrant vector space.
            </p>
          </div>

          <form onSubmit={handleAddTicker} className="flex gap-3 w-full md:w-96 shadow-sm">
            <Input 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter ticker (e.g. COIN)..."
              className="h-11 bg-[var(--surface)] border-[var(--border)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] text-[15px]"
            />
            <Button type="submit" className="h-11 px-6 bg-[var(--primary)] text-white hover:bg-[#534be5] font-medium transition-colors">
              Add Node
            </Button>
          </form>
        </div>

        {/* Larger, spacious grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <TickerCard key={asset.ticker} asset={asset} />
          ))}
        </div>

      </div>
    </div>
  );
}