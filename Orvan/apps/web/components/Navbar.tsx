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

      <div className="flex items-center gap-3">
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