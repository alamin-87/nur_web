import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/auth";
import { resolveGoogleMapsUrlServer } from "@/lib/google-maps";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url, zoom, address } = await req.json();

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({
        success: false,
        error: "Please provide a Google Maps URL or iframe embed code.",
      });
    }

    const zoomNum = typeof zoom === "number" ? zoom : undefined;
    const result = await resolveGoogleMapsUrlServer(url.trim(), zoomNum, address);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error("Error resolving Google Maps URL:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process the Google Maps link. Please verify the URL.",
      },
      { status: 500 }
    );
  }
}
