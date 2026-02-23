import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authConfig";

export const dynamic = "force-dynamic";

// GET /api/contacts — List the current user's contacts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    await connectDB();

    const contacts = await Contact.find({ userId: user.id })
      .populate("contactUserId", "name email image roles")
      .populate("startupId", "basicInfo.name basicInfo.logo")
      .sort({ createdAt: -1 })
      .lean();

    const transformed = contacts.map((c: any) => ({
      id: c._id.toString(),
      contactUser: c.contactUserId
        ? {
            id: c.contactUserId._id.toString(),
            name: c.contactUserId.name,
            email: c.contactUserId.email,
            image: c.contactUserId.image || "",
            roles: c.contactUserId.roles || [],
          }
        : null,
      startup: c.startupId
        ? {
            id: c.startupId._id.toString(),
            name: c.startupId.basicInfo?.name?.en || "Unknown",
            logo: c.startupId.basicInfo?.logo || "",
          }
        : null,
      note: c.note || "",
      category: c.category || "other",
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ contacts: transformed }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST /api/contacts — Save a new contact
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json();

    if (!body.contactUserId) {
      return NextResponse.json({ error: "Contact user ID is required" }, { status: 400 });
    }

    if (body.contactUserId === user.id) {
      return NextResponse.json({ error: "You cannot add yourself as a contact" }, { status: 400 });
    }

    await connectDB();

    // Verify the contact user exists
    const contactUser = await User.findById(body.contactUserId).lean();
    if (!contactUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if contact already exists
    const existing = await Contact.findOne({
      userId: user.id,
      contactUserId: body.contactUserId,
    });

    if (existing) {
      return NextResponse.json({ error: "Contact already saved" }, { status: 409 });
    }

    const contact = await Contact.create({
      userId: user.id,
      contactUserId: body.contactUserId,
      startupId: body.startupId || undefined,
      note: body.note || "",
      category: body.category || "other",
    });

    return NextResponse.json({ contact, message: "Contact saved" }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving contact:", error);
    return NextResponse.json({ error: "Failed to save contact" }, { status: 500 });
  }
}

// DELETE /api/contacts — Remove a contact
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("id");

    if (!contactId) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    await connectDB();

    const contact = await Contact.findOneAndDelete({
      _id: contactId,
      userId: user.id, // Ensure ownership
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Contact removed" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting contact:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}

// PATCH /api/contacts — Update a contact's note/category
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    await connectDB();

    const updates: any = {};
    if (body.note !== undefined) updates.note = body.note;
    if (body.category !== undefined) updates.category = body.category;

    const contact = await Contact.findOneAndUpdate(
      { _id: body.id, userId: user.id },
      { $set: updates },
      { new: true }
    );

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ contact, message: "Contact updated" }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating contact:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}
