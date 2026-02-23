import { NextRequest, NextResponse } from "next/server";
import { sessionEventManager } from "@/lib/sessionEvents";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = id;
  
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // send an initial comment immediately so headers are flushed and clients' onopen fires
  try {
    writer.write(encoder.encode(': connected\n\n'));
  } catch (err) {
    console.error('SSE initial ping failed', err);
  }

  // Keep-alive interval (15s)
  const keepAlive = setInterval(() => {
    writer.write(encoder.encode(': keep-alive\n\n'));
  }, 15000);

  // Define listener
  const listener = (event: any) => {
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    } catch (err) {
      console.error("SSE writer error:", err);
    }
  };

  // Subscribe
  const unsubscribe = sessionEventManager.subscribe(sessionId, listener);

  // Close connection logic
  req.signal.onabort = () => {
    console.log(`SSE connection aborted for session: ${sessionId}`);
    clearInterval(keepAlive);
    unsubscribe();
    writer.close();
  };

  return new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
