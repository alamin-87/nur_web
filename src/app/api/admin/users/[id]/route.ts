import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, type IUser } from "@/lib/models";
import {
  getCurrentAdminUser,
  hashPassword,
  logActivity,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Administrator permissions required" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = String(body.name).trim();
    if (body.role) updateData.role = body.role;
    if (body.active !== undefined) updateData.active = Boolean(body.active);
    if (body.password && String(body.password).trim()) {
      updateData.passwordHash = await hashPassword(String(body.password).trim());
    }

    let updated: IUser | null = null;
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      updated = await User.findByIdAndUpdate(id, updateData, { new: true })
        .select("-passwordHash")
        .lean<IUser | null>();
    }

    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await logActivity({
      action: "USER_UPDATE",
      entity: "User",
      entityId: String(updated._id),
      details: `Updated user "${updated.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: unknown) {
    console.error("Update user error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  try {
    const { id } = await params;
    if (String(admin._id) === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let user = null;
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      user = await User.findById(id);
    }

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.email === "admin@nurengineering.com") {
      return NextResponse.json(
        { error: "Cannot delete primary Super Administrator account" },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(user._id);

    await logActivity({
      action: "USER_DELETE",
      entity: "User",
      entityId: String(user._id),
      details: `Deleted user "${user.name}" (${user.email})`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (err: unknown) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
