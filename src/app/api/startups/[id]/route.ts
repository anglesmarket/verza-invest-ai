import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";
import Investment from "@/models/Investment";

export const dynamic = "force-dynamic";

// GET /api/startups/[id] - Get single startup detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const startup = await Startup.findById(params.id)
      .populate("owner", "name image")
      .lean();

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    // Get investment stats
    const investmentStats = await Investment.aggregate([
      { $match: { startup: startup._id, status: "confirmed" } },
      {
        $group: {
          _id: null,
          totalInvestors: { $sum: 1 },
          totalRaised: { $sum: "$amount" },
        },
      },
    ]);

    const stats = investmentStats[0] || { totalInvestors: 0, totalRaised: 0 };

    // Get recent investors
    const recentInvestors = await Investment.find({
      startup: startup._id,
      status: "confirmed",
    })
      .populate("investor", "name image")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Increment view count
    await Startup.findByIdAndUpdate(params.id, {
      $inc: { "metrics.viewCount": 1 },
    });

    const s = startup as any;

    const transformed = {
      _id: s._id.toString(),
      id: s._id.toString(),
      logo: s.basicInfo?.logo || "",
      name: s.basicInfo?.name?.en || s.basicInfo?.name?.fa || "Unnamed",
      tagline: s.basicInfo?.tagline?.en || s.basicInfo?.tagline?.fa || "",
      industry: s.basicInfo?.industry || "Other",
      location: s.basicInfo?.location || "",
      fundingGoal: s.funding?.goal || 0,
      fundingRaised: s.funding?.raised || 0,
      investorCount: stats.totalInvestors || s.metrics?.investorInterest || 0,
      description: s.pitch?.problem?.en || s.pitch?.solution?.en || "",
      solution: s.pitch?.solution?.en || "",
      valueProposition: s.pitch?.valueProposition?.en || "",
      businessModel: s.pitch?.businessModel?.en || "",
      founded: s.basicInfo?.foundedDate
        ? new Date(s.basicInfo.foundedDate).getFullYear().toString()
        : "",
      teamSize: s.team?.teamSize || 0,
      founders: s.team?.founders || [],
      website: s.basicInfo?.website || "",
      socialLinks: s.basicInfo?.socialLinks || {},
      stage: s.funding?.stage || "",
      minimumInvestment: s.funding?.minimumInvestment || 1000,
      status: s.status,
      owner: s.owner,
      viewCount: s.metrics?.viewCount || 0,
      createdAt: s.createdAt,
      recentInvestors: recentInvestors.map((inv: any) => ({
        name: inv.investor?.name || "Anonymous",
        image: inv.investor?.image || "",
        amount: inv.amount,
        date: inv.createdAt,
      })),
    };

    return NextResponse.json(transformed, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching startup:", error);
    return NextResponse.json({ error: "Failed to fetch startup" }, { status: 500 });
  }
}
