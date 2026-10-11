import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/lib/models";
import { getCurrentAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const entity = url.searchParams.get("entity");
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10));

  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (entity) filter.entity = entity;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("Get activity logs error:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
