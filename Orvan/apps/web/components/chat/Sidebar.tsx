"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface SessionData {
  session_id: string;
  ticker: string;
  created_at: string;
  title: string;
}

export function Sidebar() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSessionId = searchParams.get("session");

  useEffect(() => {
    fetchAPI("/get-sessions")
      .then((data) => {
        if (data.sessions) setSessions(data.sessions);
      })
      .catch((err) => console.error(err));
  }, [activeSessionId]);

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--border)]">
        <Button 
          onClick={() => router.push("/chat")}
          className="w-full bg-[var(--primary)] hover:bg-[#534be5] text-white rounded-md shadow-sm h-10 font-medium transition-colors"
        >
          + New Analysis
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-[var(--muted)] mb-2 uppercase tracking-wider">
          Recent Documents
        </div>
        
        {sessions.length === 0 ? (
          <div className="px-3 py-2 text-xs text-[var(--muted)]">No previous sessions.</div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => router.push(`/chat?session=${session.session_id}`)}
              className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                activeSessionId === session.session_id.toString()
                  ? "bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50"
              }`}
            >
              <div className="font-medium truncate text-[13px]">{session.title}</div>
              <div className="text-[10px] flex gap-2 opacity-70 mt-1">
                <span className="font-mono text-[var(--primary)]">{session.ticker}</span>
                <span>{new Date(session.created_at).toLocaleDateString()}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}