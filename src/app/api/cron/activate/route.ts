import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/activate
 * Auto-approve pending startups that have been waiting for 30+ minutes
 * and have a moderation score >= 61 (or no moderation score at all).
 *
 * Intended to be called by Vercel Cron every 30 minutes.
 * Protected by CRON_SECRET header.
 */
export async function GET(req: NextRequest) {
  // Verify the cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find and auto-approve pending startups that:
    // 1. Have been pending for at least 30 minutes
    // 2. Have a moderation score >= 61 (safe) or no moderation score (legacy)
    const result = await Startup.updateMany(
      {
        status: "pending",
        createdAt: { $lte: thirtyMinutesAgo },
        $or: [
          { "moderation.score": { $gte: 61 } },
          { "moderation.score": null },
          { "moderation.score": { $exists: false } },
        ],
      },
      {
        $set: {
          status: "approved",
          approvedAt: new Date(),
        },
      }
    );

    console.log(
      `[Cron] Auto-approved ${result.modifiedCount} pending startups`
    );

    return NextResponse.json({
      success: true,
      approved: result.modifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Auto-activation error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
