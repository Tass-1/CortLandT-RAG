"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("orvan_jwt") || localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("orvan_jwt");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/signup") {
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
              <Link href="/sessions" className={`transition-colors ${pathname === "/sessions" ? "text-white" : "text-[#999999] hover:text-[#d1d1d1]"}`}>Logs</Link>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <div className="flex items-center h-[40px] px-4 rounded-md bg-[#1a1a1a] border border-[#2c2c2c] text-white text-[14px] font-medium">
              0.00 <span className="text-[#999999] ml-1.5 text-[12px]">MS</span>
            </div>
            <button 
              onClick={handleSignOut} 
              className="flex items-center gap-2 h-[40px] px-5 rounded-md bg-[#ab9ff2] hover:bg-[#978ae8] text-[#111111] text-[14px] font-bold transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sever Link
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="flex items-center gap-2 h-[40px] px-5 rounded-md bg-[#ab9ff2] hover:bg-[#978ae8] text-[#111111] text-[14px] font-bold transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Connect
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}