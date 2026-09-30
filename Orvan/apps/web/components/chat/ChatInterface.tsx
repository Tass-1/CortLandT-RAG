"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant" | "LLM" | "User"; // Backend uses "LLM" and "User"
  content: string;
  tool_used?: string | null;
}

export function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load chat history when the session ID in the URL changes
  useEffect(() => {
    if (sessionId) {
      fetchAPI(`/session?session_id=${sessionId}`)
        .then((data) => {
          if (data.messages) setMessages(data.messages);
        })
        .catch((err) => console.error("Failed to load chat history:", err));
    } else {
      setMessages([{
        id: "initial",
        role: "assistant",
        content: "Connected to SEC filing archives. State an entity or metric to analyze.",
      }]);
    }
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      // If a session exists, append it to the URL query string for FastAPI
      const endpoint = sessionId ? `/chat?session_id=${sessionId}` : "/chat";
      
      const data = await fetchAPI(endpoint, {
        method: "POST",
        body: JSON.stringify({ prompt: userText, ticker: "MSFT" }), // Keep MSFT hardcoded for now
      });

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.response },
      ]);

      // If this was a brand new chat, the backend generated a new session. Update the URL.
      if (!sessionId && data.session_id) {
        router.replace(`/chat?session=${data.session_id}`);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6 pb-32">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role.toLowerCase() === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role.toLowerCase() !== "user" && (
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  O
                </div>
              )}
              <div className={`flex-1 pt-1 ${msg.role.toLowerCase() === "user" ? "bg-[var(--surface)] border border-[var(--border)] rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[80%] text-[15px] shadow-sm ml-auto" : "max-w-full"}`}>
                <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-[var(--foreground)]">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm">O</div>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <span>Running agentic routing & retrieval...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-20 pointer-events-none">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative pointer-events-auto shadow-2xl">
          <Input value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} className="w-full h-14 pl-6 pr-24 rounded-2xl bg-[var(--surface)] border-[var(--border)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] text-[15px] placeholder:text-[var(--muted)]" placeholder="Ask a question about SEC filings..." />
          <Button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-2 bottom-2 rounded-xl bg-[var(--primary)] hover:bg-[#534be5] text-white px-6 transition-colors disabled:opacity-50">Send</Button>
        </form>
      </div>
    </div>
  );
}