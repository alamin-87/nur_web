import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DownloadFile, type IDownloadFile } from "@/lib/models";
import { readDownloadBuffer } from "@/lib/download-storage";

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
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
