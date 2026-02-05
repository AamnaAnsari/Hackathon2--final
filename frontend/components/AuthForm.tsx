"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";

type Tab = "signin" | "signup";

export function AuthForm() {
  const [tab, setTab] = useState<Tab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "signup") {
        const result = await signUp.email({
          name: name.trim() || "",
          email: email.trim(),
          password,
        });
        if (result.error) {
          setError(result.error.message ?? "Sign up failed");
          return;
        }
      } else {
        const result = await signIn.email({
          email: email.trim(),
          password,
        });
        if (result.error) {
          setError(result.error.message ?? "Sign in failed");
          return;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
      <div className="mb-6 flex border-b border-zinc-800">
        <button
          type="button"
          onClick={() => {
            setTab("signin");
            setError(null);
          }}
          className={
            "flex-1 pb-3 text-sm font-medium transition-colors " +
            (tab === "signin"
              ? "border-b-2 border-red-600 text-red-500"
              : "text-zinc-500 hover:text-zinc-300")
          }
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("signup");
            setError(null);
          }}
          className={
            "flex-1 pb-3 text-sm font-medium transition-colors " +
            (tab === "signup"
              ? "border-b-2 border-red-600 text-red-500"
              : "text-zinc-500 hover:text-zinc-300")
          }
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {tab === "signup" && (
          <div>
            <label
              htmlFor="auth-name"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Name
            </label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              autoComplete="name"
            />
          </div>
        )}
        <div>
          <label
            htmlFor="auth-email"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
            autoComplete="email"
          />
        </div>
        <div>
          <label
            htmlFor="auth-password"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
            autoComplete={tab === "signup" ? "new-password" : "current-password"}
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {tab === "signin" ? "Signing in..." : "Signing up..."}
            </>
          ) : tab === "signin" ? (
            "Sign In"
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
    </div>
  );
}
