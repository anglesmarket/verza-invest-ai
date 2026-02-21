"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { Mail, Lock, User, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function Register() {
  const { portfolio } = useData();
  const data = portfolio.auth;
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        // Auto sign-in after successful registration
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/",
        });
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-padding pt-32">
      <div className="glass-card p-8 md:p-12 w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold gradient-text mb-2">{data.register}</h1>
          <p className="text-slate-500 dark:text-slate-400">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {data.name}
            </label>
            <div className="relative">
              <User className="absolute start-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-12 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {data.email}
            </label>
            <div className="relative">
              <Mail className="absolute start-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-12 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {data.password}
            </label>
            <div className="relative">
              <Lock className="absolute start-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-12 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="••••••••  (min 6 characters)"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-50"
          >
            {loading ? <UserPlus className="w-5 h-5 animate-pulse" /> : <UserPlus className="w-5 h-5" />}
            {data.register}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-600 dark:text-cyan-400 hover:underline font-medium">
            {data.signIn}
            <ArrowRight className={`inline w-4 h-4 ms-1`} />
          </Link>
        </p>
      </div>
    </div>
  );
}
