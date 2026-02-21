import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authConfig";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const userRoles: string[] = (session?.user as any)?.roles || [];
    if (!session || !userRoles.includes('admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(users, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching all users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const patchRoles: string[] = (session?.user as any)?.roles || [];
    if (!session || !patchRoles.includes('admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, roles } = await req.json();

    if (!id || !roles) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Prevent removing own admin role by accident
    const newRoles: string[] = Array.isArray(roles) ? roles : [roles];
    if ((session.user as any).email && patchRoles.includes('admin')) {
       const userToUpdate = await User.findById(id);
       if (userToUpdate && userToUpdate.email === (session.user as any).email && !newRoles.includes('admin')) {
          return NextResponse.json({ error: "You cannot remove your own admin role." }, { status: 400 });
       }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { roles: newRoles } },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const delRoles: string[] = (session?.user as any)?.roles || [];
    if (!session || !delRoles.includes('admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Prevent deleting self
    const userToDelete = await User.findById(id);
    if (userToDelete && (session.user as any).email && userToDelete.email === (session.user as any).email) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id).lean();

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
