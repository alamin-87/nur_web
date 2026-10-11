import { createHash } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import type { Schema } from "mongoose";

type MediaResourceType = "image" | "video";

const MEDIA_DATA_URL =
  /^data:(image|video)\/([a-z0-9.+-]+);base64,([a-z\d+/=\r\n]+)$/i;
const uploadUrlCache = new Map<string, Promise<string>>();

function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const missing = [
    !cloudName && "CLOUDINARY_CLOUD_NAME",
    !apiKey && "CLOUDINARY_API_KEY",
    !apiSecret && "CLOUDINARY_API_SECRET",
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Cloudinary configuration is missing: ${missing.join(", ")}`);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
}

function getDeliveryUrl(secureUrl: string) {
  return secureUrl.replace("/upload/", "/upload/f_auto,q_auto/");
}

export function isMediaDataUrl(value: unknown): value is string {
  return typeof value === "string" && MEDIA_DATA_URL.test(value);
}

export async function uploadMediaBuffer(
  buffer: Buffer,
  mimeType: string,
  folder = "nur-engineering/media"
) {
  const normalizedMime = mimeType.toLowerCase();
  const resourceType: MediaResourceType = normalizedMime.startsWith("video/")
    ? "video"
    : "image";
  if (!normalizedMime.startsWith("image/") && !normalizedMime.startsWith("video/")) {
    throw new Error("Cloudinary uploads support image and video files only.");
  }
  if (!buffer.length) throw new Error("Cannot upload an empty media file.");

  const hash = createHash("sha256").update(buffer).digest("hex");
  const publicId = `${folder}/${hash}`;
  const client = getCloudinaryClient();
  const result = await new Promise<{
    secure_url?: string;
    public_id?: string;
    resource_type?: string;
    bytes?: number;
  }>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: publicId,
        overwrite: true,
        unique_filename: false,
      },
      (error, uploaded) => {
        if (error) reject(error);
        else if (uploaded) resolve(uploaded);
        else reject(new Error("Cloudinary returned no upload result."));
      }
    );
    stream.end(buffer);
  });

  if (!result.secure_url || result.bytes !== buffer.length) {
    throw new Error("Cloudinary upload verification failed.");
  }

  return {
    secureUrl: result.secure_url,
    url: getDeliveryUrl(result.secure_url),
    publicId: result.public_id || publicId,
    resourceType,
    bytes: result.bytes,
  };
}

export async function uploadMediaDataUrl(source: string) {
  const match = MEDIA_DATA_URL.exec(source);
  if (!match) throw new Error("Invalid image or video data URL.");

  const mimeType = `${match[1].toLowerCase()}/${match[2].toLowerCase()}`;
  const buffer = Buffer.from(match[3].replace(/\s/g, ""), "base64");
  const hash = createHash("sha256").update(buffer).digest("hex");
  const resourceType: MediaResourceType = match[1].toLowerCase() as MediaResourceType;
  const cacheKey = `${resourceType}:${hash}`;
  const cached = uploadUrlCache.get(cacheKey);
  if (cached) return cached;

  const upload = uploadMediaBuffer(buffer, mimeType, "nur-engineering/migrated");
  uploadUrlCache.set(cacheKey, upload.then((result) => result.url));
  try {
    return await uploadUrlCache.get(cacheKey)!;
  } catch (error) {
    uploadUrlCache.delete(cacheKey);
    throw error;
  }
}

async function externalizeMedia(value: unknown): Promise<{
  value: unknown;
  changed: boolean;
}> {
  if (isMediaDataUrl(value)) {
    return { value: await uploadMediaDataUrl(value), changed: true };
  }

  if (Array.isArray(value)) {
    const results = await Promise.all(value.map(externalizeMedia));
    return {
      value: results.map((result) => result.value),
      changed: results.some((result) => result.changed),
    };
  }

  if (!value || typeof value !== "object" || value instanceof Date || Buffer.isBuffer(value)) {
    return { value, changed: false };
  }

  const objectValue = value as { toHexString?: unknown };
  if (typeof objectValue.toHexString === "function") {
    return { value, changed: false };
  }

  const entries = await Promise.all(
    Object.entries(value).map(async ([key, item]) => [key, await externalizeMedia(item)] as const)
  );
  return {
    value: Object.fromEntries(entries.map(([key, result]) => [key, result.value])),
    changed: entries.some(([, result]) => result.changed),
  };
}

export function cloudinaryMediaPlugin(schema: Schema) {
  schema.pre("save", async function () {
    const document = this as unknown as {
      modifiedPaths(): string[];
      get(path: string): unknown;
      set(path: string, value: unknown): void;
    };

    for (const path of document.modifiedPaths()) {
      const transformed = await externalizeMedia(document.get(path));
      if (transformed.changed) document.set(path, transformed.value);
    }
  });

  for (const operation of ["findOneAndUpdate", "updateOne", "updateMany", "replaceOne"] as const) {
    schema.pre(operation, async function () {
      const query = this as unknown as {
        getUpdate(): unknown;
        setUpdate(update: never): void;
      };
      const update = query.getUpdate();
      if (!update) return;

      const transformed = await externalizeMedia(update);
      if (transformed.changed) query.setUpdate(transformed.value as never);
    });
  }
}
