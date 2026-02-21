"use client";

import { useData } from "@/context/DataContext";

export default function Footer() {
  const { portfolio: data } = useData();
  const footer = data.footer;

  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-start">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {footer.copyright}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {footer.tagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
