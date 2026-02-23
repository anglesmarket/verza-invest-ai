"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Wallet,
  Loader2,
  Target,
  Lightbulb,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { StartupDetail, formatCurrency } from "@/components/startup/types";
import StartupHeader from "@/components/startup/StartupHeader";
import StartupSidebar from "@/components/startup/StartupSidebar";
import InvestmentModal from "@/components/startup/InvestmentModal";

export default function StartupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [investModalOpen, setInvestModalOpen] = useState(false);

  const fetchStartup = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/startups/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStartup(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchStartup(params.id as string);
    }
  }, [params.id, fetchStartup]);

  const openInvestModal = () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    if (startup && (session.user as any)?.id === startup.owner?._id) {
      return;
    }
    setInvestModalOpen(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 pt-24">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </main>
    );
  }

  if (notFound || !startup) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 pt-24">
        <div className="text-center glass-card p-12 max-w-md">
          <TrendingUp className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Startup Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            This startup doesn&apos;t exist or has been removed.
          </p>
          <Link href="/startups" className="btn-primary inline-flex">
            Browse Startups
          </Link>
        </div>
      </main>
    );
  }

  const fundingPercentage = Math.min(
    (startup.fundingRaised / startup.fundingGoal) * 100,
    100
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <StartupHeader startup={startup} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {startup.description && (
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" />
                  The Problem
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {startup.description}
                </p>
              </div>
            )}

            {startup.solution && (
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Our Solution
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {startup.solution}
                </p>
              </div>
            )}

            {startup.businessModel && (
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  Business Model
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {startup.businessModel}
                </p>
              </div>
            )}

            {startup.founders && startup.founders.length > 0 && (
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Team
                </h2>
                <div className="space-y-4">
                  {startup.founders.map((founder, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {founder.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {founder.name}
                        </p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          {founder.role}
                        </p>
                        {founder.bio && (
                          <p className="text-sm text-slate-500 mt-1">
                            {founder.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="glass-card p-5 text-center">
                <Wallet className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(startup.fundingRaised)}
                </p>
                <p className="text-xs text-slate-500">Raised</p>
              </div>
              <div className="glass-card p-5 text-center">
                <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(startup.fundingGoal)}
                </p>
                <p className="text-xs text-slate-500">Goal</p>
              </div>
              <div className="glass-card p-5 text-center">
                <Users className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {startup.investorCount}
                </p>
                <p className="text-xs text-slate-500">Investors</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <StartupSidebar
            startup={startup}
            fundingPercentage={fundingPercentage}
            onInvestClick={openInvestModal}
          />
        </div>
      </div>

      {/* Investment Modal */}
      {investModalOpen && startup && (
        <InvestmentModal
          startup={startup}
          fundingPercentage={fundingPercentage}
          onClose={() => setInvestModalOpen(false)}
          onSuccess={() => fetchStartup(startup.id)}
        />
      )}
    </main>
  );
}
