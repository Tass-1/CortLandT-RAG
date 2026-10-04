"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const endpoint = isLogin ? "/signin" : "/signup";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const data = await fetchAPI(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      if (data.JWT) {
        localStorage.setItem("orvan_jwt", data.JWT);
        router.push("/chat");
      } else {
        throw new Error("Invalid authentication response.");
      }
    } catch (err: any) {
      setError(err.message || "Authorization failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center relative bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-[400px] bg-[#0a0a0a] border border-[#222222] p-8 shadow-2xl relative">
        <div className="flex border-b border-[#222222] mb-8">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 pb-4 text-[13px] font-medium transition-all border-b-2 ${
              isLogin 
                ? "border-[#f5b342] text-white" 
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 pb-4 text-[13px] font-medium transition-all border-b-2 ${
              !isLogin 
                ? "border-[#f5b342] text-white" 
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? "Welcome back" : "Get started"}
          </h1>
          <p className="text-[13px] text-[#888888] mt-1">
            {isLogin ? "Enter your credentials to continue." : "Create an account to access the platform."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#888888]">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-11 bg-[#111111] border-[#222222] focus-visible:ring-1 focus-visible:ring-[#f5b342] text-white text-[14px] rounded-md placeholder:text-[#444444]"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[#888888]">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 bg-[#111111] border-[#222222] focus-visible:ring-1 focus-visible:ring-[#f5b342] text-white text-[14px] rounded-md placeholder:text-[#444444]"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[#888888]">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 bg-[#111111] border-[#222222] focus-visible:ring-1 focus-visible:ring-[#f5b342] text-white text-[14px] rounded-md placeholder:text-[#444444]"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-[13px] rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-11 rounded-md text-[13px] font-medium transition-all mt-2 bg-[#f5b342] hover:bg-[#e0a238] text-black"
          >
            {isLoading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
}