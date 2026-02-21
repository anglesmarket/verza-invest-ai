"use client";

import { useData } from "@/context/DataContext";

export default function About() {
  const { portfolio: data } = useData();
  const about = data.about;

  return (
    <section id="about" className="section-padding">
      <div className="container-narrow">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="accent-dot" />
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              {about.sectionTitle}
            </span>
            <span className="accent-dot" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {about.sectionTitle}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {about.sectionSubtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Text content */}
          <div className="lg:col-span-3 space-y-6">
            {about.paragraphs.map((text: string, i: number) => (
              <p
                key={i}
                className="text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-400"
              >
                {text}
              </p>
            ))}
          </div>

          {/* Highlights */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {about.highlights.map((item: any, i: number) => (
              <div
                key={i}
                className="glass-card p-6 text-center hover:shadow-lg hover:shadow-blue-600/5 dark:hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                  {item.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
