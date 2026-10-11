import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { mockServices } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (db) {
      const services = await Service.find()
        .sort({ order: 1, createdAt: -1 })
        .lean();
      return NextResponse.json({ services });
    }
  } catch (err) {
    console.warn("Get admin services DB error, using fallback:", err);
  }

  return NextResponse.json({ services: mockServices });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: "Service title is required" }, { status: 400 });
    }

    await connectDB();

    const slug = (body.slug || body.title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const service = await Service.create({
      title: body.title,
      slug,
      shortDescription: body.shortDescription || "",
      description: body.description || "",
      image: body.image || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80",
      features: body.features || [],
      order: Number(body.order) || 0,
      featured: Boolean(body.featured),
      published: true,
    });

    await logActivity({
      action: "SERVICE_CREATE",
      entity: "Service",
      entityId: String(service._id),
      details: `Created service "${service.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/services");
    if (service.slug) revalidatePath(`/services/${service.slug}`);
    revalidatePath("/use-cases");

    return NextResponse.json({ success: true, service });
  } catch (err) {
    console.error("Create service error:", err);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
