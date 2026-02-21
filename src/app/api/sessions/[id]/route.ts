import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import User from "@/models/User";
import { sessionEventManager } from "@/lib/sessionEvents";
import { siteEventManager } from '@/lib/siteEvents';

// GET /api/sessions/[id] - Get participants
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const sessionId = params.id;

    const sessionData = await Session.findOne({ sessionId, isActive: true })
      .populate("participants.user", "name _id email image")
      .populate("owner", "name _id email")
      .lean();

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      participants: sessionData.participants.map((p: any) => p.user),
      isPublic: sessionData.isPublic ?? true,
      owner: (sessionData.owner as any)?._id,
      ownerName: (sessionData.owner as any)?.name || "Anonymous Host",
      currentTopicId: sessionData.currentTopicId
    });
  } catch (error) {
    return NextResponse.json({ error: "Fetch participants failed" }, { status: 500 });
  }
}

// POST /api/sessions/[id] - Join session
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isPublic } = await req.json().catch(() => ({ isPublic: true }));
    await connectDB();
    const sessionId = params.id;
    const userId = (userSession.user as any).id;

    let session = await Session.findOne({ sessionId });

    if (!session) {
      // Create session if it doesn't exist
      session = await Session.create({
        sessionId,
        owner: userId,
        isPublic: isPublic ?? true,
        participants: [{ user: userId, joinedAt: new Date() }]
      });

      // Notify global listeners that publicSessions changed
      try { siteEventManager.emit({ type: 'refresh', data: { reason: 'session:create', sessionId } }); } catch (e) { console.warn('siteEvent emit failed', e); }
    } else if (!session.isActive) {
      return NextResponse.json({ error: "Session has closed" }, { status: 404 });
    } else {
      // Add participant if not already in
      const isAlreadyParticipating = session.participants.some(
        (p: any) => p.user.toString() === userId.toString()
      );

      if (!isAlreadyParticipating) {
        session.participants.push({ user: userId, joinedAt: new Date() });
        await session.save();
        
        // Notify new participant
        sessionEventManager.emit(sessionId, { type: 'join', data: { userId } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Join failed error:", error);
    return NextResponse.json({ error: "Join failed" }, { status: 500 });
  }
}

// PATCH /api/sessions/[id] - Update session settings
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isPublic, currentTopicId, isActive } = await req.json();
    await connectDB();
    const sessionId = params.id;
    const userId = (userSession.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID missing from session" }, { status: 400 });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check ownership
    // Allow moderators and higher or the owner to close/update
    const userRoles: string[] = (userSession.user as any).roles || [];
    const isModeratorLevel = userRoles.includes('admin') || userRoles.includes('moderator');
    const sessionOwnerId = session.owner ? session.owner.toString() : null;

    if (sessionOwnerId !== userId.toString() && !isModeratorLevel) {
       return NextResponse.json({ error: "Only the session owner can modify settings" }, { status: 403 });
    }

    if (isPublic !== undefined) session.isPublic = isPublic;
    if (currentTopicId !== undefined) session.currentTopicId = currentTopicId;
    if (isActive !== undefined) session.isActive = isActive;
    
    // Using updateOne if it's just a termination to avoid validation edge cases
    if (isActive === false) {
      await Session.updateOne({ sessionId }, { isActive: false });
    } else {
      await session.save();
    }

    // Trigger SSE based on change (session-level)
    if (currentTopicId !== undefined) {
      sessionEventManager.emit(sessionId, { type: 'update', data: { currentTopicId } });
    }
    if (isActive === false) {
      sessionEventManager.emit(sessionId, { type: 'terminate' });
    }

    // Notify global listeners when session visibility or active state changes
    try {
      if (isPublic !== undefined || isActive !== undefined) {
        siteEventManager.emit({ type: 'refresh', data: { reason: 'session:update', sessionId } });
      }
    } catch (e) { console.warn('siteEvent emit failed', e); }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Session PATCH error:", error);
    return NextResponse.json({ 
      error: "Update failed", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// DELETE /api/sessions/[id] - Leave session
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession?.user) {
       return NextResponse.json({ success: true }); // Silent fail
    }

    await connectDB();
    const sessionId = params.id;
    const userId = (userSession.user as any).id;

    await Session.updateOne(
      { sessionId },
      { $pull: { participants: { user: userId } } }
    );

    // Notify leave
    sessionEventManager.emit(sessionId, { type: 'join', data: { leaverId: userId } }); // Using join type with extra data for leaver handles participants refresh

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Leave failed" }, { status: 500 });
  }
}
