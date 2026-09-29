"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth state on mount and path change
  useEffect(() => {
    const token = localStorage.getItem("orvan_jwt");
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("orvan_jwt");
    setIsAuthenticated(false);
    router.push("/login");
  };

  // Completely hide the navbar on auth pages for a clean UI
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="h-14 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-bold text-lg tracking-tight text-white">
          orvan
        </Link>
        
        {/* Only show these routes if the user is actually logged in */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--muted)]">
            <Link href="/chat" className={`transition-colors ${pathname === "/chat" ? "text-[var(--foreground)]" : "hover:text-[var(--foreground)]"}`}>
              Analysis
            </Link>
            <Link href="/sessions" className={`transition-colors ${pathname === "/sessions" ? "text-[var(--foreground)]" : "hover:text-[var(--foreground)]"}`}>
              Sessions
            </Link>
            <Link href="/ingest" className={`transition-colors ${pathname === "/ingest" ? "text-[var(--foreground)]" : "hover:text-[var(--foreground)]"}`}>
              Data Sources
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              API Connected
            </div>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-[var(--muted)] hover:text-white hover:bg-[var(--surface)] text-sm h-8 px-3 transition-colors"
            >
              Sign Out
            </Button>
          </>
        ) : (
          /* Show Sign In / Sign Up buttons on the landing page if not authenticated */
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-[var(--muted)] hover:text-white hover:bg-[var(--surface)] text-sm h-8 px-4 transition-colors">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[var(--primary)] hover:bg-[#534be5] text-white text-sm h-8 px-4 rounded-md transition-colors">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}