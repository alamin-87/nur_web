import { NextResponse } from "next/server";
import { getCategories } from "@/lib/data";
import { PUBLIC_API_CACHE } from "@/lib/http-cache";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") as "product" | "service") || "product";
    const categories = await getCategories(type);
    return NextResponse.json(
      { success: true, categories },
      {
        headers: {
          "Cache-Control": PUBLIC_API_CACHE,
        },
      }
    );
  } catch (err: unknown) {
    console.error("Public categories GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load categories" },
      { status: 500 }
    );
  }
}
