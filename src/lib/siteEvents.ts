type SiteEvent = { type: string; data?: any };
type Listener = (event: SiteEvent) => void;

class SiteEventManager {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: SiteEvent) {
    this.listeners.forEach((l) => {
      try {
        l(event);
      } catch (err) {
        console.error('siteEvent listener error:', err);
      }
    });
  }
}

const globalForSiteEvents = global as unknown as { siteEventManager?: SiteEventManager };
export const siteEventManager = globalForSiteEvents.siteEventManager || new SiteEventManager();
if (process.env.NODE_ENV !== 'production') globalForSiteEvents.siteEventManager = siteEventManager;

export default siteEventManager;
