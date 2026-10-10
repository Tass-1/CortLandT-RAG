"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchAPI } from "@/lib/api"; 
import { useTickerStore } from "@/store/tickerStore"; 

interface Message {
  id: string | number;
  role: string; 
  content: string;
}

export function ChatInterface({ sessionId }: { sessionId?: string }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const activeTicker = useTickerStore((state) => state.activeTicker);

  useEffect(() => {
    if (!sessionId) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Connected to SEC filing archives. Select a session or state an entity to analyze."
        }
      ]);
      return;
    }

    const loadSession = async () => {
      try {
        const data = await fetchAPI(`/session?session_id=${sessionId}`);
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadSession();
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: "User", content: userText };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const endpoint = sessionId ? `/chat?session_id=${sessionId}` : "/chat";
      
      const data = await fetchAPI(endpoint, {
        method: "POST",
        body: JSON.stringify({ 
          prompt: userText, 
          ticker: activeTicker 
        }),
      });
      
      const assistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: data.response || data.message || data.text || "No response text found." 
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error: any) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: `Error: ${error.message || "Failed to fetch response."}` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000000]">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-thin scrollbar-thumb-[#222222] scrollbar-track-transparent">
        {messages.map((message) => {
          const isUser = message.role.toLowerCase() === "user";

          return (
            <div key={message.id} className="flex flex-col w-full max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-1.5">
                {isUser ? (
                  <>
                    <div className="w-5 h-5 rounded-sm bg-[#222222] flex items-center justify-center text-[10px] font-bold text-white">U</div>
                    <span className="text-[12px] font-medium text-[#888888]">You</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-sm bg-[#f5b342] flex items-center justify-center text-[10px] font-bold text-black">O</div>
                    <span className="text-[12px] font-medium text-white">Orvan</span>
                  </>
                )}
              </div>

              <div className="pl-7 text-[14px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({node, ...props}) => (
                      <div className="w-full overflow-x-auto my-4 border border-[#222222] rounded-md bg-[#0a0a0a]">
                        <table className="w-full text-left border-collapse" {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => (
                      <th className="border-b border-[#222222] bg-[#111111] p-3 text-white font-medium whitespace-nowrap" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="border-b border-[#1f1f1f] p-3 text-[#cccccc] align-top last:border-0" {...props} />
                    ),
                    p: ({node, ...props}) => (
                      <p className="mb-3 last:mb-0 leading-relaxed text-[#e0e0e0]" {...props} />
                    ),
                    strong: ({node, ...props}) => (
                      <strong className="font-semibold text-white" {...props} />
                    ),
                    code: ({node, inline, ...props}: any) => 
                      inline ? (
                        <code className="bg-[#1a1a1a] border border-[#333333] px-1.5 py-0.5 rounded text-[#f5b342] font-mono text-[12px]" {...props} />
                      ) : (
                        <div className="my-4 border border-[#222222] rounded-md overflow-hidden bg-[#0a0a0a]">
                          <pre className="p-4 overflow-x-auto">
                            <code className="text-[#cccccc] font-mono text-[13px]" {...props} />
                          </pre>
                        </div>
                      )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex flex-col w-full max-w-4xl mx-auto">
             <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-sm bg-[#f5b342] flex items-center justify-center text-[10px] font-bold text-black">O</div>
                <span className="text-[12px] font-medium text-white">Orvan</span>
             </div>
             <div className="pl-7 text-[14px] text-[#888888] animate-pulse">
                Analyzing...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full bg-[#0a0a0a] border-t border-[#1f1f1f] p-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-end bg-[#111111] border border-[#222222] focus-within:border-[#444444] rounded-xl transition-colors overflow-hidden">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about SEC filings..."
              className="w-full bg-transparent text-white text-[14px] px-4 py-4 outline-none placeholder:text-[#666666]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white text-black hover:bg-[#e0e0e0] disabled:opacity-50 disabled:hover:bg-white text-[13px] font-medium rounded-lg transition-all"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}