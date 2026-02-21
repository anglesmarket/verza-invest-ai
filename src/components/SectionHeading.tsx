"use client";

import { LucideIcon } from "lucide-react";

export interface SectionHeadingProps {
  badge: string;
  title: string;
  description: string;
  icon?: LucideIcon;
}

export default function SectionHeading({ badge, title, description, icon: Icon }: SectionHeadingProps) {
  return (
    <div className="text-center mb-16 md:mb-20">
      <div className="inline-flex items-center gap-2 mb-4">
        <span className="accent-dot" />
        <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
          {badge}
        </span>
        <span className="accent-dot" />
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
        {title}
      </h2>
      <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
}
