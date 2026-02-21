"use client";

import { useData } from "@/context/DataContext";
import {
  PlusCircle,
  Users,
  Zap,
  CheckCircle2,
} from "lucide-react";

const iconMap: Record<string, any> = {
  PlusCircle,
  Users,
  Zap,
};

export default function Services() {
  const { portfolio: data } = useData();
  const services = data.services;

  return (
    <section
      id="sessions"
      className="section-padding bg-slate-50/50 dark:bg-slate-900/50"
    >
      <div className="container-narrow">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="accent-dot" />
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              {services.sectionTitle}
            </span>
            <span className="accent-dot" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {services.sectionTitle}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {services.sectionSubtitle}
          </p>
        </div>

        {/* Service cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services.items.map((service: any, i: number) => {
            const Icon = iconMap[service.icon] || PlusCircle;
            return (
              <div
                key={i}
                className="glass-card p-8 md:p-10 group hover:shadow-xl hover:shadow-blue-600/5 dark:hover:shadow-cyan-500/5 transition-all duration-500 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-cyan-950/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-blue-600 dark:text-cyan-400" />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5">
                  {service.features.map((feature: string, j: number) => (
                    <li
                      key={j}
                      className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
