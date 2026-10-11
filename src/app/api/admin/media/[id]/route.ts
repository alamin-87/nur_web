import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { connectDB } from "@/lib/db";
import { MediaItem } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

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
    await connectDB();

    const item = await MediaItem.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ error: "Media item not found" }, { status: 404 });

    // Attempt to unlink file if in /public/uploads
    if (item.url?.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", item.url);
      try {
        await fs.unlink(filePath);
      } catch {
        // file might have been moved or already deleted
      }
    }

    await logActivity({
      action: "MEDIA_DELETE",
      entity: "MediaItem",
      entityId: id,
      details: `Deleted media file "${item.filename}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "Media item deleted" });
  } catch (err) {
    console.error("Delete media error:", err);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
