"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#071422] p-4 text-white">
      {/* Background Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-orange/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-navy-mid/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#0b1f33]/90 p-8 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange font-display text-2xl font-bold text-white shadow-md">
            NES
          </div>
          <h1 className="mt-4 font-display text-xl font-bold uppercase tracking-wider text-white">
            Nur Engineering CMS
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Administrative Access & Website Management
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1.5 w-full rounded border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orange focus:bg-white/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orange focus:bg-white/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-orange mt-2 w-full py-3 text-sm font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <p className="text-[11px] text-white/50">
            Default credentials are prefilled for initial setup.
          </p>
        </div>
      </div>
    </div>
  );
}
