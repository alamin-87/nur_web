import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Category, Product } from "@/lib/models";
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

    const categories = await Category.find({ type: "product" })
      .sort({ order: 1, name: 1 })
      .lean();

    // Attach accurate product counts
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          $or: [
            { category: cat._id },
            { category: String(cat._id) },
            { category: cat.slug },
          ],
        });
        return { ...cat, productCount: count };
      })
    );

    return NextResponse.json({ categories: withCounts });
  } catch (err: unknown) {
    console.error("Get categories error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load categories" },
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
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let slug = (body.slug || body.name || "cat")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) slug = `category-${Date.now()}`;

    const existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await Category.create({
      name: String(body.name).trim(),
      slug,
      description: body.description ? String(body.description).trim() : "",
      image: body.image ? String(body.image).trim() : undefined,
      order: Number(body.order) || 0,
      type: "product",
    });

    await logActivity({
      action: "CATEGORY_CREATE",
      entity: "Category",
      entityId: String(category._id),
      details: `Created category "${category.name}"`,
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
      revalidatePath("/admin/categories");
      revalidatePath("/admin/products");
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
    } catch {
      // ignore revalidation error
    }

    return NextResponse.json({ success: true, category });
  } catch (err: unknown) {
    console.error("Create category error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const { items } = await req.json(); // Array of { _id, order } for bulk reordering
    if (Array.isArray(items)) {
      const db = await connectDB();
      if (!db) {
        return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
      }

      await Promise.all(
        items.map((item) =>
          Category.findByIdAndUpdate(item._id, { order: Number(item.order) || 0 })
        )
      );

      try {
        revalidatePath("/", "layout");
        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/admin/categories");
        revalidatePath("/api/catalog-tree");
        revalidatePath("/api/products");
      } catch {
        // ignore revalidation error
      }

      return NextResponse.json({ success: true, message: "Reordered categories" });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Reorder categories error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder" },
      { status: 500 }
    );
  }
}
