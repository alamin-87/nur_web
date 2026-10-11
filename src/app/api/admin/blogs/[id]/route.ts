import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { BlogPost, BlogCategory } from "@/lib/models";
import { mockBlogPosts } from "@/lib/mock-data";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    let post = null;

    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          post = await BlogPost.findById(id).populate("category").lean();
        }
        if (!post) {
          post = await BlogPost.findOne({ slug: id }).populate("category").lean();
        }
      }
    } catch (dbErr) {
      console.warn("Blog find DB warning:", dbErr);
    }

    if (!post) {
      post = mockBlogPosts.find((p) => String(p._id) === id || p.slug === id);
    }

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(
      { post },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Get blog post error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
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

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.slug !== undefined && String(body.slug).trim()) updateData.slug = String(body.slug).trim();
    if (body.summary !== undefined) updateData.summary = String(body.summary).trim();
    if (body.content !== undefined) updateData.content = String(body.content).trim();
    if (body.coverImage !== undefined) updateData.coverImage = String(body.coverImage).trim();
    if (body.author !== undefined) updateData.author = String(body.author).trim();
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.seoTitle !== undefined) updateData.seoTitle = String(body.seoTitle).trim();
    if (body.seoDescription !== undefined) updateData.seoDescription = String(body.seoDescription).trim();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    updateData.category = categoryRef;

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await BlogPost.findByIdAndUpdate(id, updateData, { new: true });
    }
    if (!updated) {
      updated = await BlogPost.findOneAndUpdate({ slug: id }, updateData, { new: true });
    }

    if (!updated) {
      // If the post was from mock / seed data, create it as a persistent MongoDB record
      const slug = (body.slug || body.title || id)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
      updated = await BlogPost.create({
        ...updateData,
        title: updateData.title || "Untitled Blog Post",
        slug,
        summary: updateData.summary || "",
        content: updateData.content || "",
      });
    }

    await logActivity({
      action: "BLOG_UPDATE",
      entity: "BlogPost",
      entityId: String(updated._id),
      details: `Updated blog post "${updated.title}"`,
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
      if (updated.slug) revalidatePath(`/blog/${updated.slug}`);
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (err: unknown) {
    console.error("Update blog post error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot delete" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let post = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await BlogPost.findByIdAndDelete(id);
    }
    if (!post) {
      post = await BlogPost.findOneAndDelete({ slug: id });
    }

    await logActivity({
      action: "BLOG_DELETE",
      entity: "BlogPost",
      entityId: id,
      details: `Deleted blog post "${post?.title || id}"`,
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
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (err: unknown) {
    console.error("Delete blog post error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete post" },
      { status: 500 }
    );
  }
}
