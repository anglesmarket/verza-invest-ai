import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/models/Startup";
import Investment from "@/models/Investment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";

export const dynamic = "force-dynamic";

// GET /api/startups/[id] - Get single startup detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const startup = await Startup.findById(id)
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
    await Startup.findByIdAndUpdate(id, {
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

// PATCH /api/startups/[id] - Update a startup
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const user = session.user as any;
    const isAdmin = user.roles?.includes("admin");

    const startup = await Startup.findById(id);
    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    // RLS: Only the owner or admin can update
    if (startup.owner.toString() !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: "You can only edit your own startups" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const update: any = {};

    if (body.name !== undefined) update["basicInfo.name.en"] = body.name;
    if (body.tagline !== undefined) update["basicInfo.tagline.en"] = body.tagline;
    if (body.logo !== undefined) update["basicInfo.logo"] = body.logo;
    if (body.industry !== undefined) update["basicInfo.industry"] = body.industry;
    if (body.location !== undefined) update["basicInfo.location"] = body.location;
    if (body.website !== undefined) update["basicInfo.website"] = body.website;
    if (body.foundedDate !== undefined)
      update["basicInfo.foundedDate"] = new Date(body.foundedDate);
    if (body.problem !== undefined) update["pitch.problem.en"] = body.problem;
    if (body.solution !== undefined) update["pitch.solution.en"] = body.solution;
    if (body.valueProposition !== undefined)
      update["pitch.valueProposition.en"] = body.valueProposition;
    if (body.businessModel !== undefined)
      update["pitch.businessModel.en"] = body.businessModel;
    if (body.teamSize !== undefined) update["team.teamSize"] = body.teamSize;
    if (body.fundingGoal !== undefined) update["funding.goal"] = body.fundingGoal;
    if (body.stage !== undefined) update["funding.stage"] = body.stage;
    if (body.minimumInvestment !== undefined)
      update["funding.minimumInvestment"] = body.minimumInvestment;

    // Admin-only: direct status changes
    if (isAdmin && body.status !== undefined) {
      update.status = body.status;
      if (body.status === "approved") {
        update.approvedAt = new Date();
        update.approvedBy = user.id;
      }
      if (body.status === "rejected" && body.rejectionReason) {
        update.rejectionReason = body.rejectionReason;
      }
    }

    // Non-admin users: editing resets to pending for re-approval
    if (!isAdmin && Object.keys(update).length > 0) {
      update.status = "pending";
    }

    const updated = await Startup.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    )
      .populate("owner", "name image")
      .lean();

    const s = updated as any;

    return NextResponse.json({
      startup: {
        _id: s._id.toString(),
        id: s._id.toString(),
        name: s.basicInfo?.name?.en || "",
        tagline: s.basicInfo?.tagline?.en || "",
        logo: s.basicInfo?.logo || "",
        industry: s.basicInfo?.industry || "Other",
        location: s.basicInfo?.location || "",
        website: s.basicInfo?.website || "",
        fundingGoal: s.funding?.goal || 0,
        fundingRaised: s.funding?.raised || 0,
        stage: s.funding?.stage || "",
        status: s.status,
        investorCount: s.metrics?.investorInterest || 0,
        teamSize: s.team?.teamSize || 0,
        description: s.pitch?.problem?.en || "",
        owner: s.owner,
        createdAt: s.createdAt,
      },
      message: "Startup updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating startup:", error);
    return NextResponse.json({ error: "Failed to update startup" }, { status: 500 });
  }
}

// DELETE /api/startups/[id] - Delete a startup
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const user = session.user as any;
    const isAdmin = user.roles?.includes("admin");

    const startup = await Startup.findById(id);
    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    // RLS: Only the owner or admin can delete
    if (startup.owner.toString() !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own startups" },
        { status: 403 }
      );
    }

    // Prevent deletion of funded startups by non-admins
    const confirmedInvestments = await Investment.countDocuments({
      startup: startup._id,
      status: "confirmed",
    });

    if (confirmedInvestments > 0 && !isAdmin) {
      return NextResponse.json(
        { error: "Cannot delete a startup with confirmed investments. Contact admin." },
        { status: 400 }
      );
    }

    await Startup.findByIdAndDelete(id);

    // Cancel any pending investments for this startup
    await Investment.updateMany(
      { startup: startup._id, status: "pending" },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: "Startup deleted",
        },
      }
    );

    return NextResponse.json({ message: "Startup deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting startup:", error);
    return NextResponse.json({ error: "Failed to delete startup" }, { status: 500 });
  }
}
