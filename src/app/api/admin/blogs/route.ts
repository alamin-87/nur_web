import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { BlogPost, BlogCategory } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { mockBlogPosts, mockBlogCategories } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const category = url.searchParams.get("category");
  const status = url.searchParams.get("status");

  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = {};

      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { summary: { $regex: q, $options: "i" } },
        ];
      }
      if (category) filter.category = category;
      if (status) filter.status = status;

      const posts = await BlogPost.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json(
        { posts },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }
  } catch (err) {
    console.warn("Get blog posts DB error, using fallback posts:", err);
  }

  // Fallback
  const catMap = new Map(mockBlogCategories.map((c) => [String(c._id), c]));
  let list = mockBlogPosts.map((p) => ({
    ...p,
    category: catMap.get(String(p.category)) || { name: "Automation", slug: "automation" },
  }));

  if (q) {
    const lq = q.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(lq) || p.summary.toLowerCase().includes(lq));
  }

  return NextResponse.json({ posts: list });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot create" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.title || !String(body.title).trim() || !body.summary || !String(body.summary).trim() || !body.content || !String(body.content).trim()) {
      return NextResponse.json(
        { error: "Title, Summary and Content are required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let slug = (body.slug || body.title || "post")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) slug = `post-${Date.now()}`;

    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Safely resolve category ID
    let categoryRef: mongoose.Types.ObjectId | null = null;
    if (body.category) {
      if (typeof body.category === "object" && "_id" in body.category) {
        const idStr = String(body.category._id).trim();
        if (mongoose.Types.ObjectId.isValid(idStr)) {
          categoryRef = new mongoose.Types.ObjectId(idStr);
        }
      } else if (typeof body.category === "string" && body.category.trim()) {
        const catTrim = body.category.trim();
        if (mongoose.Types.ObjectId.isValid(catTrim)) {
          categoryRef = new mongoose.Types.ObjectId(catTrim);
        } else {
          const foundCat = await BlogCategory.findOne({
            $or: [{ slug: catTrim }, { name: catTrim }],
          });
          if (foundCat) categoryRef = foundCat._id;
        }
      }
    }

    const post = await BlogPost.create({
      title: String(body.title).trim(),
      slug,
      summary: String(body.summary).trim(),
      content: String(body.content).trim(),
      coverImage: body.coverImage ? String(body.coverImage).trim() : "",
      author: body.author ? String(body.author).trim() : (admin.name || "Nur Engineering Team"),
      category: categoryRef,
      tags: Array.isArray(body.tags) ? body.tags : [],
      seoTitle: body.seoTitle ? String(body.seoTitle).trim() : "",
      seoDescription: body.seoDescription ? String(body.seoDescription).trim() : "",
      status: body.status || "draft",
      featured: Boolean(body.featured),
    });

    await logActivity({
      action: "BLOG_CREATE",
      entity: "BlogPost",
      entityId: String(post._id),
      details: `Created blog post "${post.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    console.error("Create blog post error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create blog post" },
      { status: 500 }
    );
  }
}
