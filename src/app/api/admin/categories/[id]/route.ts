import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Category, SubCategory, type ICategory } from "@/lib/models";
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
    if (body.name) updateData.name = String(body.name).trim();
    if (body.slug) {
      updateData.slug = String(body.slug)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.image !== undefined) updateData.image = body.image ? String(body.image).trim() : undefined;
    if (body.order !== undefined) updateData.order = Number(body.order);

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true }).lean<ICategory | null>();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await logActivity({
      action: "CATEGORY_UPDATE",
      entity: "Category",
      entityId: String(category._id),
      details: `Updated category "${category.name}"`,
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
    console.error("Update category error:", err);
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
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const category = await Category.findByIdAndDelete(id).lean<ICategory | null>();
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Also delete associated subcategories
    await SubCategory.deleteMany({ category: id });

    await logActivity({
      action: "CATEGORY_DELETE",
      entity: "Category",
      entityId: id,
      details: `Deleted category "${category.name}"`,
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

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (err: unknown) {
    console.error("Delete category error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete category" },
      { status: 500 }
    );
  }
}
