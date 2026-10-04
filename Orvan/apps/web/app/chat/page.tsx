"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { MarketChart } from "@/components/chat/MarketChart";

function ChatContent() {
  const [activeTab, setActiveTab] = useState<"chat" | "chart">("chat");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Added min-h-[60px] and z-10 to keep the header rigidly pinned */}
      <header className="h-[60px] min-h-[60px] flex items-center px-8 border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0 z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab("chat")}
            className={`pb-1 text-[13px] font-medium transition-all border-b-2 ${
              activeTab === "chat" 
                ? "border-[#f5b342] text-white" 
                : "border-transparent text-[#888888] hover:text-[#d1d1d1]"
            }`}
          >
            Agent Chat
          </button>
          <button 
            onClick={() => setActiveTab("chart")}
            className={`pb-1 text-[13px] font-medium transition-all border-b-2 ${
              activeTab === "chart" 
                ? "border-[#f5b342] text-white" 
                : "border-transparent text-[#888888] hover:text-[#d1d1d1]"
            }`}
          >
            Market Chart
          </button>
        </div>
      </header>

      {/* The flex-1 min-h-0 wrapper is the critical fix for the disappearing header */}
      <div className="flex-1 min-h-0 relative bg-[#000000]">
        {activeTab === "chat" ? (
          <ChatInterface sessionId={sessionId || undefined} />
        ) : (
          <MarketChart />
        )}
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <div className="flex h-full w-full font-sans text-sm selection:bg-[#f5b342] selection:text-black bg-[#000000] overflow-hidden">
      <Suspense fallback={<div className="w-64 border-r border-[#1f1f1f] bg-[#0a0a0a]" />}>
        <Sidebar />
      </Suspense>

      <Suspense fallback={<div className="flex-1 bg-[#000000]" />}>
        <ChatContent />
      </Suspense>
    </div>
  );
}