"use client";

import { MapPin, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface StartupCardProps {
  id: string;
  logo: string;
  name: string;
  tagline: string;
  industry: string;
  location: string;
  fundingGoal: number;
  fundingRaised: number;
  investorCount: number;
}

export default function StartupCard({
  id,
  logo,
  name,
  tagline,
  industry,
  location,
  fundingGoal,
  fundingRaised,
  investorCount,
}: StartupCardProps) {
  const router = useRouter();
  const fundingPercentage = Math.min((fundingRaised / fundingGoal) * 100, 100);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  return (
    <div
      onClick={() => router.push(`/startups/${id}`)}
      className="card-startup group"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {logo || name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
            {name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {tagline}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="badge-primary">{industry}</span>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{location}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatCurrency(fundingRaised)} raised
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {fundingPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${fundingPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Goal: {formatCurrency(fundingGoal)}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{investorCount} investors</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-pink-400 group-hover:gap-2 transition-all">
          <span>View Details</span>
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
