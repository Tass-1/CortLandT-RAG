"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function TrippyNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("orvan_jwt") || localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleAction = (path: string) => {
    if (path === "/signout") {
      localStorage.removeItem("orvan_jwt");
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setIsOpen(false);
      router.push("/login");
      return;
    }
    setIsOpen(false);
    setTimeout(() => router.push(path), 500);
  };

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const navItems = isAuthenticated
    ? [
        { path: "/", label: "Nexus", icon: "⌂" },
        { path: "/chat", label: "Terminal", icon: "⌘" },
        { path: "/ingest", label: "Nodes", icon: "⎔" },
        { path: "/sessions", label: "Logs", icon: "≡" },
        { path: "/signout", label: "Sever", icon: "✕", isDestructive: true },
      ]
    : [
        { path: "/", label: "Nexus", icon: "⌂" },
        { path: "/login", label: "Auth", icon: "⚿" },
        { path: "/signup", label: "Init", icon: "⎈" },
      ];

  const radius = 240;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes time-stone { 100% { transform: rotate(360deg); } }
          @keyframes time-stone-reverse { 100% { transform: rotate(-360deg); } }
          @keyframes hyper-pulse { 0%, 100% { transform: scale(1); opacity: 0.3; filter: hue-rotate(0deg); } 50% { transform: scale(1.15); opacity: 0.6; filter: hue-rotate(45deg); } }
          
          .geo-1 { animation: time-stone 50s linear infinite; }
          .geo-2 { animation: time-stone-reverse 35s linear infinite; }
          .geo-3 { animation: time-stone 25s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
          .geo-4 { animation: time-stone-reverse 15s linear infinite; }
          
          .orbiter { animation: time-stone 40s linear infinite; }
          .counter-orbiter { animation: time-stone-reverse 40s linear infinite; }
        `
      }} />

      <div className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        
        <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-3xl" />

        <div className={`absolute w-[120vw] h-[120vw] rounded-full geo-1 mix-blend-screen opacity-15 transition-all duration-[1500ms] ${isOpen ? "scale-100" : "scale-[0.1]"}`}
             style={{ background: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 2deg, rgba(245,179,66,0.3) 2deg, rgba(245,179,66,0.3) 4deg)' }} />

        <div className={`absolute w-[800px] h-[800px] geo-2 transition-all duration-[1200ms] ${isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} 
             style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
          <div className="absolute inset-0 border-[2px] border-dotted border-[#ab9ff2]/40 scale-90" />
        </div>

        <div className={`absolute w-[600px] h-[600px] rounded-full geo-3 transition-all duration-[1000ms] mix-blend-screen ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
             style={{ animation: isOpen ? 'hyper-pulse 6s ease-in-out infinite' : 'none', background: 'repeating-radial-gradient(circle, transparent 0px, transparent 20px, rgba(171,159,242,0.15) 20px, rgba(171,159,242,0.15) 22px)' }} />

        <div className={`absolute w-[480px] h-[480px] rounded-full border-[3px] border-double border-[#f5b342]/30 geo-4 transition-all duration-700 ${isOpen ? "scale-100 opacity-100" : "scale-[2] opacity-0"}`} />

        <div className={`absolute w-[480px] h-[480px] orbiter transition-transform duration-1000 ${isOpen ? "scale-100" : "scale-[0.2]"}`}>
          {navItems.map((item, i) => {
            const angle = (i / navItems.length) * (2 * Math.PI) - (Math.PI / 2);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div key={item.path} className="absolute top-1/2 left-1/2 -mt-8 -ml-8" style={{ transform: `translate(${x}px, ${y}px)` }}>
                <button
                  onClick={() => handleAction(item.path)}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group counter-orbiter ${
                    item.isDestructive 
                      ? "bg-[#111111] border border-[#f5b342]/50 text-[#f5b342] hover:border-[#f5b342] hover:bg-[#f5b342] hover:text-[#111111] hover:shadow-[0_0_40px_rgba(245,179,66,0.6)]" 
                      : "bg-[#111111] border border-[#ab9ff2]/50 text-white hover:border-[#ab9ff2] hover:bg-[#ab9ff2] hover:text-[#111111] hover:shadow-[0_0_40px_rgba(171,159,242,0.8)]"
                  }`}
                >
                  <span className="font-mono text-2xl relative z-10 scale-90 group-hover:scale-110 transition-transform">{item.icon}</span>
                  
                  <span className={`absolute -bottom-10 font-mono text-[10px] uppercase tracking-[0.25em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 ${
                    item.isDestructive ? "text-[#f5b342] drop-shadow-[0_0_8px_rgba(245,179,66,1)]" : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]"
                  }`}>
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 bg-[#111111] flex items-center justify-center transition-all duration-700 ${
            isOpen ? "rotate-[135deg] shadow-[0_0_40px_rgba(171,159,242,0.4)] scale-90 border border-[#ab9ff2]" : "border border-[#2c2c2c] hover:border-[#f5b342] hover:scale-110 shadow-lg"
          }`}
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-[2px] transition-all duration-700 ease-in-out ${isOpen ? "h-7 bg-[#ab9ff2]" : "h-5 bg-[#f5b342]"}`} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`h-[2px] transition-all duration-700 ease-in-out ${isOpen ? "w-7 bg-[#ab9ff2]" : "w-5 bg-[#f5b342]"}`} />
          </div>
          
          {!isOpen && (
            <div className="absolute inset-0 border border-[#f5b342]/30 scale-150 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" 
                 style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          )}
        </button>
      </div>
    </>
  );
}