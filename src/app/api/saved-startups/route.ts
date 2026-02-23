import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SavedStartup from "@/models/SavedStartup";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";

export const dynamic = "force-dynamic";

// GET /api/saved-startups?startupId=xxx — Check if a startup is saved
// GET /api/saved-startups — List all saved startups for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ saved: false }, { status: 200 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const startupId = req.nextUrl.searchParams.get("startupId");

    if (startupId) {
      const exists = await SavedStartup.findOne({ userId, startupId }).lean();
      return NextResponse.json({ saved: !!exists }, { status: 200 });
    }

    // List all saved
    const saved = await SavedStartup.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      savedStartups: saved.map((s: any) => ({
        id: s._id.toString(),
        startupId: s.startupId.toString(),
        createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching saved startups:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST /api/saved-startups — Toggle save/unsave a startup
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const { startupId } = await req.json();

    if (!startupId) {
      return NextResponse.json({ error: "startupId is required" }, { status: 400 });
    }

    // Toggle: if already saved, remove; otherwise, add
    const existing = await SavedStartup.findOne({ userId, startupId });

    if (existing) {
      await SavedStartup.deleteOne({ _id: existing._id });
      return NextResponse.json({ saved: false, message: "Startup unsaved" }, { status: 200 });
    }

    await SavedStartup.create({ userId, startupId });
    return NextResponse.json({ saved: true, message: "Startup saved" }, { status: 201 });
  } catch (error: any) {
    console.error("Error toggling saved startup:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
