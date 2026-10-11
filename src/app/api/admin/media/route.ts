import { NextResponse } from "next/server";
import path from "path";
import { connectDB } from "@/lib/db";
import { MediaItem } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { uploadMediaBuffer } from "@/lib/cloudinary-media";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
    const type = url.searchParams.get("type");

  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { filename: { $regex: q, $options: "i" } },
      ];
    }
    if (type === "image" || type === "video") {
      filter.mimeType = { $regex: `^${type}/` };
    }

    const items = await MediaItem.find(filter)
      .select("_id title filename url mimeType size width height folder altText createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ items: items || [] });
  } catch (err: unknown) {
    console.error("Get media error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot upload" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || (file ? file.name : "Uploaded Asset");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const mimeType = file.type || "image/jpeg";
    if (!mimeType.startsWith("image/") && !mimeType.startsWith("video/")) {
      return NextResponse.json({ error: "Only image and video files are allowed." }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Media file exceeds the 50MB upload limit." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || (mimeType.startsWith("video/") ? ".mp4" : ".jpg");
    const cleanName = path
      .basename(file.name, ext)
      .replace(/[^\w-]/g, "")
      .toLowerCase();
    const filename = `${cleanName || "asset"}-${Date.now()}${ext}`;

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const uploaded = await uploadMediaBuffer(buffer, mimeType);
    const createdItem = await MediaItem.create({
      title,
      filename,
      url: uploaded.url,
      mimeType,
      size: uploaded.bytes,
      folder: "general",
    });

    await logActivity({
      action: "MEDIA_UPLOAD",
      entity: "MediaItem",
      entityId: String(createdItem._id),
      details: `Uploaded media file "${filename}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        _id: String(createdItem._id),
        title: createdItem.title,
        filename: createdItem.filename,
        url: createdItem.url,
        mimeType: createdItem.mimeType,
        size: createdItem.size,
        createdAt: createdItem.createdAt,
      },
    });
  } catch (err: unknown) {
    console.error("Media upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}

