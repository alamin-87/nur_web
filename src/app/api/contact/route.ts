import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/lib/models";
import { contactSchema } from "@/lib/validators";
import { jsonOk, jsonError, requireAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const db = await connectDB();
    if (!db) return jsonError("Contact submissions are temporarily unavailable", 503);
    const data = await ContactMessage.find()
      .populate("product")
      .populate("service")
      .sort({ createdAt: -1 })
      .lean();
    return jsonOk(data);
  } catch (e) {
    console.error(e);
    return jsonError("Failed to fetch messages");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }
    const db = await connectDB();
    if (!db) return jsonError("Contact submissions are temporarily unavailable", 503);
    const message = await ContactMessage.create({
      ...parsed.data,
      phone: parsed.data.phone || undefined,
      product: body.product || undefined,
      service: body.service || undefined,
    });
    return jsonOk({ id: message._id }, 201);
  } catch (e) {
    console.error(e);
    return jsonError("Failed to send message");
  }
}
