"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "chart">("chat");

  return (
    <div className="flex h-full w-full font-sans text-sm selection:bg-[var(--primary)] selection:text-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Workspace Sub-Header (Tab Toggle) */}
        <header className="h-12 flex items-center px-8 border-b border-[var(--border)] bg-[var(--background)] shrink-0">
          <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]">
            <button 
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === "chat" ? "bg-[var(--background)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              Agent Chat
            </button>
            <button 
              onClick={() => setActiveTab("chart")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === "chart" ? "bg-[var(--background)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              Market Chart
            </button>
          </div>
        </header>

        {activeTab === "chat" ? (
          <ChatInterface />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-5xl border border-[var(--border)] bg-[var(--surface)] rounded-2xl flex flex-col items-center justify-center text-[var(--muted)] space-y-4 shadow-sm">
              <p>TradingView Widget will mount here.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}