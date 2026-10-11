import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { CompanyProfile } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { fallbackCompanyProfile } from "@/lib/data";
import { serialize } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (db) {
      const doc = await CompanyProfile.findOne().lean();
      if (doc) {
        return NextResponse.json({
          profile: {
            ...fallbackCompanyProfile,
            ...serialize(doc),
          },
        });
      }
    }
  } catch (err) {
    console.warn("Get admin about DB error:", err);
  }

  return NextResponse.json({ profile: fallbackCompanyProfile });
}

export async function PUT(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      tagline,
      about,
      aboutLabel,
      mission,
      vision,
      coverImage,
      highlights,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Title / Company name is required" }, { status: 400 });
    }
    if (!tagline || !tagline.trim()) {
      return NextResponse.json({ error: "Subtitle / Tagline is required" }, { status: 400 });
    }
    if (!about || !about.trim()) {
      return NextResponse.json({ error: "About description is required" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const payload = {
      name: name.trim(),
      tagline: tagline.trim(),
      about: about.trim(),
      aboutLabel: aboutLabel?.trim() || "About",
      mission: mission?.trim() || "",
      vision: vision?.trim() || "",
      coverImage: coverImage !== undefined ? coverImage.trim() : fallbackCompanyProfile.coverImage,
      highlights: Array.isArray(highlights)
        ? highlights.map((h: { label?: string; value?: string }) => ({
            label: h.label?.trim() || "",
            value: h.value?.trim() || "",
          }))
        : fallbackCompanyProfile.highlights,
    };

    const existing = await CompanyProfile.findOne();
    let resultDoc;

    if (existing) {
      resultDoc = await CompanyProfile.findByIdAndUpdate(
        existing._id,
        { $set: payload },
        { new: true, runValidators: false }
      ).lean();
    } else {
      const created = await CompanyProfile.create({
        ...fallbackCompanyProfile,
        ...payload,
      });
      resultDoc = typeof created.toObject === "function" ? created.toObject() : created;
    }

    await logActivity({
      action: "SETTINGS_UPDATE",
      entity: "CompanyProfile",
      details: "Updated About section and company profile",
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/about");
      revalidatePath("/");
    } catch {
      // ignore revalidation error in environments without full cache context
    }

    return NextResponse.json({ success: true, profile: serialize(resultDoc) });
  } catch (err: unknown) {
    console.error("About update error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update About content" },
      { status: 500 }
    );
  }
}
