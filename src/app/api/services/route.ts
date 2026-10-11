import { NextResponse } from "next/server";
import { getServices } from "@/lib/data";
import { PUBLIC_API_CACHE } from "@/lib/http-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json(
      {
        success: true,
        services: services.map((service) => ({
          _id: String(service._id),
          title: service.title,
          slug: service.slug,
        })),
      },
      {
        headers: {
          "Cache-Control": PUBLIC_API_CACHE,
        },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load services" },
      { status: 500 }
    );
  }
}
