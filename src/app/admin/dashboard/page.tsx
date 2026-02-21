"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, X, Star, Trash2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

interface Topic {
  id: number;
  en: string;
  votes: number;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  flashcard: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const { toast, confirm } = useNotification();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch("/api/admin/topics", { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      } else {
        const errData = await res.json();
        console.error("API error:", errData.error);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error("Fetch topics timed out after 10 seconds.");
      } else {
        console.error("Fetch topics error:", error);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchTopics();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const updateTopic = async (id: number, updates: any) => {
    try {
      const res = await fetch("/api/admin/topics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) fetchTopics();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const userRoles: string[] = (session?.user as any)?.roles || [];
  if (!session || (!userRoles.includes('admin') && !userRoles.includes('moderator'))) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="glass-card p-10 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-6">Moderator privileges are required to view this page.</p>
          <Link href="/" className="btn-primary inline-flex">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Moderation Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Approve suggestions and set the active weekly topic.
            </p>
          </div>
          {(session.user as any).roles?.includes("admin") && (
            <div className="flex items-center gap-3">
              <Link href="/admin/users" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Manage Users
              </Link>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {topics.map((topic) => (
            <div 
              key={topic.id} 
              className={`glass-card p-6 border-l-4 transition-all ${
                topic.isActive 
                  ? "border-l-blue-500 dark:border-l-cyan-500 shadow-lg shadow-blue-500/10" 
                  : topic.status === 'pending'
                  ? "border-l-amber-500"
                  : topic.status === 'approved'
                  ? "border-l-green-500"
                  : "border-l-red-500"
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {topic.status === 'pending' && <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>}
                        {topic.status === 'approved' && <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3"/> Approved</span>}
                        {topic.isActive && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-current"/> Weekly Pick</span>}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{topic.en}</h3>
                      <p className="text-sm text-slate-500 mt-1">{topic.votes} vote{topic.votes !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Flashcard / Prompt</p>
                    <p className="text-slate-700 dark:text-slate-300 italic">"{topic.flashcard}"</p>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col justify-end gap-2 shrink-0">
                  {topic.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateTopic(topic.id, { status: 'approved' })}
                        className="p-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => updateTopic(topic.id, { status: 'rejected' })}
                        className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {topic.status === 'approved' && !topic.isActive && (
                    <button 
                      onClick={() => updateTopic(topic.id, { isActive: true })}
                      className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                      title="Set as Weekly Topic"
                    >
                      <Star className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm font-bold">Set as Active</span>
                    </button>
                  )}

                  {topic.status === 'rejected' && (
                    <button 
                      onClick={() => updateTopic(topic.id, { status: 'pending' })}
                      className="p-2.5 rounded-xl bg-slate-500 text-white hover:bg-slate-600 transition-colors"
                      title="Undo Rejection"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button 
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: "Delete Topic",
                        message: `Permanently delete "${topic.en}"? This cannot be undone.`,
                        confirmLabel: "Delete",
                        type: "danger"
                      });
                      if (confirmed) {
                        try {
                          const res = await fetch(`/api/admin/topics?id=${topic.id}`, { method: "DELETE" });
                          if (res.ok) {
                            toast("Topic deleted", "success");
                            fetchTopics();
                          } else {
                            toast("Failed to delete topic", "error");
                          }
                        } catch {
                          toast("Connection error", "error");
                        }
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-red-500 hover:text-white transition-all" 
                    title="Delete Permanent"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {topics.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">No suggestions in the queue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
