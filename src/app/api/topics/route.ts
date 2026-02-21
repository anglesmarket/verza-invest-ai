import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import { siteEventManager } from '@/lib/siteEvents';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { en, flashcard } = await req.json();

    if (!en || !flashcard) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const lastTopic = await Topic.findOne({}, {}, { sort: { 'id' : -1 } });
    const newId = (lastTopic?.id || 0) + 1;

    const newTopic = await Topic.create({
      id: newId,
      en,
      flashcard,
      status: "pending",
      submittedBy: (session.user as any).id,
    });

    // Inform any listening clients that site metadata changed
    try { siteEventManager.emit({ type: 'refresh', data: { reason: 'topic:create', topicId: newTopic.id } }); } catch (e) { console.warn('siteEvent emit failed', e); }

    return NextResponse.json(newTopic, { status: 201 });

  } catch (error: any) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ error: "Failed to suggest topic" }, { status: 500 });
  }
}
