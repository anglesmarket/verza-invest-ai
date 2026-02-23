"use client";

import { Rocket, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Hero() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center section-padding pt-28 md:pt-32 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 end-1/4 w-80 h-80 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container-narrow w-full">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
            <Rocket className="w-4 h-4 text-indigo-600 dark:text-pink-400" />
            <span className="text-sm font-semibold gradient-text">
              Fund the Future, Today
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="gradient-text">Invest in Startups</span>
            <br />
            <span className="text-gray-900 dark:text-white">That Change the World</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-12 animate-fade-in">
            Discover innovative startups, connect with visionary entrepreneurs, 
            and be part of the next big success story. Start investing from just $1,000.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            {!session && (
              <button
                onClick={() => router.push("/auth/register")}
                className="btn-primary group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <button
              onClick={() => document.getElementById("startups")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-secondary"
            >
              Browse Startups
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in">
            <div className="glass-card p-6">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                $12.5M+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Funded
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-center mb-3">
                <Rocket className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                150+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Startups
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-pink-500" />
              </div>
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                2,400+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Investors
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
