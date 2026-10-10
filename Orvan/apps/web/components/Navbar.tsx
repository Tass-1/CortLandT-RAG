"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { useTickerStore } from "@/store/tickerStore";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availableTickers, setAvailableTickers] = useState<{ ticker: string; name: string }[]>([]);
  
 
  const { activeTicker, setActiveTicker } = useTickerStore();

  useEffect(() => {
    const token = localStorage.getItem("orvan_jwt") || localStorage.getItem("token");
    const isAuth = !!token;
    setIsAuthenticated(isAuth);

    
    if (isAuth) {
      const fetchTickers = async () => {
        try {
          const data = await fetchAPI("/get-tickers");
          if (data.nodes && data.nodes.length > 0) {
            setAvailableTickers(data.nodes);
           
            if (!data.nodes.find((n: any) => n.ticker === activeTicker)) {
              setActiveTicker(data.nodes[0].ticker);
            }
          }
        } catch (error) {
          console.error("Failed to fetch tickers for navbar:", error);
        }
      };
      fetchTickers();
    }
  }, [pathname, activeTicker, setActiveTicker]);

  const handleSignOut = () => {
    localStorage.removeItem("orvan_jwt");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/auth");
  };

  if (pathname === "/auth" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <header className="h-[60px] shrink-0 w-full border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6 z-30">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center text-[17px] tracking-wide">
          <span className="text-[#f5b342] font-black">ORVAN</span>
          <span className="text-white font-black">CORE</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium">
          <Link href="/" className={`transition-colors ${pathname === "/" ? "text-white" : "text-[#999999] hover:text-[#d1d1d1]"}`}>Home</Link>
          {isAuthenticated && (
            <>
              <Link href="/chat" className={`transition-colors ${pathname === "/chat" ? "text-white" : "text-[#999999] hover:text-[#d1d1d1]"}`}>Terminal</Link>
              <Link href="/ingest" className={`transition-colors ${pathname === "/ingest" ? "text-white" : "text-[#999999] hover:text-[#d1d1d1]"}`}>Nodes</Link>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
      
        {isAuthenticated && availableTickers.length > 0 && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-[12px] font-medium text-[#888888] uppercase tracking-wider">Active Asset</span>
            <select 
              value={activeTicker}
              onChange={(e) => setActiveTicker(e.target.value)}
              className="h-[32px] bg-[#1a1a1a] border border-[#2c2c2c] text-white text-[13px] font-bold px-3 rounded outline-none focus:border-[#f5b342] cursor-pointer"
            >
              {availableTickers.map((asset) => (
                <option key={asset.ticker} value={asset.ticker}>
                  {asset.ticker}
                </option>
              ))}
            </select>
          </div>
        )}

        {isAuthenticated ? (
          <button 
            onClick={handleSignOut} 
            className="flex items-center gap-2 h-[40px] px-5 rounded-md bg-[#1a1a1a] border border-[#2c2c2c] hover:bg-[#2c2c2c] text-white text-[14px] font-medium transition-colors"
          >
            Sign Out
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/auth" className="flex items-center gap-2 h-[40px] px-5 rounded-md bg-[#ab9ff2] hover:bg-[#978ae8] text-[#111111] text-[14px] font-bold transition-colors">
              Sign In / Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}