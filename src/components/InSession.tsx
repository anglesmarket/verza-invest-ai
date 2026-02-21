"use client";

import { useData } from "@/context/DataContext";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { LogOut, Users, Sparkles, MessageSquare, ShieldCheck, Timer, Clock, Lock, UserPlus, Settings, Check, Globe, AlertCircle, Slash } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

export default function InSession() {
  const { activeTopic, topics, currentSession, sessionIsPublic, sessionOwnerId, sessionOwnerName, sessionNotFound, updateSessionSettings, leaveSession, participants } = useData();
  const { data: sessionData } = useSession();
  const { toast, confirm } = useNotification();
  const [elapsed, setElapsed] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [showTopicPicker, setShowTopicPicker] = useState(false);

  const isLoggedIn = !!sessionData?.user;
  const currentUserId = (sessionData?.user as any)?.id;
  const userRoles: string[] = (sessionData?.user as any)?.roles || [];
  const isModeratorLevel = userRoles.includes('admin') || userRoles.includes('moderator');
  const isOwner = currentUserId && sessionOwnerId && currentUserId === sessionOwnerId;
  const canTerminate = isOwner || isModeratorLevel;
  const showContent = isLoggedIn || sessionIsPublic;

  useEffect(() => {
    if (sessionNotFound) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
      
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionNotFound]);

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return [h, m].map(v => v < 10 ? "0" + v : v).join(":");
  };

  if (sessionNotFound) {
     return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
           <div className="max-w-md w-full text-center">
              <div className="w-24 h-24 rounded-3xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-8 animate-bounce">
                 <AlertCircle className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">404 NOT FOUND</h1>
              <p className="text-slate-500 mb-10 leading-relaxed">
                 The session you are looking for has either expired, been closed by the host, or simply never existed.
              </p>
              <Link href="/" className="btn-primary inline-flex">
                 Back to Main Portal
              </Link>
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 animate-fade-in">
      <div className="container-narrow">
        
        {/* Login Dialog Segment for non-logged in users */}
        {!isLoggedIn && (
          <div className="mb-10 glass-card p-8 border-yellow-500/30 bg-yellow-500/5 flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Logged out View</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {sessionIsPublic 
                    ? "You are viewing this session in public mode. Log in to vote or participate."
                    : "This session is private. Please sign in to view the discussion details."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
               <Link href="/auth/signin" className="btn-primary py-2.5 px-6">
                 Sign In
               </Link>
               <Link href="/auth/register" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition-all border border-slate-200 dark:border-slate-700 text-sm">
                 <UserPlus className="w-4 h-4" />
                 Register
               </Link>
            </div>
          </div>
        )}

        {/* The rest of the content is conditional */}
        {showContent ? (
          <>
            {/* Session Status Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 p-6 glass-card border-blue-500/20 dark:border-cyan-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 dark:bg-cyan-500 flex items-center justify-center text-white shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Session</p>
              <h2 className="text-xl font-bold font-mono tracking-tighter text-blue-600 dark:text-cyan-400">
                #{currentSession}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 group">
              <div className="flex -space-x-3 rtl:space-x-reverse me-2">
                {participants.slice(0, 5).map((p, i) => (
                  <div key={p._id || i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 dark:bg-cyan-500 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden shadow-sm" title={p.name}>
                    {p.name?.charAt(0) || "U"}
                  </div>
                ))}
                {participants.length > 5 && (
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                    +{participants.length - 5}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-slate-500">
                {participants.length} participating
              </span>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={leaveSession}
               className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all"
             >
               <LogOut className="w-4 h-4" />
               Leave
             </button>

             {canTerminate && (
               <button 
                 onClick={async () => {
                    const confirmed = await confirm({
                       title: "End Session",
                       message: "Terminate this session for all participants? All active participation will stop immediately.",
                       confirmLabel: "Terminate",
                       type: "danger"
                    });
                    if (confirmed) {
                       updateSessionSettings({ isActive: false });
                       toast("Session has been terminated", "info");
                    }
                 }}
                 title={isOwner ? "Host control: Terminate session" : "Moderator control: Force close session"}
                 className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-black text-sm border border-red-500 hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 uppercase tracking-tighter"
               >
                 <Slash className="w-4 h-4" />
                 End Session
               </button>
             )}
          </div>
        </div>

        {/* Main Discussion Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Moderator Controls */}
            {canTerminate && (
              <div className="glass-card p-4 border-dashed border-blue-500/50 bg-blue-500/5 flex flex-col md:flex-row items-center justify-between gap-4 mb-2 animate-fade-in relative z-30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Session Controls</h4>
                    <p className="text-[10px] text-slate-500 font-bold">
                       {isOwner ? "You are the host of this discussion room." : "System Moderator: You can override settings."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => updateSessionSettings({ isPublic: !sessionIsPublic })}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                       sessionIsPublic 
                         ? "bg-green-100 text-green-700 border border-green-200" 
                         : "bg-slate-200 text-slate-700 border border-slate-300"
                     }`}
                   >
                     {sessionIsPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                     {sessionIsPublic ? "Public" : "Private"}
                   </button>
                   
                   <div className="relative">
                      <button 
                        onClick={() => setShowTopicPicker(!showTopicPicker)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all border border-blue-500 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Change Topic
                      </button>
                      
                      {showTopicPicker && (
                         <div className="absolute right-0 lg:left-0 mt-2 w-72 max-h-80 overflow-y-auto z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-2 animate-fade-in translate-y-1">
                            {topics.filter(t => t.status === 'approved').map(topic => (
                               <button 
                                 key={topic.id}
                                 onClick={() => {
                                   updateSessionSettings({ currentTopicId: topic.id });
                                   setShowTopicPicker(false);
                                 }}
                                 className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all mb-1 flex items-start gap-2 ${
                                   activeTopic?.id === topic.id 
                                     ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                                     : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                 }`}
                               >
                                 <div className="mt-0.5 shrink-0">
                                   {activeTopic?.id === topic.id ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />}
                                 </div>
                                 <span>{topic.en}</span>
                               </button>
                            ))}
                         </div>
                      )}
                   </div>
                </div>
              </div>
            )}

            {/* Active Topic Card */}
            <div className="glass-card p-8 md:p-12 border-2 border-blue-500/30 dark:border-cyan-500/30 relative overflow-hidden">
                <div className="absolute top-0 start-0 p-3 bg-blue-600 text-white rounded-ee-2xl shadow-lg">
                    <MessageSquare className="w-5 h-5" />
                </div>
                
                <div className="text-center pt-4">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 inline-block">Current Discussion Topic</span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
                        {activeTopic ? activeTopic.en : "Topic Pending..."}
                    </h1>
                    
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5">
                        <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{activeTopic?.flashcard || "The moderator is selecting the prompt cards."}"
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Timer className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium tracking-tighter">ELAPSED: {formatElapsed(elapsed)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium tracking-tighter">LOCAL: {currentTime}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center gap-2 text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium tracking-tighter uppercase">Encrypted</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Sidebar / Controls */}
          <div className="space-y-6">
            <div className="glass-card p-6 border-blue-100 dark:border-cyan-900/30">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Discussion Roles
                </h3>
                <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-cyan-950/30 border border-blue-100 dark:border-cyan-900/40 flex items-center justify-between">
                        <span className="text-sm font-medium">Your Role</span>
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-black uppercase text-blue-600 dark:text-cyan-400">
                              {isOwner ? "Host" : "Participant"}
                           </span>
                           {isModeratorLevel && !isOwner && (
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">(System Moderator)</span>
                           )}
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-medium">Session Host</span>
                        <span className="text-xs font-bold text-slate-500">@{sessionOwnerName || "Loading..."}</span>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-500/20">
                <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
                <p className="text-sm text-blue-50 opacity-90 leading-relaxed">
                    Use the flashcard above as a guide for your speech. The session will sync automatically if the moderator changes the topic.
                </p>
            </div>
          </div>
        </div>
        </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
             <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800">
               <Lock className="w-12 h-12 text-blue-600 dark:text-cyan-500" />
             </div>
             <h4 className="text-2xl font-black gradient-text mb-4 uppercase tracking-tighter">Private Session</h4>
             <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
               This discussion is reserved for authorized participants only. Please sign in to gain access to the session flow and flashcards.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
