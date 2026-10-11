import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Public settings GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to load settings" }, { status: 500 });
  }
}
