import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { BlogCategory } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.slug !== undefined && String(body.slug).trim()) updateData.slug = String(body.slug).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.order !== undefined) updateData.order = Number(body.order) || 0;
    if (body.active !== undefined) updateData.active = Boolean(body.active);

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await BlogCategory.findByIdAndUpdate(id, updateData, { new: true });
    }
    if (!updated) {
      updated = await BlogCategory.findOneAndUpdate({ slug: id }, updateData, { new: true });
    }

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await logActivity({
      action: "BLOG_CATEGORY_UPDATE",
      entity: "BlogCategory",
      entityId: String(updated._id),
      details: `Updated blog category "${updated.name}"`,
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

    return NextResponse.json({ success: true, category: updated });
  } catch (err: unknown) {
    console.error("Update blog category error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot delete" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let cat = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      cat = await BlogCategory.findByIdAndDelete(id);
    }
    if (!cat) {
      cat = await BlogCategory.findOneAndDelete({ slug: id });
    }

    await logActivity({
      action: "BLOG_CATEGORY_DELETE",
      entity: "BlogCategory",
      entityId: id,
      details: `Deleted blog category "${cat?.name || id}"`,
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

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (err: unknown) {
    console.error("Delete blog category error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete category" },
      { status: 500 }
    );
  }
}
