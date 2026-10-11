import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { BlogCategory } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { mockBlogCategories } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (db) {
      const count = await BlogCategory.countDocuments();
      if (count === 0) {
        for (const m of mockBlogCategories) {
          await BlogCategory.create({
            name: m.name,
            slug: m.slug,
            order: m.order || 0,
            active: true,
          });
        }
      }

      const categories = await BlogCategory.find().sort({ order: 1, name: 1 }).lean();
      return NextResponse.json(
        { categories },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }
  } catch (err) {
    console.error("Get blog categories error:", err);
  }

  return NextResponse.json({ categories: mockBlogCategories });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot create" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let slug = (body.slug || body.name || "category")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) slug = `category-${Date.now()}`;

    const existing = await BlogCategory.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await BlogCategory.create({
      name: String(body.name).trim(),
      slug,
      description: body.description ? String(body.description).trim() : "",
      order: Number(body.order) || 0,
      active: body.active !== undefined ? Boolean(body.active) : true,
    });

    await logActivity({
      action: "BLOG_CATEGORY_CREATE",
      entity: "BlogCategory",
      entityId: String(category._id),
      details: `Created blog category "${category.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/blog");
      revalidatePath("/admin/blogs");
      revalidatePath("/admin/blogs/categories");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, category });
  } catch (err: unknown) {
    console.error("Create blog category error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create category" },
      { status: 500 }
    );
  }
}
