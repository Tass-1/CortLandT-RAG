import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--border)]">
        <Button className="w-full bg-[var(--primary)] hover:bg-[#534be5] text-white rounded-md shadow-sm h-10 font-medium transition-colors">
          + New Analysis
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-[var(--muted)] mb-2">RECENT DOCUMENTS</div>
        
        <button className="w-full text-left px-3 py-2 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]">
          <div className="font-medium">MSFT 10-K</div>
          <div className="text-xs text-[var(--muted)] truncate">Fiscal Year 2023</div>
        </button>
      </div>
    </aside>
  );
}