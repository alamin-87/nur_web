import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Brand, type IBrand } from "@/lib/models";
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
    if (body.logo !== undefined) updateData.logo = String(body.logo).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.order !== undefined) updateData.order = Number(body.order);
    if (body.active !== undefined) updateData.active = Boolean(body.active);

    const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true }).lean<IBrand | null>();

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    await logActivity({
      action: "BRAND_UPDATE",
      entity: "Brand",
      entityId: String(brand._id),
      details: `Updated brand "${brand.name}"`,
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
    console.error("Update brand error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update brand" },
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

    const brand = await Brand.findByIdAndDelete(id).lean<IBrand | null>();
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    await logActivity({
      action: "BRAND_DELETE",
      entity: "Brand",
      entityId: id,
      details: `Deleted brand "${brand.name}"`,
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

    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (err: unknown) {
    console.error("Delete brand error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete brand" },
      { status: 500 }
    );
  }
}
