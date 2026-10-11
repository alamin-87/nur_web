import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";
import { jsonError } from "@/lib/api";
import { PUBLIC_API_CACHE } from "@/lib/http-cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const featured = searchParams.get("featured") === "true";
    const categorySlug = searchParams.get("category") || undefined;
    const subCategorySlug = searchParams.get("subcategory") || searchParams.get("subCategory") || undefined;
    const q = searchParams.get("q") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const pageParam = searchParams.get("page");
    const page = pageParam ? parseInt(pageParam, 10) : undefined;

    const data = await getProducts({ featured, categorySlug, subCategorySlug, q, limit, page });
    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": PUBLIC_API_CACHE,
        },
      }
    );
  } catch (e) {
    console.error("GET /api/products error:", e);
    return jsonError("Failed to fetch products");
  }
}


