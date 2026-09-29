"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await fetchAPI("/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      if (data.JWT) {
        localStorage.setItem("orvan_jwt", data.JWT);
        router.push("/chat");
      } else {
        throw new Error("Invalid authentication response.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-[400px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Sign in to Orvan</h1>
          <p className="text-sm text-[var(--muted)]">
            Enter your credentials to access the workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--muted)]">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 bg-[var(--background)] border-[var(--border)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] text-[15px] rounded-lg"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--muted)]">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 bg-[var(--background)] border-[var(--border)] focus-visible:ring-1 focus-visible:ring-[var(--primary)] text-[15px] rounded-lg"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-11 bg-[var(--primary)] hover:bg-[#534be5] text-white font-medium rounded-lg transition-colors mt-2"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--muted)]">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[var(--primary)] hover:text-white transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}