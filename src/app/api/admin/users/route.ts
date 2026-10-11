import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import {
  getCurrentAdminUser,
  hashPassword,
  logActivity,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database is unavailable" }, { status: 503 });
    }
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: 1 })
      .lean();
    return NextResponse.json(
      { users },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json({ error: "Unable to load users" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Administrator permissions required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password, role, active } = body;
    if (!name || !String(name).trim() || !email || !String(email).trim() || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash,
      role: role || "admin",
      active: active !== undefined ? Boolean(active) : true,
    });

    await logActivity({
      action: "USER_CREATE",
      entity: "User",
      entityId: String(user._id),
      details: `Created user "${user.name}" (${user.email}) with role ${user.role}`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
      },
    });
  } catch (err: unknown) {
    console.error("Create user error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create user" },
      { status: 500 }
    );
  }
}
