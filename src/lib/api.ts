import { NextRequest, NextResponse } from "next/server";

export function requireAdmin(request: NextRequest) {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    return NextResponse.json(
      { success: false, error: "ADMIN_API_KEY not configured" },
      { status: 503 }
    );
  }
  const header =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (header !== key) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(error: string, status = 500, details?: unknown) {
  return NextResponse.json({ success: false, error, details }, { status });
}
