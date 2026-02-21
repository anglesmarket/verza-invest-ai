type SessionEvent = {
  type: 'update' | 'terminate' | 'join';
  data?: any;
};

type Listener = (event: SessionEvent) => void;

class SessionEventManager {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe(sessionId: string, listener: Listener) {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }
    this.listeners.get(sessionId)!.add(listener);

    return () => {
      const sessionListeners = this.listeners.get(sessionId);
      if (sessionListeners) {
        sessionListeners.delete(listener);
        if (sessionListeners.size === 0) {
          this.listeners.delete(sessionId);
        }
      }
    };
  }

  emit(sessionId: string, event: SessionEvent) {
    const sessionListeners = this.listeners.get(sessionId);
    if (sessionListeners) {
      sessionListeners.forEach(listener => listener(event));
    }
  }
}

// Global singleton for development (might reset on HMR in dev, but works for the session duration)
const globalForSessionEvents = global as unknown as { sessionEventManager: SessionEventManager };
export const sessionEventManager = globalForSessionEvents.sessionEventManager || new SessionEventManager();

if (process.env.NODE_ENV !== 'production') {
  globalForSessionEvents.sessionEventManager = sessionEventManager;
}

export default sessionEventManager;
