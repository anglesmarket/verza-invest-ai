"use client";

import { useState } from "react";
import {
  Wallet,
  X,
  AlertCircle,
  DollarSign,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { StartupDetail, formatCurrency } from "./types";

interface InvestmentModalProps {
  startup: StartupDetail;
  fundingPercentage: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvestmentModal({
  startup,
  fundingPercentage,
  onClose,
  onSuccess,
}: InvestmentModalProps) {
  const [amount, setAmount] = useState(startup.minimumInvestment || 1000);
  const [message, setMessage] = useState("");
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInvest = async () => {
    setError("");

    if (amount < startup.minimumInvestment) {
      setError(
        `Minimum investment is $${startup.minimumInvestment.toLocaleString()}`
      );
      return;
    }

    const remaining = startup.fundingGoal - startup.fundingRaised;
    if (remaining > 0 && amount > remaining) {
      setError(
        `Maximum remaining amount is $${remaining.toLocaleString()}`
      );
      return;
    }

    setInvesting(true);
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupId: startup.id,
          amount,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Investment failed");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setInvesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-card p-6 w-full max-w-lg shadow-2xl rounded-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Invest in {startup.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Success View */}
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Investment Successful!
            </h3>
            <p className="text-sm text-slate-500">
              You invested {formatCurrency(amount)} in {startup.name}
            </p>
          </div>
        ) : (
          <>
            {/* Startup Summary */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-5">
              {startup.logo ? (
                <img
                  src={startup.logo}
                  alt={startup.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white text-lg font-bold">
                  {startup.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {startup.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatCurrency(startup.fundingRaised)} raised of{" "}
                  {formatCurrency(startup.fundingGoal)}
                </p>
              </div>
              <span className="badge-primary text-[10px]">
                {startup.stage}
              </span>
            </div>

            {/* Funding Progress Mini */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {fundingPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${fundingPercentage}%` }}
                />
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Investment Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                    setError("");
                  }}
                  min={startup.minimumInvestment}
                  step={100}
                  className="input-field pl-10 py-3 text-lg font-semibold"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-slate-400">
                  Min: {formatCurrency(startup.minimumInvestment)}
                </p>
                {startup.fundingGoal - startup.fundingRaised > 0 && (
                  <p className="text-xs text-slate-400">
                    Remaining:{" "}
                    {formatCurrency(
                      startup.fundingGoal - startup.fundingRaised
                    )}
                  </p>
                )}
              </div>
              {/* Quick amount buttons */}
              <div className="flex gap-2 mt-2">
                {[
                  startup.minimumInvestment,
                  startup.minimumInvestment * 2,
                  startup.minimumInvestment * 5,
                  startup.minimumInvestment * 10,
                ].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setAmount(amt);
                      setError("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      amount === amt
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300 hover:text-indigo-500"
                    }`}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Message{" "}
                <span className="text-xs font-normal text-slate-400">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Send a note to the founders..."
                  className="input-field pl-10 py-2.5 text-sm resize-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {message.length}/500
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-ghost flex-1 py-3 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={investing || amount <= 0}
                className="btn-primary flex-1 py-3 text-sm"
              >
                {investing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Confirm Investment
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-3">
              By confirming, you agree to invest {formatCurrency(amount)} in
              this startup. This is recorded on the platform.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
