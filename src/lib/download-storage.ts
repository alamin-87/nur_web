import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Readable } from "stream";

export const BUCKET_NAME = "download_files";
export const GRIDFS_CHUNK_SIZE = 261120; // 255 KB (MongoDB GridFS standard default)
export const CLIENT_CHUNK_SIZE = 2611200; // ~2.49 MB (10 * 255KB sub-chunks, safely below Vercel's 4.5MB limit)
export const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

export async function getBucket(): Promise<GridFSBucket | null> {
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) return null;
  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
}

export function isAllowedDownloadFile(file: { name: string; type?: string }) {
  const name = (file.name || "").toLowerCase().trim();
  const mime = (file.type || "").toLowerCase().trim();
  const hasPdfExt = name.endsWith(".pdf");
  const isPdfMime =
    !mime ||
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    mime === "application/acrobat" ||
    mime === "applications/vnd.pdf" ||
    mime === "text/pdf" ||
    mime === "text/x-pdf";

  return hasPdfExt && isPdfMime;
}

export function isPdfBuffer(buffer: Buffer | Uint8Array): boolean {
  if (!buffer || buffer.length < 5) return false;
  // Standard PDF magic byte sequence: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

export async function writeGridFSSubChunks(params: {
  files_id: string | ObjectId;
  clientChunkIndex: number;
  chunkBuffer: Buffer;
  gridFsChunkSize?: number;
}): Promise<number> {
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) {
    throw new Error("Database connection unavailable");
  }

  const db = mongoose.connection.db;
  const chunksCollection = db.collection(`${BUCKET_NAME}.chunks`);
  const filesId = typeof params.files_id === "string" ? new ObjectId(params.files_id) : params.files_id;
  const subChunkSize = params.gridFsChunkSize || GRIDFS_CHUNK_SIZE;
  const ratio = Math.floor(CLIENT_CHUNK_SIZE / subChunkSize) || 10;
  const baseN = params.clientChunkIndex * ratio;

  const docsToInsert: Array<{
    files_id: ObjectId;
    n: number;
    data: Buffer;
  }> = [];

  let offset = 0;
  let subIndex = 0;
  while (offset < params.chunkBuffer.length) {
    const end = Math.min(offset + subChunkSize, params.chunkBuffer.length);
    const slice = params.chunkBuffer.subarray(offset, end);
    const n = baseN + subIndex;

    // Delete existing chunk with same files_id and n in case of chunk retry
    docsToInsert.push({
      files_id: filesId,
      n,
      data: slice,
    });

    offset = end;
    subIndex++;
  }

  if (docsToInsert.length > 0) {
    const minN = docsToInsert[0].n;
    const maxN = docsToInsert[docsToInsert.length - 1].n;
    await chunksCollection.deleteMany({
      files_id: filesId,
      n: { $gte: minN, $lte: maxN },
    });
    await chunksCollection.insertMany(docsToInsert, { ordered: true });
  }

  return docsToInsert.length;
}

export async function finalizeGridFSUpload(params: {
  files_id: string | ObjectId;
  filename: string;
  mimeType: string;
  totalSize: number;
  gridFsChunkSize?: number;
}): Promise<{ id: ObjectId; filename: string; size: number }> {
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) {
    throw new Error("Database connection unavailable");
  }

  const db = mongoose.connection.db;
  const filesCollection = db.collection(`${BUCKET_NAME}.files`);
  const filesId = typeof params.files_id === "string" ? new ObjectId(params.files_id) : params.files_id;
  const chunkSize = params.gridFsChunkSize || GRIDFS_CHUNK_SIZE;

  // Insert or replace metadata in GridFS files collection
  await filesCollection.deleteOne({ _id: filesId });
  await filesCollection.insertOne({
    _id: filesId,
    length: params.totalSize,
    chunkSize,
    uploadDate: new Date(),
    filename: params.filename,
    contentType: params.mimeType || "application/pdf",
  });

  return {
    id: filesId,
    filename: params.filename,
    size: params.totalSize,
  };
}

export async function deleteGridFSFile(id: string | ObjectId | undefined) {
  if (!id) return;
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) return;

  const db = mongoose.connection.db;
  const objectId = typeof id === "string" ? new ObjectId(id) : id;

  try {
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
    await bucket.delete(objectId);
  } catch {
    // Fallback: manually delete from chunks and files in case index or metadata was partial
    try {
      await Promise.all([
        db.collection(`${BUCKET_NAME}.files`).deleteOne({ _id: objectId }),
        db.collection(`${BUCKET_NAME}.chunks`).deleteMany({ files_id: objectId }),
      ]);
    } catch {
      // Already cleaned up
    }
  }
}

export const deleteDownloadBuffer = deleteGridFSFile;

export async function getDownloadWebStream(id: string | ObjectId): Promise<{
  stream: ReadableStream<Uint8Array>;
  filename: string;
  mimeType: string;
  size: number;
} | null> {
  const bucket = await getBucket();
  if (!bucket) return null;

  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files.length) return null;

  const file = files[0];
  const nodeStream = bucket.openDownloadStream(objectId);

  let webStream: ReadableStream<Uint8Array>;
  if (typeof Readable.toWeb === "function") {
    webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  } else {
    webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        nodeStream.on("end", () => {
          controller.close();
        });
        nodeStream.on("error", (err) => {
          controller.error(err);
        });
      },
      cancel() {
        nodeStream.destroy();
      },
    });
  }

  return {
    stream: webStream,
    filename: file.filename,
    mimeType: file.contentType || "application/pdf",
    size: file.length,
  };
}

export async function storeDownloadBuffer(params: {
  filename: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<{ id: ObjectId; size: number } | null> {
  if (params.buffer.length > MAX_DOWNLOAD_BYTES) {
    throw new Error(`File exceeds ${MAX_DOWNLOAD_BYTES / (1024 * 1024)}MB limit`);
  }
  if (!isPdfBuffer(params.buffer)) {
    throw new Error("Only PDF files allowed");
  }

  const bucket = await getBucket();
  if (!bucket) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(params.filename, {
      contentType: params.mimeType || "application/pdf",
      chunkSizeBytes: GRIDFS_CHUNK_SIZE,
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({ id: uploadStream.id as ObjectId, size: params.buffer.length });
    });
    uploadStream.end(params.buffer);
  });
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
