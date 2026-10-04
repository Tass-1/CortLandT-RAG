"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, YAxis } from "recharts";

export function TickerCard({ ticker }: { ticker: string }) {
  const [chartData, setChartData] = useState<{ value: number }[]>([]);
  const [priceData, setPriceData] = useState({ price: 0, change: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/stock?ticker=${ticker}`);
        const data = await res.json();
        
        if (data.chartData && data.chartData.length > 0) {
          const cleanData = data.chartData.filter(
            (d: { value: number | null }) => typeof d.value === "number" && !isNaN(d.value)
          );
          setChartData(cleanData);
          setPriceData({ price: data.price ?? 0, change: data.change ?? 0 });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [ticker]);

  const isPositive = priceData.change >= 0;
  // Softened colors: Tailwind emerald-500 and red-500
  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  
  const basePrice = priceData.price - priceData.change;
  const percentChange = basePrice > 0 ? (priceData.change / basePrice) * 100 : 0;
  const gradientId = `chart-gradient-${ticker}`;

  return (
    <div className="group relative h-[160px] w-full overflow-hidden rounded-xl bg-[#09090b] border border-zinc-800/60 transition-all duration-300 hover:border-zinc-700 hover:bg-[#0c0c0e]">
      
      <div className="relative z-10 flex h-full flex-col p-5 pointer-events-none">
        <h3 className="text-sm font-medium tracking-wide text-zinc-400">
          {ticker}
        </h3>
        
        <div className="mt-1">
          {!isLoading ? (
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-medium tracking-tight text-zinc-100">
                ${priceData.price.toFixed(2)}
              </span>
              <span className={`text-xs font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
              </span>
            </div>
          ) : (
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-800/50" />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[80px] w-full opacity-70 transition-opacity duration-300 group-hover:opacity-100">
        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <YAxis
                domain={[
                  (dataMin: number) => dataMin - Math.max(Math.abs(priceData.change) * 1.2, dataMin * 0.002),
                  (dataMax: number) => dataMax + Math.max(Math.abs(priceData.change) * 1.2, dataMax * 0.002),
                ]}
                hide
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}