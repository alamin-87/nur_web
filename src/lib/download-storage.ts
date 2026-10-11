import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

const BUCKET = "download_files";

async function getBucket() {
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) return null;
  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
}

export async function storeDownloadBuffer(params: {
  filename: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<{ id: ObjectId; size: number } | null> {
  const bucket = await getBucket();
  if (!bucket) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(params.filename, {
      contentType: params.mimeType,
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({ id: uploadStream.id as ObjectId, size: params.buffer.length });
    });
    uploadStream.end(params.buffer);
  });
}

export async function deleteDownloadBuffer(id: string | ObjectId | undefined) {
  if (!id) return;
  const bucket = await getBucket();
  if (!bucket) return;
  try {
    await bucket.delete(typeof id === "string" ? new ObjectId(id) : id);
  } catch {
    // File may already be gone
  }
}

export async function readDownloadBuffer(id: string | ObjectId): Promise<{
  buffer: Buffer;
  filename: string;
  mimeType: string;
} | null> {
  const bucket = await getBucket();
  if (!bucket) return null;
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files.length) return null;
  const file = files[0];
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const stream = bucket.openDownloadStream(objectId);
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve());
  });
  return {
    buffer: Buffer.concat(chunks),
    filename: file.filename,
    mimeType: file.contentType || "application/pdf",
  };
}

export function isAllowedDownloadFile(file: File) {
  const name = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();
  const pdf =
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    name.endsWith(".pdf");
  return pdf;
}
