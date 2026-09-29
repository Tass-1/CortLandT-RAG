"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";

// Hardcoded options since we don't want custom inputs
const SUPPORTED_ASSETS = [
  { ticker: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { ticker: "NVDA", name: "NVIDIA Corporation", sector: "Semiconductors" },
  { ticker: "TSLA", name: "Tesla, Inc.", sector: "Automotive" },
  { ticker: "AMZN", name: "Amazon.com, Inc.", sector: "Consumer Cyclical" },
  { ticker: "META", name: "Meta Platforms, Inc.", sector: "Communication Services" },
  { ticker: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services" },
];

export default function IngestPage() {
  const [loadingTickers, setLoadingTickers] = useState<Record<string, boolean>>({});
  const [statusMessages, setStatusMessages] = useState<Record<string, string>>({});

  const handleIngest = async (ticker: string) => {
    setLoadingTickers((prev) => ({ ...prev, [ticker]: true }));
    setStatusMessages((prev) => ({ ...prev, [ticker]: "Initiating..." }));

    try {
      // Because FastAPI defined `ticker: str` without a Pydantic model, 
      // it expects a query parameter: /ingest?ticker=MSFT
      const data = await fetchAPI(`/ingest?ticker=${ticker}`, {
        method: "POST",
      });

      // Assuming your Celery task handles the actual download/embedding in the background
      setStatusMessages((prev) => ({ 
        ...prev, 
        [ticker]: "Task dispatched to worker" 
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessages((prev) => {
          const newState = { ...prev };
          delete newState[ticker];
          return newState;
        });
      }, 3000);

    } catch (err: any) {
      setStatusMessages((prev) => ({ 
        ...prev, 
        [ticker]: `Error: ${err.message}` 
      }));
    } finally {
      setLoadingTickers((prev) => ({ ...prev, [ticker]: false }));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Data Sources</h1>
          <p className="text-[var(--muted)] text-sm">
            Select entities to fetch and embed their latest SEC Form 10-K filings into the Qdrant vector database.
          </p>
        </div>

        {/* Assets Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--muted)] font-medium">
              <tr>
                <th className="py-3 px-6 w-1/3">Entity</th>
                <th className="py-3 px-6 w-1/4">Ticker</th>
                <th className="py-3 px-6 w-1/4">Sector</th>
                <th className="py-3 px-6 w-1/6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {SUPPORTED_ASSETS.map((asset) => (
                <tr key={asset.ticker} className="hover:bg-[var(--background)]/40 transition-colors">
                  <td className="py-4 px-6 font-medium text-white">{asset.name}</td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--muted)]">
                      {asset.ticker}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[var(--muted)]">{asset.sector}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        onClick={() => handleIngest(asset.ticker)}
                        disabled={loadingTickers[asset.ticker]}
                        className="h-8 px-4 bg-[var(--background)] border border-[var(--border)] text-white hover:bg-[var(--primary)] hover:border-[var(--primary)] text-xs font-medium transition-all w-24"
                      >
                        {loadingTickers[asset.ticker] ? (
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Syncing
                          </span>
                        ) : (
                          "Sync Data"
                        )}
                      </Button>
                      
                      {statusMessages[asset.ticker] && (
                        <span className={`text-[10px] font-mono ${statusMessages[asset.ticker].includes("Error") ? "text-red-400" : "text-emerald-400"}`}>
                          {statusMessages[asset.ticker]}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}