import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Brand } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const brands = await Brand.find().sort({ order: 1, name: 1 }).lean();
    return NextResponse.json({ brands });
  } catch (err: unknown) {
    console.error("Get brands error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let slug = (body.slug || body.name || "brand")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) slug = `brand-${Date.now()}`;

    const existing = await Brand.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const brand = await Brand.create({
      name: String(body.name).trim(),
      slug,
      logo: body.logo ? String(body.logo).trim() : "",
      description: body.description ? String(body.description).trim() : "",
      order: Number(body.order) || 0,
      active: body.active !== false,
    });

    await logActivity({
      action: "BRAND_CREATE",
      entity: "Brand",
      entityId: String(brand._id),
      details: `Created brand "${brand.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/admin/brands");
      revalidatePath("/admin/products");
    } catch {
      // ignore revalidation error
    }

    return NextResponse.json({ success: true, brand });
  } catch (err: unknown) {
    console.error("Create brand error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create brand" },
      { status: 500 }
    );
  }
}
