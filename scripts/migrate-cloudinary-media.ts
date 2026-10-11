import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import {
  isMediaDataUrl,
  uploadMediaDataUrl,
} from "@/lib/cloudinary-media";

const APPLY = process.argv.includes("--apply");
const PUBLIC_MEDIA_COLLECTIONS = new Set([
  "sitesettings",
  "products",
  "categories",
  "subcategories",
  "brands",
  "services",
  "banners",
  "companyprofiles",
  "usecases",
  "blogposts",
  "mediaitems",
]);

type MediaPath = { path: string; source: string; kind: "image" | "video" };

function collectMedia(value: unknown, path = "", result: MediaPath[] = []) {
  if (isMediaDataUrl(value)) {
    result.push({
      path,
      source: value,
      kind: value.startsWith("data:video/") ? "video" : "image",
    });
    return result;
  }
  if (!value || typeof value !== "object" || value instanceof Date || Buffer.isBuffer(value)) {
    return result;
  }
  if (typeof (value as { toHexString?: unknown }).toHexString === "function") return result;

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectMedia(item, path ? `${path}.${index}` : String(index), result));
  } else {
    for (const [key, item] of Object.entries(value)) {
      collectMedia(item, path ? `${path}.${key}` : key, result);
    }
  }
  return result;
}

async function verifyDeliveryUrl(url: string) {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) return;
      lastStatus = response.status;
    } catch {
      lastStatus = 0;
    }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }
  throw new Error(`Cloudinary delivery URL verification failed (HTTP ${lastStatus || "network error"}).`);
}

async function main() {
  const db = await connectDB();
  if (!db || !mongoose.connection.db) {
    throw new Error("MongoDB is not connected; migration stopped without changing data.");
  }

  const selected = (await mongoose.connection.db.listCollections().toArray()).filter((item) =>
    PUBLIC_MEDIA_COLLECTIONS.has(item.name.toLowerCase())
  );
  const totals = {
    collections: selected.length,
    documents: 0,
    mediaFields: 0,
    images: 0,
    videos: 0,
    estimatedBytes: 0,
    changedDocuments: 0,
    failedDocuments: 0,
  };
  const uploadCache = new Map<string, Promise<string>>();
  let stopAfterFailure = false;

  async function getVerifiedUrl(source: string) {
    const payload = source.slice(source.indexOf(",") + 1).replace(/\s/g, "");
    const key = createHash("sha256").update(Buffer.from(payload, "base64")).digest("hex");
    let pending = uploadCache.get(key);
    if (!pending) {
      pending = uploadMediaDataUrl(source).then(async (url) => {
        await verifyDeliveryUrl(url);
        return url;
      });
      uploadCache.set(key, pending);
    }
    return pending;
  }

  for (const info of selected) {
    const collection = mongoose.connection.db.collection(info.name);
    const isMediaLibrary = info.name.toLowerCase() === "mediaitems";
    let collectionFields = 0;
    let collectionDocs = 0;

    for await (const document of collection.find({})) {
      const media = collectMedia(document).filter(
        (item) => !(isMediaLibrary && item.path === "data")
      );
      const removeLegacyData =
        isMediaLibrary && isMediaDataUrl((document as { data?: unknown }).data);
      if (!media.length && !removeLegacyData) continue;

      totals.documents++;
      totals.mediaFields += media.length + (removeLegacyData ? 1 : 0);
      collectionFields += media.length + (removeLegacyData ? 1 : 0);
      collectionDocs++;
      for (const item of media) {
        if (item.kind === "image") totals.images++;
        else totals.videos++;
        const payloadLength = item.source.slice(item.source.indexOf(",") + 1).length;
        totals.estimatedBytes += Math.floor(payloadLength * 3 / 4);
      }

      if (!APPLY) continue;

      try {
        const set: Record<string, string> = {};
        const unset: Record<string, 1> = {};
        for (const item of media) {
          set[item.path] = await getVerifiedUrl(item.source);
        }
        if (removeLegacyData) unset.data = 1;

        if (isMediaLibrary && removeLegacyData && !media.some((item) => item.path === "url")) {
          const legacyData = (document as { data?: string }).data;
          const currentUrl = (document as { url?: string }).url;
          if (legacyData && !isMediaDataUrl(currentUrl)) {
            set.url = await getVerifiedUrl(legacyData);
          }
        }

        const filter: Record<string, unknown> = { _id: document._id };
        for (const item of media) filter[item.path] = item.source;
        if (removeLegacyData) filter.data = (document as { data?: string }).data;

        const update: Record<string, unknown> = {};
        if (Object.keys(set).length) update.$set = set;
        if (Object.keys(unset).length) update.$unset = unset;
        const result = await collection.updateOne(filter, update);
        if (result.matchedCount !== 1) {
          throw new Error("Document changed during migration; its stored media was left untouched.");
        }

        const saved = await collection.findOne({ _id: document._id });
        if (!saved) throw new Error("Document disappeared during migration verification.");
        for (const [path, url] of Object.entries(set)) {
          const value = path.split(".").reduce<unknown>((current, key) => {
            if (Array.isArray(current)) return current[Number(key)];
            if (current && typeof current === "object") {
              return (current as Record<string, unknown>)[key];
            }
            return undefined;
          }, saved);
          if (value !== url) throw new Error("MongoDB URL verification failed.");
        }
        if (removeLegacyData && "data" in saved) {
          throw new Error("Legacy media data field still exists after migration.");
        }
        totals.changedDocuments++;
      } catch (error) {
        totals.failedDocuments++;
        stopAfterFailure = true;
        console.error(
          `Migration stopped safely for collection ${info.name}:`,
          error instanceof Error ? error.message : "unknown error"
        );
        break;
      }
    }

    console.log(`${info.name}: ${collectionDocs} documents, ${collectionFields} base64 media fields`);
    if (stopAfterFailure) break;
  }

  console.log(
    JSON.stringify({
      mode: APPLY ? "apply" : "dry-run",
      ...totals,
      estimatedMiB: Number((totals.estimatedBytes / (1024 * 1024)).toFixed(2)),
    })
  );

  await mongoose.disconnect();
  if (totals.failedDocuments) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : "Cloudinary migration failed.");
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
