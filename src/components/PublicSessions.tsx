"use client";

import { useData } from "@/context/DataContext";
import { Users, Globe, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PublicSessions() {
  const { publicSessions, topics } = useData();

  if (!publicSessions || publicSessions.length === 0) return null;

  return (
    <section className="section-padding bg-slate-50 dark:bg-slate-900/50">
      <div className="container-narrow">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-1 border-t-4 border-blue-600 dark:border-cyan-500 rounded-full" />
              <span className="text-sm font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest">Live Now</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              Browse Public <span className="gradient-text">Sessions</span>
            </h2>
          </div>
          <p className="text-slate-500 max-w-md font-medium">
            Jump into any active discussion room. These sessions are open to everyone and ready for your contribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicSessions.map((session) => {
            const topic = topics.find(t => t.id === session.currentTopicId);
            
            return (
              <div key={session.sessionId} className="glass-card p-6 border-blue-500/10 hover:border-blue-500/30 transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-cyan-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Session ID</h3>
                  <p className="text-xl font-mono font-black text-slate-900 dark:text-white">#{session.sessionId}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Topic</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[40px]">
                    {topic ? topic.en : "Moderator is selecting a topic..."}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold uppercase">
                      {session.ownerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Host</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">@{session.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold">{session.participantCount}</span>
                  </div>
                </div>

                <Link 
                  href={`/sessions/${session.sessionId}`}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-cyan-500 transition-colors"
                >
                  Join Discussion
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
