"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Heart,
  Share2,
  UserPlus,
  Loader2,
  Check,
  Users,
} from "lucide-react";
import { StartupDetail, formatCurrency } from "./types";

interface StartupSidebarProps {
  startup: StartupDetail;
  fundingPercentage: number;
  onInvestClick: () => void;
}

export default function StartupSidebar({
  startup,
  fundingPercentage,
  onInvestClick,
}: StartupSidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const isOwnStartup = user?.id === startup.owner?._id;

  // Save contact state
  const [contactSaved, setContactSaved] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  // Save/like state
  const [isSaved, setIsSaved] = useState(false);
  const [togglingSave, setTogglingSave] = useState(false);

  // Share toast
  const [shareToast, setShareToast] = useState(false);

  // Check if startup is saved on mount
  useEffect(() => {
    if (!session) return;
    fetch(`/api/saved-startups?startupId=${startup.id}`)
      .then((r) => r.json())
      .then((d) => setIsSaved(d.saved))
      .catch(() => {});
  }, [session, startup.id]);

  const handleToggleSave = useCallback(async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setTogglingSave(true);
    try {
      const res = await fetch("/api/saved-startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsSaved(data.saved);
    } catch {
      // silently fail
    } finally {
      setTogglingSave(false);
    }
  }, [session, startup.id, router]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: startup.name,
      text: `${startup.tagline} — Check out ${startup.name} on Verza InvestArt`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch {
      // User cancelled share or fallback
      try {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      } catch {}
    }
  }, [startup.name, startup.tagline]);

  const handleSaveContact = useCallback(async () => {
    if (!startup.owner?._id || !session) return;
    setSavingContact(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactUserId: startup.owner._id,
          startupId: startup.id,
          category: "entrepreneur",
          note: `Founder of ${startup.name}`,
        }),
      });
      if (res.status === 409) {
        setContactSaved(true);
        return;
      }
      if (!res.ok) throw new Error();
      setContactSaved(true);
    } catch {
      // silently fail
    } finally {
      setSavingContact(false);
    }
  }, [session, startup]);

  return (
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

        <button
          onClick={onInvestClick}
          disabled={!!isOwnStartup || fundingPercentage >= 100}
          className={`btn-primary w-full mt-2 ${
            isOwnStartup || fundingPercentage >= 100
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <Wallet className="w-4 h-4" />
          {fundingPercentage >= 100
            ? "Fully Funded"
            : isOwnStartup
            ? "Your Startup"
            : "Invest Now"}
        </button>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleToggleSave}
            disabled={togglingSave}
            className={`btn-secondary flex-1 py-2 text-sm transition-all ${
              isSaved
                ? "!bg-pink-50 dark:!bg-pink-950/30 !text-pink-600 dark:!text-pink-400 !border-pink-200 dark:!border-pink-800"
                : ""
            }`}
          >
            {togglingSave ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart
                className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
              />
            )}
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            onClick={handleShare}
            className="btn-secondary flex-1 py-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Save Contact */}
        {session &&
          startup.owner?._id &&
          user?.id !== startup.owner._id && (
            <button
              onClick={handleSaveContact}
              disabled={contactSaved || savingContact}
              className={`w-full mt-3 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
                contactSaved
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 cursor-default"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              {savingContact ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : contactSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Contact Saved
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Save Founder Contact
                </>
              )}
            </button>
          )}
      </div>

      {/* Recent Investors */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
          Investors
        </h3>
        {startup.recentInvestors && startup.recentInvestors.length > 0 ? (
          <div className="space-y-3">
            {startup.recentInvestors.slice(0, 5).map((inv: { name: string; image: string; amount: number; date: string }, i: number) => (
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

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white bg-emerald-600 animate-fade-in">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
