"use client";

import { Search, Filter, Rocket, Loader2 } from "lucide-react";
import StartupCard from "@/components/StartupCard";
import SectionHeading from "@/components/SectionHeading";
import { useState, useEffect } from "react";

interface StartupData {
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

export default function StartupsPage() {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [industries, setIndustries] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchStartups();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, selectedIndustry]);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedIndustry !== "All") params.set("industry", selectedIndustry);

      const res = await fetch(`/api/startups?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch startups");
      const data = await res.json();

      setStartups(data.startups || []);
      if (data.industries?.length) {
        setIndustries(["All", ...data.industries]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="container-narrow px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="All Startups"
          title="Explore Investment Opportunities"
          description="Discover innovative startups across industries. Filter by category or search to find the perfect investment."
          icon={Rocket}
        />

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search startups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="input-field pl-11 pr-8 appearance-none cursor-pointer min-w-[180px]"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchStartups} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Showing {startups.length} startup{startups.length !== 1 ? "s" : ""}
            </p>

            {startups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map((startup) => (
                  <StartupCard key={startup.id} {...startup} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Rocket className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No startups found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
