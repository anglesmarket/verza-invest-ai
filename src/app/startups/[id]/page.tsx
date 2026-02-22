"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Globe,
  TrendingUp,
  Wallet,
  Share2,
  Heart,
  UsersRound,
  Loader2,
  Eye,
  Target,
  Lightbulb,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

interface StartupDetail {
  id: string;
  logo: string;
  name: string;
  tagline: string;
  industry: string;
  location: string;
  fundingGoal: number;
  fundingRaised: number;
  investorCount: number;
  description: string;
  solution: string;
  valueProposition: string;
  businessModel: string;
  founded: string;
  teamSize: number;
  founders: { name: string; role: string; bio: string }[];
  website: string;
  stage: string;
  minimumInvestment: number;
  viewCount: number;
  recentInvestors: { name: string; image: string; amount: number; date: string }[];
}

export default function StartupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchStartup(params.id as string);
    }
  }, [params.id]);

  const fetchStartup = async (id: string) => {
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

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

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
        <div className="glass-card p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {startup.logo ? (
              <img
                src={startup.logo}
                alt={startup.name}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {startup.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {startup.name}
                </h1>
                <span className="badge-primary w-fit">{startup.industry}</span>
                {startup.stage && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 w-fit">
                    {startup.stage}
                  </span>
                )}
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                {startup.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{startup.location}</span>
                </div>
                {startup.founded && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Founded {startup.founded}</span>
                  </div>
                )}
                {startup.teamSize > 0 && (
                  <div className="flex items-center gap-1">
                    <UsersRound className="w-4 h-4" />
                    <span>{startup.teamSize} team members</span>
                  </div>
                )}
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{startup.website.replace("https://", "")}</span>
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{startup.viewCount} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem / About */}
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

            {/* Solution */}
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

            {/* Business Model */}
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

            {/* Founders */}
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
          <div className="space-y-6">
            {/* Funding Progress */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Funding Progress
              </h3>
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(startup.fundingRaised)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {fundingPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${fundingPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  of {formatCurrency(startup.fundingGoal)} goal
                </p>
              </div>

              {startup.minimumInvestment > 0 && (
                <p className="text-xs text-slate-500 mb-4">
                  Minimum investment: {formatCurrency(startup.minimumInvestment)}
                </p>
              )}

              <button className="btn-primary w-full mt-2">
                <Wallet className="w-4 h-4" />
                Invest Now
              </button>

              <div className="flex gap-2 mt-3">
                <button className="btn-secondary flex-1 py-2 text-sm">
                  <Heart className="w-4 h-4" />
                  Save
                </button>
                <button className="btn-secondary flex-1 py-2 text-sm">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Recent Investors */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                Investors
              </h3>
              {startup.recentInvestors && startup.recentInvestors.length > 0 ? (
                <div className="space-y-3">
                  {startup.recentInvestors.slice(0, 5).map((inv, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {inv.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {inv.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(inv.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex -space-x-2 mb-3">
                  {Array.from({ length: Math.min(startup.investorCount, 6) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px] font-bold"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    )
                  )}
                  {startup.investorCount > 6 && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      +{startup.investorCount - 6}
                    </div>
                  )}
                </div>
              )}
              <p className="text-sm text-slate-500 mt-3">
                {startup.investorCount} people have invested in this startup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
