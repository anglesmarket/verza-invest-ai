"use client";

import { Rocket, ArrowRight, Loader2 } from "lucide-react";
import StartupCard from "./StartupCard";
import SectionHeading from "./SectionHeading";
import { useRouter } from "next/navigation";
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

export default function FeaturedStartups() {
  const router = useRouter();
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/startups?featured=true&limit=6")
      .then((res) => res.json())
      .then((data) => {
        setStartups(data.startups || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="startups" className="section-padding bg-white dark:bg-gray-900">
        <div className="container-narrow">
          <SectionHeading
            badge="Featured Startups"
            title="Discover Your Next Investment"
            description="Browse innovative startups looking for funding."
            icon={Rocket}
          />
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (startups.length === 0) return null;

  return (
    <section id="startups" className="section-padding bg-white dark:bg-gray-900">
      <div className="container-narrow">
        <SectionHeading
          badge="Featured Startups"
          title="Discover Your Next Investment"
          description="Browse innovative startups looking for funding. From AI to CleanTech, find opportunities that align with your investment goals."
          icon={Rocket}
        />

        {/* Startup Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {startups.map((startup) => (
            <StartupCard key={startup.id} {...startup} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button
            onClick={() => router.push("/startups")}
            className="btn-primary group"
          >
            <span>View All Startups</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
