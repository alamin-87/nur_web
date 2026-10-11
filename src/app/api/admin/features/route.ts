import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Feature } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { mockSpecialFeatures } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (db) {
      const features = await Feature.find()
        .sort({ order: 1, createdAt: -1 })
        .lean();
      return NextResponse.json({ features });
    }
  } catch (err) {
    console.warn("Get admin features DB error, using fallback:", err);
  }

  return NextResponse.json({ features: mockSpecialFeatures });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Feature name is required" }, { status: 400 });
    }

    await connectDB();

    const slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const feature = await Feature.create({
      name: body.name,
      slug,
      order: Number(body.order) || 0,
      active: body.active !== false,
    });

    await logActivity({
      action: "FEATURE_CREATE",
      entity: "Feature",
      entityId: String(feature._id),
      details: `Created special feature "${feature.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/");

    return NextResponse.json({ success: true, feature });
  } catch (err) {
    console.error("Create feature error:", err);
    return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
  }
}
