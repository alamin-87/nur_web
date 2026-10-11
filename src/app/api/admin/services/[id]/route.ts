import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
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

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (body.title) service.title = body.title;
    if (body.slug) service.slug = body.slug.trim().toLowerCase();
    if (body.shortDescription !== undefined) service.shortDescription = body.shortDescription;
    if (body.description !== undefined) service.description = body.description;
    if (body.image) service.image = body.image;
    if (body.order !== undefined) service.order = Number(body.order);
    if (body.featured !== undefined) service.featured = Boolean(body.featured);
    if (body.published !== undefined) service.published = Boolean(body.published);

    await service.save();

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/services");
    if (service.slug) revalidatePath(`/services/${service.slug}`);
    revalidatePath("/use-cases");

    await logActivity({
      action: "SERVICE_UPDATE",
      entity: "Service",
      entityId: id,
      details: `Updated service "${service.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (err) {
    console.error("Update service error:", err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
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
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/use-cases");

    await logActivity({
      action: "SERVICE_DELETE",
      entity: "Service",
      entityId: id,
      details: `Deleted service "${service.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "Service deleted" });
  } catch (err) {
    console.error("Delete service error:", err);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
