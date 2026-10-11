import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { BlogPost, type IBlogPost } from "@/lib/models";
import { mockBlogPosts } from "@/lib/mock-data";
import { BlogForm } from "../../BlogForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let post: IBlogPost | Record<string, unknown> | null = null;

  try {
    const db = await connectDB();
    if (db) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const found = await BlogPost.findById(id).lean();
        if (found) post = found as unknown as IBlogPost;
      }
      if (!post) {
        const foundSlug = await BlogPost.findOne({ slug: id }).lean();
        if (foundSlug) post = foundSlug as unknown as IBlogPost;
      }
    }
  } catch (err) {
    console.warn("Edit blog post fetch DB warning:", err);
  }

  if (!post) {
    const mock = mockBlogPosts.find((p) => String(p._id) === id || p.slug === id);
    if (mock) post = mock as unknown as Record<string, unknown>;
  }

  if (!post) notFound();

  const serialized = JSON.parse(JSON.stringify(post));

  return <BlogForm initialData={serialized} isEdit />;
}
