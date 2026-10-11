import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DownloadFile } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { isAllowedDownloadFile, storeDownloadBuffer } from "@/lib/download-storage";

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

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = new URL(req.url).searchParams.get("kind");
  const db = await connectDB();
  if (!db) return NextResponse.json({ error: "Database connection failed" }, { status: 500 });

  const filter: Record<string, unknown> = {};
  if (kind === "catalogue" || kind === "manual") filter.kind = kind;

  const items = await DownloadFile.find(filter).sort({ order: 1, createdAt: -1 }).lean<Array<{
    _id: unknown;
    kind?: string;
    title?: string;
    filename?: string;
    mimeType?: string;
    size?: number;
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }>>();
  return NextResponse.json({ items: items.map((doc) => serialize(doc)) });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot upload" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const title = String(formData.get("title") || "").trim();
    const kindRaw = String(formData.get("kind") || "").trim();
    const file = formData.get("file") as File | null;
    const order = Number(formData.get("order") || 0);

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (kindRaw !== "catalogue" && kindRaw !== "manual") {
      return NextResponse.json({ error: "Invalid download type" }, { status: 400 });
    }
    if (!file) return NextResponse.json({ error: "A PDF file is required" }, { status: 400 });
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

    const item = await DownloadFile.create({
      kind: kindRaw,
      title,
      filename: file.name,
      mimeType: file.type || "application/pdf",
      size: stored.size || file.size,
      gridFsId: stored.id,
      order: Number.isFinite(order) ? order : 0,
    });

    await logActivity({
      action: "DOWNLOAD_CREATE",
      entity: "DownloadFile",
      entityId: String(item._id),
      details: `Uploaded ${kindRaw} "${title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, item: serialize(item) });
  } catch (err) {
    console.error("Create download error:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
