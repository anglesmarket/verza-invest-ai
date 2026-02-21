import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import { siteEventManager } from '@/lib/siteEvents';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const userRoles: string[] = (session?.user as any)?.roles || [];
    if (!session || (!userRoles.includes('admin') && !userRoles.includes('moderator'))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const topics = await Topic.find({}).sort({ status: 1, createdAt: -1 }).lean();

    return NextResponse.json(topics, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching all topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const patchRoles: string[] = (session?.user as any)?.roles || [];
    if (!session || (!patchRoles.includes('admin') && !patchRoles.includes('moderator'))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    let updateObj: any = {};
    if (status) updateObj.status = status;
    if (isActive !== undefined) {
      // If we're setting a topic as active, unset all others
      if (isActive) {
        await Topic.updateMany({}, { $set: { isActive: false } });
      }
      updateObj.isActive = isActive;
    }

    const updatedTopic = await Topic.findOneAndUpdate(
      { id: Number(id) },
      { $set: updateObj },
      { new: true }
    ).lean();

    if (!updatedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    try { siteEventManager.emit({ type: 'refresh', data: { reason: 'topic:update', topicId: updatedTopic.id } }); } catch (e) { console.warn('siteEvent emit failed', e); }

    return NextResponse.json(updatedTopic, { status: 200 });

  } catch (error: any) {
    console.error("Error updating topic:", error);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const delRoles: string[] = (session?.user as any)?.roles || [];
    if (!session || (!delRoles.includes('admin') && !delRoles.includes('moderator'))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
    }

    await connectDB();

    const deletedTopic = await Topic.findOneAndDelete({ id: Number(id) });

    if (!deletedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    try { siteEventManager.emit({ type: 'refresh', data: { reason: 'topic:delete', topicId: Number(id) } }); } catch (e) { console.warn('siteEvent emit failed', e); }

    return NextResponse.json({ message: "Topic deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting topic:", error);
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}
