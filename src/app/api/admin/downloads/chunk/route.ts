import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { DownloadFile, DownloadUploadSession } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  CLIENT_CHUNK_SIZE,
  GRIDFS_CHUNK_SIZE,
  MAX_DOWNLOAD_BYTES,
  deleteGridFSFile,
  finalizeGridFSUpload,
  isAllowedDownloadFile,
  isPdfBuffer,
  writeGridFSSubChunks,
} from "@/lib/download-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  const admin = await getCurrentAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  await connectDB();
  const session = await DownloadUploadSession.findOne({ sessionId });
  if (!session) {
    return NextResponse.json({ error: "Upload session not found" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: session.sessionId,
    filename: session.filename,
    totalSize: session.totalSize,
    totalChunks: session.totalChunks,
    uploadedChunks: session.uploadedChunks,
  });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot upload" }, { status: 403 });
  }

  await connectDB();

  const contentType = req.headers.get("content-type") || "";

  // 1. JSON-based actions (start, finish, delete)
  if (contentType.includes("application/json")) {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const action = String(body.action || "").toLowerCase().trim();

    // START ACTION
    if (action === "start") {
      const title = String(body.title || "").trim();
      const kind = String(body.kind || "").trim();
      const filename = String(body.filename || "").trim();
      const totalSize = Number(body.totalSize || 0);
      const totalChunks = Number(body.totalChunks || 0);
      const order = Number(body.order || 0);

      if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      if (kind !== "catalogue" && kind !== "manual") {
        return NextResponse.json({ error: "Invalid download type" }, { status: 400 });
      }
      if (!filename || !isAllowedDownloadFile({ name: filename })) {
        return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
      }
      if (!totalSize || totalSize <= 0) {
        return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
      }
      if (totalSize > MAX_DOWNLOAD_BYTES) {
        return NextResponse.json(
          { error: `File exceeds 50MB limit` },
          { status: 400 }
        );
      }
      if (!totalChunks || totalChunks <= 0) {
        return NextResponse.json({ error: "Invalid chunk count" }, { status: 400 });
      }

      const files_id = new ObjectId();
      const sessionId = `dlsess_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;

      const session = await DownloadUploadSession.create({
        sessionId,
        files_id,
        filename,
        mimeType: "application/pdf",
        totalSize,
        chunkSize: CLIENT_CHUNK_SIZE,
        gridFsChunkSize: GRIDFS_CHUNK_SIZE,
        totalChunks,
        uploadedChunks: [],
        kind,
        title,
        order: Number.isFinite(order) ? order : 0,
        user: {
          _id: String(admin._id),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      });

      return NextResponse.json({
        success: true,
        sessionId: session.sessionId,
        files_id: String(files_id),
        chunkSize: CLIENT_CHUNK_SIZE,
        totalChunks: session.totalChunks,
      });
    }

    // FINISH ACTION
    if (action === "finish") {
      const sessionId = String(body.sessionId || "").trim();
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
      }

      const session = await DownloadUploadSession.findOne({ sessionId });
      if (!session) {
        return NextResponse.json(
          { error: "Upload session expired or not found" },
          { status: 404 }
        );
      }

      // Verify all chunks
      const uploadedSet = new Set(session.uploadedChunks);
      const missing: number[] = [];
      for (let i = 0; i < session.totalChunks; i++) {
        if (!uploadedSet.has(i)) missing.push(i);
      }

      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Incomplete upload: missing chunks [${missing.slice(0, 10).join(", ")}]` },
          { status: 400 }
        );
      }

      // Instant assembly: write GridFS metadata doc in 10ms
      await finalizeGridFSUpload({
        files_id: session.files_id,
        filename: session.filename,
        mimeType: session.mimeType || "application/pdf",
        totalSize: session.totalSize,
        gridFsChunkSize: session.gridFsChunkSize || GRIDFS_CHUNK_SIZE,
      });

      // Create DownloadFile record in DB
      const item = await DownloadFile.create({
        kind: session.kind,
        title: session.title,
        filename: session.filename,
        mimeType: session.mimeType || "application/pdf",
        size: session.totalSize,
        gridFsId: session.files_id,
        order: session.order || 0,
      });

      // Log activity
      await logActivity({
        action: "DOWNLOAD_CREATE",
        entity: "DownloadFile",
        entityId: String(item._id),
        details: `Uploaded ${session.kind} "${session.title}" (50MB Chunk Streaming)`,
        user: {
          _id: String(admin._id),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });

      // Clean up session
      await DownloadUploadSession.deleteOne({ sessionId });

      return NextResponse.json({ success: true, item: serialize(item) });
    }

    // DELETE / CANCEL ACTION
    if (action === "delete") {
      const sessionId = String(body.sessionId || "").trim();
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
      }

      const session = await DownloadUploadSession.findOne({ sessionId });
      if (session) {
        await deleteGridFSFile(session.files_id);
        await DownloadUploadSession.deleteOne({ sessionId });
      }

      return NextResponse.json({ success: true, message: "Upload session deleted" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  // 2. FormData chunk upload: action=upload
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      const action = String(formData.get("action") || "upload").toLowerCase().trim();
      const sessionId = String(formData.get("sessionId") || "").trim();
      const chunkIndex = Number(formData.get("chunkIndex"));
      const chunkFile = formData.get("chunk") as File | Blob | null;

      if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
      }

      const session = await DownloadUploadSession.findOne({ sessionId });
      if (!session) {
        return NextResponse.json(
          { error: "Upload session expired or not found" },
          { status: 404 }
        );
      }

      if (Number.isNaN(chunkIndex) || chunkIndex < 0 || chunkIndex >= session.totalChunks) {
        return NextResponse.json({ error: "Invalid chunkIndex" }, { status: 400 });
      }

      if (!chunkFile) {
        return NextResponse.json({ error: "Chunk data missing" }, { status: 400 });
      }

      const chunkBuffer = Buffer.from(await chunkFile.arrayBuffer());

      // If chunk 0, validate PDF magic bytes %PDF-
      if (chunkIndex === 0) {
        if (!isPdfBuffer(chunkBuffer)) {
          await deleteGridFSFile(session.files_id);
          await DownloadUploadSession.deleteOne({ sessionId });
          return NextResponse.json(
            { error: "Only PDF files allowed" },
            { status: 400 }
          );
        }
      }

      // Write direct GridFS sub-chunks (255KB each)
      await writeGridFSSubChunks({
        files_id: session.files_id,
        clientChunkIndex: chunkIndex,
        chunkBuffer,
        gridFsChunkSize: session.gridFsChunkSize || GRIDFS_CHUNK_SIZE,
      });

      // Update session uploaded chunks
      await DownloadUploadSession.updateOne(
        { sessionId },
        { $addToSet: { uploadedChunks: chunkIndex } }
      );

      return NextResponse.json({
        success: true,
        chunkIndex,
        chunkSize: chunkBuffer.length,
      });
    } catch (err: unknown) {
      console.error("Chunk upload error:", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Chunk upload failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
}
