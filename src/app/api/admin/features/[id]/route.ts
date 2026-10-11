import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Feature } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    await connectDB();
    const body = await req.json();

    const feature = await Feature.findById(id);
    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    if (body.name) feature.name = body.name;
    if (body.slug) feature.slug = body.slug.trim().toLowerCase();
    if (body.order !== undefined) feature.order = Number(body.order);
    if (body.active !== undefined) feature.active = Boolean(body.active);

    await feature.save();

    revalidatePath("/", "layout");
    revalidatePath("/");

    await logActivity({
      action: "FEATURE_UPDATE",
      entity: "Feature",
      entityId: id,
      details: `Updated special feature "${feature.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, feature });
  } catch (err) {
    console.error("Update feature error:", err);
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    await connectDB();
    const feature = await Feature.findByIdAndDelete(id);
    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");

    await logActivity({
      action: "FEATURE_DELETE",
      entity: "Feature",
      entityId: id,
      details: `Deleted special feature "${feature.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "Feature deleted" });
  } catch (err) {
    console.error("Delete feature error:", err);
    return NextResponse.json({ error: "Failed to delete feature" }, { status: 500 });
  }
}
