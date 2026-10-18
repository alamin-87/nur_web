import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DownloadFile, type IDownloadFile } from "@/lib/models";
import { getDownloadWebStream, readDownloadBuffer } from "@/lib/download-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const view = new URL(req.url).searchParams.get("view") === "1";

  const db = await connectDB();
  if (!db) {
    return NextResponse.json({ error: "File unavailable" }, { status: 503 });
  }

  const item = await DownloadFile.findById(id).lean<IDownloadFile | null>();
  if (!item || !item.gridFsId) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 1. Zero-RAM Web ReadableStream Streaming Download
  try {
    const webStreamResult = await getDownloadWebStream(item.gridFsId);
    if (webStreamResult) {
      const filename = (item.filename || webStreamResult.filename || "document.pdf").replace(/"/g, "");
      const disposition = view ? "inline" : "attachment";
      const size = item.size || webStreamResult.size;

      return new Response(webStreamResult.stream as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": item.mimeType || webStreamResult.mimeType || "application/pdf",
          "Content-Length": String(size),
          "Content-Disposition": `${disposition}; filename="${encodeURIComponent(filename)}"`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "private, max-age=3600",
        },
      });
    }
  } catch (err) {
    console.error("Web streaming error, falling back to buffer:", err);
  }

  // 2. Fallback buffer reader
  const stored = await readDownloadBuffer(item.gridFsId);
  if (!stored) {
    return NextResponse.json({ error: "File is missing" }, { status: 404 });
  }

  const filename = (item.filename || stored.filename || "document.pdf").replace(/"/g, "");
  const disposition = view ? "inline" : "attachment";

  return new NextResponse(new Uint8Array(stored.buffer), {
    status: 200,
    headers: {
      "Content-Type": item.mimeType || stored.mimeType || "application/pdf",
      "Content-Length": String(stored.buffer.length),
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(filename)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
