import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { SubCategory, Category, type ICategory } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const filter: Record<string, unknown> = {};
    if (categoryId) {
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        filter.category = new mongoose.Types.ObjectId(categoryId);
      } else {
        const parentCat = await Category.findOne({
          $or: [{ slug: categoryId }, { _id: categoryId }],
        }).lean<ICategory | null>();
        if (parentCat) {
          filter.$or = [
            { category: parentCat._id },
            { category: String(parentCat._id) },
            { category: parentCat.slug },
          ];
        } else {
          filter.category = categoryId;
        }
      }
    }

    const subcategories = await SubCategory.find(filter)
      .populate("category", "name slug")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ subcategories });
  } catch (err: unknown) {
    console.error("Fetch subcategories error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load subcategories" },
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
    const { name, slug, category, description, order } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Name and parent Category are required" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let genSlug =
      (slug || name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (!genSlug) genSlug = `sub-${Date.now()}`;

    const exists = await SubCategory.findOne({ slug: genSlug });
    if (exists) {
      genSlug = `${genSlug}-${Date.now().toString().slice(-4)}`;
    }

    let categoryRef: mongoose.Types.ObjectId | string = category;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryRef = new mongoose.Types.ObjectId(category);
    } else {
      const foundCat = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
      });
      if (foundCat) categoryRef = foundCat._id;
    }

    const sub = await SubCategory.create({
      name: String(name).trim(),
      slug: genSlug,
      category: categoryRef,
      description: description ? String(description).trim() : "",
      order: Number(order) || 0,
      published: true,
    });

    await logActivity({
      action: "CATEGORY_CREATE",
      entity: "SubCategory",
      entityId: String(sub._id),
      details: `Created sub-category "${sub.name}"`,
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
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
      revalidatePath("/api/subcategories");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, subcategory: sub });
  } catch (err: unknown) {
    console.error("Create subcategory error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
