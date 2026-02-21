"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  Rocket,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  returnsPercent: number;
  activeInvestments: number;
}

interface InvestmentItem {
  id: string;
  startupId: string;
  name: string;
  industry: string;
  invested: number;
  currentValue: number;
  change: number;
  status: string;
}

interface ActivityItem {
  text: string;
  time: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioStats>({
    totalInvested: 0,
    currentValue: 0,
    totalReturns: 0,
    returnsPercent: 0,
    activeInvestments: 0,
  });
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/investments");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setPortfolio(data.portfolio || {
        totalInvested: 0,
        currentValue: 0,
        totalReturns: 0,
        returnsPercent: 0,
        activeInvestments: 0,
      });
      setInvestments(data.investments || []);
      setActivity(data.recentActivity || []);
    } catch {
      // keep defaults
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
  const isAdmin = user?.roles?.includes("admin");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Welcome back, {user?.name?.split(" ")[0] || "Investor"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Here&apos;s an overview of your investment portfolio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
            <Link
              href="/startups"
              className="btn-primary py-2.5 px-5 text-sm"
            >
              <Rocket className="w-4 h-4" />
              Browse Startups
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Invested</span>
                  <Wallet className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(portfolio.totalInvested)}
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Value</span>
                  <PieChart className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(portfolio.currentValue)}
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Returns</span>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {portfolio.totalReturns >= 0 ? "+" : ""}{formatCurrency(portfolio.totalReturns)}
                </p>
                {portfolio.returnsPercent !== 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {portfolio.returnsPercent >= 0 ? "+" : ""}{portfolio.returnsPercent}% all time
                  </p>
                )}
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Investments</span>
                  <Rocket className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {portfolio.activeInvestments}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Investments Table */}
              <div className="lg:col-span-2 glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Investments</h2>
                </div>
                {investments.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {investments.map((inv) => (
                      <Link
                        key={inv.id}
                        href={`/startups/${inv.startupId || inv.id}`}
                        className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors block"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            {inv.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{inv.name}</p>
                            <p className="text-xs text-slate-500">{inv.industry}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(inv.invested)}
                          </p>
                          <p className="text-xs text-slate-500">invested</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium mb-2">No investments yet</p>
                    <Link href="/startups" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                      Browse startups to make your first investment
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                </div>
                {activity.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activity.map((item, i) => (
                      <div key={i} className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{item.text}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
