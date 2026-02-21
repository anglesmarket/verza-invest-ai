"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Rocket, Plus, BarChart3, Edit, Eye, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface MyStartup {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  status: string;
  fundingGoal: number;
  fundingRaised: number;
  investorCount: number;
}

export default function MyStartupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [startups, setStartups] = useState<MyStartup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMyStartups();
    }
  }, [status]);

  const fetchMyStartups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/startups?owner=me");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStartups(data.startups || []);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as any;
  const isEntrepreneur = user?.roles?.includes("entrepreneur");

  if (!isEntrepreneur) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 pt-24 p-4">
        <div className="glass-card p-10 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Entrepreneur Access Only
          </h1>
          <p className="text-slate-500 mb-6">
            You need entrepreneur privileges to manage startups. Update your profile to get started.
          </p>
          <Link href="/dashboard" className="btn-primary inline-flex">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const statusColors: Record<string, string> = {
    approved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    draft: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              My Startups
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage your startup listings and track funding.
            </p>
          </div>
          <button className="btn-primary py-2.5 px-5 text-sm w-fit">
            <Plus className="w-4 h-4" />
            Create Startup
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : startups.length > 0 ? (
          <div className="space-y-4">
            {startups.map((startup) => {
              const pct = startup.fundingGoal > 0
                ? Math.min((startup.fundingRaised / startup.fundingGoal) * 100, 100)
                : 0;
              return (
                <div key={startup.id} className="glass-card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {startup.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {startup.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {startup.tagline}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="badge-primary">{startup.industry}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[startup.status] || statusColors.draft}`}>
                            {startup.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/startups/${startup.id}`}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(startup.fundingRaised)} raised
                      </span>
                      <span className="text-xs text-slate-500">
                        {pct.toFixed(0)}% of {formatCurrency(startup.fundingGoal)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {startup.investorCount} investors
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass-card">
            <Rocket className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No Startups Yet
            </h3>
            <p className="text-slate-500 mb-6">
              Create your first startup listing to start attracting investors.
            </p>
            <button className="btn-primary inline-flex">
              <Plus className="w-4 h-4" />
              Create Your First Startup
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
