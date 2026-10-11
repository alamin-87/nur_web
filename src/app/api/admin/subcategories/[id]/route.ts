import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { SubCategory, Category, type ISubCategory } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name) updateData.name = String(body.name).trim();
    if (body.slug) {
      updateData.slug = String(body.slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (body.category) {
      if (mongoose.Types.ObjectId.isValid(body.category)) {
        updateData.category = new mongoose.Types.ObjectId(body.category);
      } else {
        const foundCat = await Category.findOne({
          $or: [{ slug: body.category }, { name: body.category }],
        });
        if (foundCat) updateData.category = foundCat._id;
      }
    }
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.order !== undefined) updateData.order = Number(body.order);
    if (body.published !== undefined) updateData.published = Boolean(body.published);

    const sub = await SubCategory.findByIdAndUpdate(id, updateData, { new: true }).lean<ISubCategory | null>();
    if (!sub) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }

    await logActivity({
      action: "CATEGORY_UPDATE",
      entity: "SubCategory",
      entityId: id,
      details: `Updated sub-category "${sub.name}"`,
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
    console.error("Update subcategory error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const sub = await SubCategory.findByIdAndDelete(id).lean<ISubCategory | null>();
    if (!sub) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }

    await logActivity({
      action: "CATEGORY_DELETE",
      entity: "SubCategory",
      entityId: id,
      details: `Deleted sub-category "${sub.name}"`,
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

    return NextResponse.json({ success: true, message: "Subcategory deleted" });
  } catch (err: unknown) {
    console.error("Delete subcategory error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
