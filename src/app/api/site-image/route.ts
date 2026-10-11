import { NextRequest, NextResponse } from "next/server";
import {
  decodeImageDataUrl,
  getImageVersion,
} from "@/lib/public-images";
import { getRawPublicImage } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const version = params.get("v") || "";
  let source: string | null = null;

  try {
    const entity = params.get("entity") || "settings";
    const id = params.get("id") || "";
    const field = params.get("field") || "";
    const indexValue = params.get("index");
    const index = indexValue === null ? null : Number(indexValue);
    source = await getRawPublicImage(
      entity,
      id,
      field,
      Number.isInteger(index) ? index : null
    );
  } catch (error) {
    console.error("Public image lookup failed:", error);
    return NextResponse.json(
      { error: "Image temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!source || getImageVersion(source) !== version) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const image = decodeImageDataUrl(source);
  if (!image) {
    return new NextResponse(null, {
      status: 415,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new NextResponse(new Uint8Array(image.buffer), {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": String(image.buffer.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: `"${version}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
