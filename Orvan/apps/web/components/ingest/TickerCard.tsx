"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

interface Asset {
  ticker: string;
  name: string;
}

export function TickerCard({ asset }: { asset: Asset }) {
  const [marketData, setMarketData] = useState<{ price: number; change: number; chartData: any[] } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "info" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch(`/api/stock?ticker=${asset.ticker}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setMarketData(data);
      })
      .catch((err) => console.error(err));
  }, [asset.ticker]);

  const handleIngest = async () => {
    setIsSyncing(true);
    setStatus(null);
    try {
      const data = await fetchAPI(`/ingest?ticker=${asset.ticker}`, { method: "POST" });
      if (data.status === "exists") setStatus({ type: "success", msg: "Already synced" });
      else setStatus({ type: "info", msg: "Task dispatched" });
    } catch (err: any) {
      setStatus({ type: "error", msg: "Failed" });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const isPositive = marketData ? marketData.change >= 0 : true;
  const strokeColor = isPositive ? "#34d399" : "#f87171";
  const fillColor = isPositive ? "url(#colorEmerald)" : "url(#colorRed)";

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col h-52 shadow-md hover:border-[var(--primary)]/50 transition-colors group relative overflow-hidden">
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center font-bold text-white shadow-inner">
            {asset.ticker.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-tight leading-tight">{asset.ticker}</h3>
            <p className="text-[11px] text-[var(--muted)] truncate w-24 xl:w-32">{asset.name}</p>
          </div>
        </div>
        <div className="text-right">
          {marketData ? (
            <>
              <div className="font-mono text-base text-white font-medium leading-tight">${marketData.price.toFixed(2)}</div>
              <div className={`text-[11px] font-mono mt-0.5 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {isPositive ? "+" : ""}{(marketData.change).toFixed(2)}
              </div>
            </>
          ) : (
            <div className="text-xs text-[var(--muted)] animate-pulse pt-1">Loading data...</div>
          )}
        </div>
      </div>

      {marketData && (
        <div className="absolute inset-x-0 bottom-14 top-16 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={marketData.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Area type="monotone" dataKey="value" stroke={strokeColor} fillOpacity={1} fill={fillColor} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto border-t border-[var(--border)] pt-3 relative z-10 bg-[var(--surface)]">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium tracking-wider text-[var(--muted)] uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status?.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status?.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
          </span>
          {status ? status.msg : "Live Node"}
        </div>
        
        <Button
          onClick={handleIngest}
          disabled={isSyncing}
          className="h-8 px-4 bg-[var(--background)] border border-[var(--border)] text-white hover:bg-[var(--primary)] hover:border-[var(--primary)] text-xs font-medium transition-all"
        >
          {isSyncing ? "Syncing" : "Ingest"}
        </Button>
      </div>
    </div>
  );
}