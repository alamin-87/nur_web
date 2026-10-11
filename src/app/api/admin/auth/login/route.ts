import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import {
  verifyPassword,
  signSessionToken,
  logActivity,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Admin login is unavailable without a connected database." },
        { status: 503 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signSessionToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });
    user.lastLogin = new Date();
    await user.save();
    await logActivity({
      action: "USER_LOGIN",
      entity: "User",
      entityId: String(user._id),
      details: "Administrator signed in",
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Admin login is temporarily unavailable." },
      { status: 503 }
    );
  }
}
