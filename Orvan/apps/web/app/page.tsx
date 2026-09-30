"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (localStorage.getItem("token") || localStorage.getItem("access_token")) {
      setIsLoggedIn(true);
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[var(--background)] selection:bg-white selection:text-black">
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.03), transparent 40%)`,
        }}
      />

      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--muted)]"></div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-[var(--muted)] uppercase">
            Orvan Intelligence Core
          </span>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--muted)]"></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
          Financial data.
          <br />
          <span className="text-[var(--muted)]">Without the noise.</span>
        </h1>

        <p className="text-sm md:text-base text-[var(--muted)] max-w-2xl font-mono leading-relaxed mb-12">
          Autonomous ingestion of SEC Form 10-K filings. Real-time vector retrieval. Exact institutional metrics extracted instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {isLoggedIn ? (
            <Link href="/chat">
              <Button className="h-12 px-10 bg-[var(--primary)] text-[var(--background)] hover:bg-[#e2e4e6] font-bold text-sm tracking-widest uppercase transition-all rounded-none shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                Access Terminal
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button className="h-12 px-10 bg-[var(--primary)] text-[var(--background)] hover:bg-[#e2e4e6] font-bold text-sm tracking-widest uppercase transition-all rounded-none shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                  Initialize Workspace
                </Button>
              </Link>
              <Link href="/login">
                <Button className="h-12 px-10 bg-transparent border border-[var(--border)] text-white hover:bg-[var(--surface)] font-bold text-sm tracking-widest uppercase transition-all rounded-none">
                  Authenticate
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}