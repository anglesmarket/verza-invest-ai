"use client";

import { useState, useMemo } from "react";
import { ThumbsUp, Layers, Send, AlertCircle, CheckCircle2, Tag } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useSession } from "next-auth/react";
import { useNotification } from "@/context/NotificationContext";

export default function Topics() {
  const { topics, activeTopic, voteForTopic, refreshData, portfolio, votedTopicId } = useData();
  const { data: session } = useSession();
  const { confirm, toast } = useNotification();
  const data = portfolio.auth;
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  
  const [newTopicEn, setNewTopicEn] = useState("");
  const [newFlashcard, setNewFlashcard] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    topics.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [topics]);

  const filteredTopics = useMemo(() => {
    if (!selectedTag) return topics;
    return topics.filter(t => t.tags?.includes(selectedTag));
  }, [topics, selectedTag]);

  const handleVote = async (id: number) => {
    if (!session) {
      toast("Please login to vote!", "error");
      return;
    }

    // Admin/Moderator action: Set Active
    const userRoles: string[] = (session?.user as any)?.roles || [];
    if (userRoles.includes('admin') || userRoles.includes('moderator')) {
       const confirmSet = await confirm({
          title: "Public Topic Assignment",
          message: "Set this topic as the active Weekly Pick for everyone? This is a moderator action.",
          confirmLabel: "Set Active",
          type: "primary"
       });

       if (confirmSet) {
          try {
            const res = await fetch("/api/admin/topics", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, isActive: true })
            });
            if (res.ok) {
              toast("Active topic updated successfully", "success");
              refreshData();
              return;
            } else {
              toast("Failed to update active topic", "error");
            }
          } catch (err) {
            toast("Connection error", "error");
          }
       }
    }

    // Voting Logic
    if (votedTopicId === id) {
      toast("You've already voted for this topic!", "info");
      return;
    }

    // If user already voted for something else, ask for confirmation
    if (votedTopicId !== null) {
      const confirmed = await confirm({
        title: "Change Vote?",
        message: "You have already voted for another topic. Do you want to switch your vote to this one?",
        confirmLabel: "Switch Vote",
        type: "primary"
      });
      if (!confirmed) return;
    }

    try {
      await voteForTopic(id);
      toast("Vote registered", "success");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to vote", "error");
    }
  };

  const handleSubmitTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    setIsSubmitting(true);
    setSubmitStatus("idle");
    
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          en: newTopicEn,
          flashcard: newFlashcard,
        }),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setNewTopicEn("");
        setNewFlashcard("");
        toast("Topic suggested successfully!", "success");
        setTimeout(() => {
          setShowSubmitModal(false);
          setSubmitStatus("idle");
          refreshData();
        }, 2000);
      } else {
        setSubmitStatus("error");
        toast("Failed to suggest topic", "error");
      }
    } catch (err) {
      setSubmitStatus("error");
      toast("Connection error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="topics" className="section-padding overflow-hidden">
      <div className="container-narrow">
        {/* Active Chosen Topic / Winner Section */}
        {activeTopic && (
          <div className="mb-20 animate-fade-in">
            <div className="glass-card p-10 md:p-14 border-blue-500 dark:border-cyan-500 border-2 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg">
                Active Topic
              </div>
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-cyan-950 flex items-center justify-center mx-auto mb-8 shadow-inner shadow-blue-500/10">
                <Layers className="w-10 h-10 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              {activeTopic.tags && activeTopic.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {activeTopic.tags.map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-blue-100/60 dark:bg-cyan-900/40 text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider border border-blue-200/50 dark:border-cyan-800/50">
                      <Tag className="w-3 h-3 inline me-1 -mt-0.5" />{t}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="text-3xl md:text-4xl font-black mb-6 gradient-text uppercase tracking-tight">
                {activeTopic.en}
              </h3>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-8" />
              <div className="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">
                  "{activeTopic.flashcard}"
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-start">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {activeTopic ? "Next Topics" : "Explore Topics"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Vote on the next weekly discussion topic.
            </p>
          </div>
          
          {session ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-primary"
            >
              <Send className="w-4 h-4" />
              {data.suggestTopic}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              <AlertCircle className="w-4 h-4 mb-2 text-blue-500 inline me-2" />
              {data.loginToSuggest}
            </div>
          )}
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                !selectedTag 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Topics
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
                  selectedTag === tag
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500/50"
                }`}
              >
                <Tag className="w-3 h-3" />
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`flex items-center justify-between p-6 rounded-2xl border transition-all relative overflow-hidden isolate group ${
                votedTopicId === topic.id
                  ? "bg-blue-50 dark:bg-cyan-950/30 border-blue-500 dark:border-cyan-500 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Progress Bar Background */}
              <div 
                className="absolute inset-0 bg-blue-500/5 dark:bg-cyan-400/5 origin-left transition-transform duration-1000 ease-out"
                style={{ transform: `scaleX(${votedTopicId === topic.id ? 1 : 0})` }}
              />

              <div className="text-left relative z-[1] w-full me-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {topic.tags?.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-blue-100/50 dark:bg-cyan-900/30 text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-tighter">
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white transition-colors">
                  {topic.en}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {topic.votes} votes
                </p>
              </div>
              <button
                onClick={() => handleVote(topic.id)}
                className={`relative z-[1] p-3 rounded-xl transition-all shrink-0 cursor-pointer ${
                  votedTopicId === topic.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 rotate-12" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-blue-100 dark:hover:bg-cyan-900/50 hover:text-blue-600 dark:hover:text-cyan-400"
                }`}
                title="Vote for this topic"
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
            </div>
          ))}
          {filteredTopics.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-500">No topics found for this tag.</p>
            </div>
          )}
        </div>

        {/* Suggest Topic Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card p-8 w-full max-w-lg shadow-2xl relative animate-slide-up">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="absolute top-4 end-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <div className="w-6 h-6 rotate-45 flex items-center justify-center font-bold text-xl">X</div>
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-cyan-950 flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold gradient-text">{data.suggestTopic}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{data.suggestionNote}</p>
              </div>

              {submitStatus === "success" ? (
                <div className="text-center py-10 animate-fade-in">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Topic suggested!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitTopic} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Topic Title
                    </label>
                    <input
                      required
                      value={newTopicEn}
                      onChange={(e) => setNewTopicEn(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="e.g. Artificial Intelligence Ethics"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Flashcard / Discussion Prompt
                    </label>
                    <textarea
                      required
                      value={newFlashcard}
                      onChange={(e) => setNewFlashcard(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-h-[120px] resize-none"
                      placeholder="Provide a prompt or a few questions to guide the conversation..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white font-bold transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : data.submitSuggestion}
                    {!isSubmitting && <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
