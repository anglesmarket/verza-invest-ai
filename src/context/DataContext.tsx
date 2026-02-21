"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_SITE_CONTENT } from '@/lib/constants';
import { useRouter, usePathname } from 'next/navigation';

interface Topic {
  id: number;
  en: string;
  votes: number;
  flashcard: string;
  status: string;
  _id?: string;
  tags?: string[];
}

interface DataContextType {
  topics: Topic[];
  activeTopic: Topic | null;
  publicSessions: any[];
  currentSession: string | null;
  sessionIsPublic: boolean;
  sessionOwnerId: string | null;
  sessionOwnerName: string | null;
  sessionTopicId: number | null;
  sessionNotFound: boolean;
  participants: any[];
  isLoading: boolean;
  error: string | null;
  portfolio: typeof INITIAL_SITE_CONTENT;
  votedTopicId: number | null;
  refreshData: () => Promise<void>;
  voteForTopic: (id: number) => Promise<void>;
  joinSession: (id: string, isPublic?: boolean) => Promise<void>;
  updateSessionSettings: (settings: { isPublic?: boolean, currentTopicId?: number, isActive?: boolean }) => Promise<void>;
  leaveSession: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopicGlobal, setActiveTopicGlobal] = useState<Topic | null>(null);
  const [votedTopicId, setVotedTopicId] = useState<number | null>(null);
  const [publicSessions, setPublicSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sessionIsPublic, setSessionIsPublic] = useState(true);
  const [sessionOwnerId, setSessionOwnerId] = useState<string | null>(null);
  const [sessionOwnerName, setSessionOwnerName] = useState<string | null>(null);
  const [sessionTopicId, setSessionTopicId] = useState<number | null>(null);
  const [sessionNotFound, setSessionNotFound] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState(INITIAL_SITE_CONTENT);

  // Derived active topic: session topic first, then global active topic
  const activeTopic = topics.find(t => t.id === sessionTopicId) || activeTopicGlobal;

  const fetchParticipants = useCallback(async (id: string) => {
    try {
      const resp = await fetch(`/api/sessions/${id}`);
      if (resp.status === 404) {
        setSessionNotFound(true);
        return;
      }
      
      if (resp.ok) {
        const data = await resp.json();
        setParticipants(data.participants || []);
        setSessionIsPublic(data.isPublic ?? true);
        setSessionOwnerId(data.owner);
        setSessionOwnerName(data.ownerName);
        setSessionTopicId(data.currentTopicId);
        setSessionNotFound(false);
      }
    } catch (err) {
      console.error("Participants fetch error:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      
      if (result.topics) setTopics(result.topics);
      if (result.activeTopic) setActiveTopicGlobal(result.activeTopic);
      if (result.votedTopicId !== undefined) setVotedTopicId(result.votedTopicId);
      if (result.publicSessions) setPublicSessions(result.publicSessions);
      if (result.portfolio) setPortfolio(result.portfolio);
      
      // If we are already in session, fetch participants
      if (currentSession) {
        await fetchParticipants(currentSession);
      }
      
      setError(null);
    } catch (err: any) {
      console.error("Data fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, fetchParticipants]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle SSE and Session monitoring (metadata SSE replaces frequent polling)
  useEffect(() => {
    const SSE_DISABLED = process.env.NEXT_PUBLIC_DISABLE_SSE === 'true';

    // If SSE is explicitly disabled, keep the server routes but don't open EventSource.
    // Provide a lightweight polling fallback so UI state (participants/metadata) still updates.
    if (SSE_DISABLED) {
      console.info('SSE disabled via NEXT_PUBLIC_DISABLE_SSE — using polling fallbacks.');

      // Poll participants when inside a session
      let participantPoll: NodeJS.Timeout | null = null;
      if (currentSession) {
        fetchParticipants(currentSession);
        participantPoll = setInterval(() => {
          if (currentSession) fetchParticipants(currentSession);
        }, 10000) as unknown as NodeJS.Timeout;
      }

      // Low-frequency metadata polling to replace site-level SSE events
      const metadataPoll = setInterval(fetchData, 30000) as unknown as NodeJS.Timeout;

      return () => {
        if (participantPoll) clearInterval(participantPoll);
        clearInterval(metadataPoll);
      };
    }

    // --- Metadata SSE (replaces polling) ---
    let metadataES: EventSource | null = null;
    let metadataReconnectTimeout: NodeJS.Timeout | null = null;
    let metadataReconnectAttempts = 0;
    const MAX_METADATA_RECONNECT_ATTEMPTS = 10;

    const connectMetadataSSE = () => {
      if (typeof window === 'undefined' || !('EventSource' in window)) {
        // environment doesn't support EventSource — keep initial fetch only
        return;
      }

      metadataES = new EventSource('/api/data/events');

      metadataES.onopen = () => {
        metadataReconnectAttempts = 0;
      };

      metadataES.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          // any site-level event -> re-fetch latest metadata
          fetchData();
        } catch (err) {
          console.error('Metadata SSE parse error:', err);
        }
      };

      metadataES.onerror = () => {
        console.warn('Metadata SSE error — reconnecting...');
        metadataES?.close();
        metadataES = null;

        if (metadataReconnectAttempts < MAX_METADATA_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, metadataReconnectAttempts), 30000);
          metadataReconnectAttempts++;
          metadataReconnectTimeout = setTimeout(connectMetadataSSE, delay);
        } else {
          console.error('Metadata SSE max reconnect attempts reached — falling back to low-frequency polling.');
          // fallback polling (very infrequent)
          metadataReconnectTimeout = setInterval(fetchData, 60000) as unknown as NodeJS.Timeout;
        }
      };
    };

    // Start metadata SSE connection
    connectMetadataSSE();

    // --- Session SSE (unchanged behaviour) ---
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 10;

    const connectSSE = () => {
      if (!currentSession) return;

      // First, do one immediate fetch
      fetchParticipants(currentSession);

      // Connect to SSE
      eventSource = new EventSource(`/api/sessions/${currentSession}/events`);

      eventSource.onopen = () => {
        reconnectAttempts = 0; // Reset on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log('SSE Event Received:', payload);

          switch (payload.type) {
            case 'terminate':
              setSessionNotFound(true);
              break;
            case 'update':
              if (payload.data?.currentTopicId !== undefined) {
                setSessionTopicId(payload.data.currentTopicId);
              }
              break;
            case 'join':
              // Any join/leave event triggers a participant list refresh
              if (currentSession) fetchParticipants(currentSession);
              break;
          }
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };

      eventSource.onerror = () => {
        console.warn('SSE connection error, attempting reconnect...');
        eventSource?.close();
        eventSource = null;

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          reconnectTimeout = setTimeout(connectSSE, delay);
        } else {
          console.error('SSE max reconnect attempts reached, falling back to polling only.');
        }
      };
    };

    if (currentSession) {
      connectSSE();
    }

    return () => {
      if (metadataES) {
        metadataES.close();
      }
      if (metadataReconnectTimeout) {
        clearTimeout(metadataReconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [currentSession, fetchData, fetchParticipants]);

  const voteForTopic = useCallback(async (id: number) => {
    try {
      const response = await fetch('/api/topics/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to record vote');
      }
      
      // Re-fetch everything to ensure synced state (removed old vote)
      await fetchData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchData]);

  const updateSessionSettings = useCallback(async (settings: { isPublic?: boolean, currentTopicId?: number, isActive?: boolean }) => {
    if (!currentSession) return;
    try {
      const response = await fetch(`/api/sessions/${currentSession}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        await fetchParticipants(currentSession);
      }
    } catch (err) {
      console.error("Update session settings failed:", err);
    }
  }, [currentSession, fetchParticipants]);

  const joinSession = useCallback(async (id: string, isPublic: boolean = true) => {
    try {
      // Clear 404 state first
      setSessionNotFound(false);
      
      // 1. Join on server
      const resp = await fetch(`/api/sessions/${id}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic }) 
      });

      if (resp.status === 404) {
        setSessionNotFound(true);
        if (pathname !== `/sessions/${id}`) {
          router.push(`/sessions/${id}`);
        }
        return;
      }
      
      // 2. Set local state
      setCurrentSession(id);
      setSessionIsPublic(isPublic);
      
      // Fetch data immediately to determine ownership
      await fetchParticipants(id);
      
      // 3. Navigate if not already on the page
      if (pathname !== `/sessions/${id}`) {
        router.push(`/sessions/${id}`);
      }
    } catch (error) {
       console.error("Join session failed server-side");
       setCurrentSession(id); // Fallback
       setSessionIsPublic(isPublic);
       if (pathname !== `/sessions/${id}`) {
         router.push(`/sessions/${id}`);
       }
    }
  }, [fetchParticipants, pathname, router]);

  const leaveSession = useCallback(async () => {
    if (currentSession) {
      await fetch(`/api/sessions/${currentSession}`, { method: 'DELETE' });
    }
    setCurrentSession(null);
    setParticipants([]);
    setSessionOwnerId(null);
    setSessionOwnerName(null);
    setSessionTopicId(null);
    setSessionNotFound(false);
    router.push("/");
  }, [currentSession, router]);

  return (
    <DataContext.Provider value={{
      topics,
      activeTopic,
      publicSessions,
      currentSession,
      sessionIsPublic,
      sessionOwnerId,
      sessionOwnerName,
      sessionTopicId,
      sessionNotFound,
      participants,
      isLoading,
      votedTopicId,
      error,
      portfolio,
      refreshData: fetchData,
      voteForTopic,
      joinSession,
      updateSessionSettings,
      leaveSession
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
