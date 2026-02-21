import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Investment from "@/models/Investment";
import Startup from "@/models/Startup";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import { siteEventManager } from '@/lib/siteEvents';

export const dynamic = "force-dynamic";

// GET /api/investments - Get current user's investments + portfolio stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    // Get all confirmed investments for this user
    const investments = await Investment.find({
      investor: userId,
      status: "confirmed",
    })
      .populate({
        path: "startup",
        select: "basicInfo funding status",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform investments for frontend
    const transformedInvestments = investments.map((inv: any) => {
      const s = inv.startup;
      return {
        id: inv._id.toString(),
        startupId: s?._id?.toString() || "",
        name: s?.basicInfo?.name?.en || s?.basicInfo?.name?.fa || "Unknown Startup",
        industry: s?.basicInfo?.industry || "Other",
        invested: inv.amount,
        currentValue: inv.amount, // In a real system you'd track valuation changes
        change: 0,
        status: inv.status,
        date: inv.createdAt,
      };
    });

    // Calculate portfolio stats
    const totalInvested = transformedInvestments.reduce((sum: number, inv: any) => sum + inv.invested, 0);
    const currentValue = transformedInvestments.reduce((sum: number, inv: any) => sum + inv.currentValue, 0);
    const totalReturns = currentValue - totalInvested;
    const returnsPercent = totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0;

    // Get recent activity (recent investments)
    const recentActivity = investments.slice(0, 5).map((inv: any) => {
      const s = inv.startup;
      const name = s?.basicInfo?.name?.en || s?.basicInfo?.name?.fa || "Unknown";
      const timeAgo = getTimeAgo(new Date(inv.createdAt));
      return {
        text: `Invested $${inv.amount.toLocaleString()} in ${name}`,
        time: timeAgo,
      };
    });

    return NextResponse.json({
      portfolio: {
        totalInvested,
        currentValue,
        totalReturns,
        returnsPercent: Math.round(returnsPercent * 10) / 10,
        activeInvestments: transformedInvestments.length,
      },
      investments: transformedInvestments,
      recentActivity,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching investments:", error);
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 });
  }
}

// POST /api/investments - Create an investment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const body = await req.json();

    const { startupId, amount, message } = body;

    if (!startupId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Verify startup exists and is approved
    const startup = await Startup.findById(startupId);
    if (!startup || startup.status !== "approved") {
      return NextResponse.json({ error: "Startup not available for investment" }, { status: 404 });
    }

    if (amount < startup.funding.minimumInvestment) {
      return NextResponse.json(
        { error: `Minimum investment is $${startup.funding.minimumInvestment}` },
        { status: 400 }
      );
    }

    // Create the investment
    const investment = await Investment.create({
      investor: userId,
      startup: startupId,
      amount,
      status: "confirmed",
      message: message || "",
      confirmedAt: new Date(),
    });

    // Update the startup's raised amount
    await Startup.findByIdAndUpdate(startupId, {
      $inc: {
        "funding.raised": amount,
        "metrics.investorInterest": 1,
      },
    });

    // Notify global listeners (portfolio changed)
    try { siteEventManager.emit({ type: 'refresh', data: { reason: 'investment:create', investor: userId } }); } catch (e) { console.warn('siteEvent emit failed', e); }

    return NextResponse.json({ investment, message: "Investment successful" }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating investment:", error);
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 });
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
}
