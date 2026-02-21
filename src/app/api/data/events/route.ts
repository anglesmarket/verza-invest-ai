import { NextRequest, NextResponse } from 'next/server';
import { siteEventManager } from '@/lib/siteEvents';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // send an initial comment immediately so headers are flushed and clients' onopen fires
  try {
    writer.write(encoder.encode(': connected\n\n'));
  } catch (err) {
    console.error('SSE initial ping failed', err);
  }

  // keep-alive comment lines (client relies on this to detect an active SSE)
  const keepAlive = setInterval(() => {
    try {
      writer.write(encoder.encode(': keep-alive\n\n'));
    } catch (err) {
      console.error('SSE keepAlive write failed', err);
    }
  }, 15000);

  // subscribe to site events
  const listener = (event: any) => {
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    } catch (err) {
      console.error('SSE writer error:', err);
    }
  };

  const unsubscribe = siteEventManager.subscribe(listener);

  req.signal.onabort = () => {
    clearInterval(keepAlive);
    unsubscribe();
    try { writer.close(); } catch (e) { /* ignore */ }
  };

  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
