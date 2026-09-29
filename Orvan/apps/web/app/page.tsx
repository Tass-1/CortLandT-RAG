import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[var(--background)]">
      
      {/* Subtle background glow radiating from the top */}
      <div 
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, var(--primary), transparent 70%)' }} 
      />

      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-mono font-medium text-[var(--muted)] mb-4">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
          ORVAN CORE ENGINE ACTIVE
        </div>
        
        {/* Hero Typography */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
          Institutional precision. <br className="hidden md:block" />
          <span className="text-[var(--muted)]">Agentic speed.</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl leading-relaxed">
          Query SEC filings, extract exact financial metrics, and analyze enterprise data in real-time with an autonomous RAG pipeline.
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
          <Link href="/signup">
            <Button className="h-12 px-8 rounded-lg bg-[var(--primary)] hover:bg-[#534be5] text-white font-medium text-[15px] transition-colors shadow-lg shadow-[var(--primary)]/20">
              Deploy Workspace
            </Button>
          </Link>
          <Link href="/login">
            <Button className="h-12 px-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-white hover:bg-[var(--border)] font-medium text-[15px] transition-colors">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Tech Stack Indicator (Optional, but adds to the developer tool aesthetic) */}
        <div className="pt-20 flex items-center gap-8 text-[11px] font-mono text-[var(--border)] uppercase tracking-widest">
          <span>FastAPI</span>
          <span>•</span>
          <span>MongoDB</span>
          <span>•</span>
          <span>Qdrant</span>
          <span>•</span>
          <span>Groq</span>
        </div>

      </main>
    </div>
  );
}