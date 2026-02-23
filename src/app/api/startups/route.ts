import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";
import Investment from "@/models/Investment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";
import { moderateStartupContent } from "@/lib/moderation";

export const dynamic = "force-dynamic";

// GET /api/startups - List startups with optional filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry") || "";
    const owner = searchParams.get("owner") || "";
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || "approved";
    const viewAll = searchParams.get("viewAll") === "true";

    // Build query
    const query: any = { status };

    // Admin "View All" mode: show all startups regardless of status
    if (viewAll) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const roles = (session.user as any).roles || [];
      if (!roles.includes("admin")) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
      delete query.status; // admin sees all statuses
    }

    // If owner=me, get current user's startups regardless of status
    if (owner === "me") {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      query.owner = (session.user as any).id;
      delete query.status; // show all statuses for owner
    }

    if (search) {
      query.$or = [
        { "basicInfo.name.en": { $regex: search, $options: "i" } },
        { "basicInfo.name.fa": { $regex: search, $options: "i" } },
        { "basicInfo.tagline.en": { $regex: search, $options: "i" } },
        { "basicInfo.tagline.fa": { $regex: search, $options: "i" } },
      ];
    }

    if (industry && industry !== "All") {
      query["basicInfo.industry"] = industry;
    }

    const startups = await Startup.find(query)
      .populate("owner", "name image")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get investor counts for each startup
    const startupIds = startups.map((s: any) => s._id);
    const investorCounts = await Investment.aggregate([
      { $match: { startup: { $in: startupIds }, status: "confirmed" } },
      { $group: { _id: "$startup", count: { $sum: 1 }, totalRaised: { $sum: "$amount" } } },
    ]);

    const countsMap = new Map(
      investorCounts.map((c: any) => [c._id.toString(), { count: c.count, totalRaised: c.totalRaised }])
    );

    // Transform for frontend
    const transformed = startups.map((s: any) => {
      const investorData = countsMap.get(s._id.toString()) || { count: 0, totalRaised: 0 };
      return {
        _id: s._id.toString(),
        id: s._id.toString(),
        logo: s.basicInfo?.logo || "",
        name: s.basicInfo?.name?.en || s.basicInfo?.name?.fa || "Unnamed",
        tagline: s.basicInfo?.tagline?.en || s.basicInfo?.tagline?.fa || "",
        industry: s.basicInfo?.industry || "Other",
        location: s.basicInfo?.location || "",
        fundingGoal: s.funding?.goal || 0,
        fundingRaised: s.funding?.raised || 0,
        investorCount: investorData.count || s.metrics?.investorInterest || 0,
        description: s.pitch?.problem?.en || s.pitch?.solution?.en || "",
        founded: s.basicInfo?.foundedDate
          ? new Date(s.basicInfo.foundedDate).getFullYear().toString()
          : "",
        teamSize: s.team?.teamSize || 0,
        website: s.basicInfo?.website || "",
        stage: s.funding?.stage || "",
        status: s.status,
        owner: s.owner,
        createdAt: s.createdAt,
      };
    });

    // Get unique industries for filter
    const industries = await Startup.distinct("basicInfo.industry", { status: "approved" });

    return NextResponse.json({ startups: transformed, industries }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching startups:", error);
    return NextResponse.json({ error: "Failed to fetch startups" }, { status: 500 });
  }
}

// POST /api/startups - Create a new startup
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.roles?.includes("entrepreneur") && !user.roles?.includes("admin")) {
      return NextResponse.json({ error: "Only entrepreneurs can create startups" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    // Run Gemini AI moderation on the content
    const moderation = await moderateStartupContent({
      name: body.name || "",
      tagline: body.tagline || "",
      problem: body.problem,
      solution: body.solution,
      valueProposition: body.valueProposition,
      businessModel: body.businessModel,
      industry: body.industry,
    });

    // Determine initial status based on moderation
    // score >= 81: auto-approve (clean content)
    // score 61-80: pending (minor issues, needs review)
    // score < 61: rejected (inappropriate content)
    let initialStatus = "pending";
    if (moderation.score >= 81) {
      initialStatus = "approved";
    } else if (moderation.score < 61) {
      initialStatus = "rejected";
    }

    const startup = await Startup.create({
      owner: user.id,
      status: initialStatus,
      basicInfo: {
        name: { en: body.name, fa: body.nameFa || "" },
        tagline: { en: body.tagline, fa: body.taglineFa || "" },
        logo: body.logo || "",
        industry: body.industry || "Other",
        location: body.location || "",
        foundedDate: body.foundedDate ? new Date(body.foundedDate) : new Date(),
        website: body.website || "",
      },
      pitch: {
        problem: { en: body.problem || "", fa: "" },
        solution: { en: body.solution || "", fa: "" },
        valueProposition: { en: body.valueProposition || "", fa: "" },
        businessModel: { en: body.businessModel || "", fa: "" },
      },
      team: {
        teamSize: body.teamSize || 1,
      },
      funding: {
        goal: body.fundingGoal || 100000,
        raised: 0,
        stage: body.stage || "seed",
        minimumInvestment: body.minimumInvestment || 1000,
      },
      moderation: {
        score: moderation.score,
        flags: moderation.flags,
        reason: moderation.reason,
        moderatedAt: new Date(),
      },
      ...(initialStatus === "rejected" ? { rejectionReason: moderation.reason } : {}),
      ...(initialStatus === "approved" ? { approvedAt: new Date() } : {}),
    });

    return NextResponse.json({
      startup,
      message: initialStatus === "approved"
        ? "Startup created and auto-approved!"
        : initialStatus === "rejected"
        ? "Startup flagged by moderation: " + moderation.reason
        : "Startup created and pending review",
      moderation: {
        score: moderation.score,
        status: initialStatus,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating startup:", error);
    return NextResponse.json({ error: "Failed to create startup" }, { status: 500 });
  }
}
