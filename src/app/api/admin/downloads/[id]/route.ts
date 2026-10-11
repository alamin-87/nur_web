import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DownloadFile } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  deleteDownloadBuffer,
  isAllowedDownloadFile,
  storeDownloadBuffer,
} from "@/lib/download-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

function serialize(doc: {
  _id: unknown;
  kind?: string;
  title?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    _id: String(doc._id),
    kind: doc.kind,
    title: doc.title,
    filename: doc.filename,
    mimeType: doc.mimeType,
    size: doc.size,
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    downloadUrl: `/api/downloads/${String(doc._id)}/file`,
  };
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await connectDB();
    const item = await DownloadFile.findById(id);
    if (!item) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const formData = await req.formData();
    const title = String(formData.get("title") || "").trim();
    const order = formData.get("order");
    const file = formData.get("file") as File | null;

    if (title) item.title = title;
    if (order !== null && order !== undefined && String(order) !== "") {
      item.order = Number(order) || 0;
    }

    if (file && file.size > 0) {
      if (!isAllowedDownloadFile(file)) {
        return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: "File size exceeds 4MB upload limit. Please upload a smaller PDF." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await storeDownloadBuffer({
        filename: file.name,
        mimeType: file.type || "application/pdf",
        buffer,
      });
      if (!stored) {
        return NextResponse.json({ error: "Failed to store file" }, { status: 500 });
      }
      await deleteDownloadBuffer(item.gridFsId);
      item.filename = file.name;
      item.mimeType = file.type || "application/pdf";
      item.size = stored.size || file.size;
      item.gridFsId = stored.id;
    }

    await item.save();

    await logActivity({
      action: "DOWNLOAD_UPDATE",
      entity: "DownloadFile",
      entityId: id,
      details: `Updated ${item.kind} "${item.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, item: serialize(item) });
  } catch (err) {
    console.error("Update download error:", err);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await connectDB();
    const item = await DownloadFile.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ error: "File not found" }, { status: 404 });
    await deleteDownloadBuffer(item.gridFsId);

    await logActivity({
      action: "DOWNLOAD_DELETE",
      entity: "DownloadFile",
      entityId: id,
      details: `Deleted ${item.kind} "${item.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete download error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
