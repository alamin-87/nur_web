import { NextResponse } from "next/server";
import { getSubCategories } from "@/lib/data";
import { PUBLIC_API_CACHE } from "@/lib/http-cache";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const subcategories = await getSubCategories(category);
    return NextResponse.json(
      { subcategories },
      { headers: { "Cache-Control": PUBLIC_API_CACHE } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}
