"use client";

import { Search, UserPlus, Wallet, TrendingUp, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SectionHeading from "./SectionHeading";

interface StepProps {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

function Step({ number, icon: Icon, title, description, delay }: StepProps) {
  return (
    <div
      className="relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Connector line (hidden on last item) */}
      <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-500/30 to-transparent -z-10" />

      <div className="text-center">
        {/* Icon Circle */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full gradient-primary mb-6 group hover:scale-110 transition-transform duration-300">
          <Icon className="w-10 h-10 text-white" />
          {/* Step Number Badge */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-pink-500 text-white text-sm font-bold flex items-center justify-center border-4 border-white dark:border-gray-900">
            {number}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const router = useRouter();
  const { data: session } = useSession();
  const steps = [
    {
      icon: UserPlus,
      title: "Create Account",
      description: "Sign up as an investor or entrepreneur in minutes. Complete your profile to get started.",
    },
    {
      icon: Search,
      title: "Explore Startups",
      description: "Browse through vetted startups across various industries. Filter by category, funding stage, and more.",
    },
    {
      icon: Wallet,
      title: "Invest Securely",
      description: "Choose your investment amount and complete the transaction securely through our platform.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your portfolio and watch your investments grow as startups reach their milestones.",
    },
  ];

  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-950">
      <div className="container-narrow">
        <SectionHeading
          badge="Simple Process"
          title="How It Works"
          description="Start investing in innovative startups in four easy steps"
          icon={TrendingUp}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              delay={index * 100}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 glass-card p-8">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Ready to Start Investing?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join thousands of investors supporting innovative startups
              </p>
            </div>
            {!session && (
              <button onClick={() => router.push("/auth/register")} className="btn-primary whitespace-nowrap">
                Get Started Now
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
