interface HeaderProps {
  activeTab: "chat" | "chart";
  setActiveTab: (tab: "chat" | "chart") => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md z-10 shrink-0">
      <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]">
        <button 
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "chat" ? "bg-[var(--background)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          Analysis
        </button>
        <button 
          onClick={() => setActiveTab("chart")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "chart" ? "bg-[var(--background)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          Market Chart
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        API Connected
      </div>
    </header>
  );
}