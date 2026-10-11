"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Img } from "@/components/Img";

interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string;
  author: string;
  category?: { name: string };
  status: "draft" | "published" | "scheduled";
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPosts();
  }, [search]);

  async function loadPosts() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/blogs?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete post "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (res.ok) setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy">
            Blog &amp; Knowledge Base
          </h2>
          <p className="text-xs text-steel">
            Manage engineering articles, wiring guides and technical publications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/admin/blogs/categories"
            className="rounded border border-line bg-white px-3.5 sm:px-4 py-2 text-xs font-bold uppercase text-navy hover:bg-paper transition flex-1 sm:flex-none text-center"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/blogs/new"
            className="btn-orange px-4 py-2 text-xs font-bold uppercase flex-1 sm:flex-none text-center"
          >
            + Add New Article
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
        <input
          type="search"
          placeholder="Search blog posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
        />
      </div>

      {/* Blogs Table */}
      <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mist">
                    Loading posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm font-bold text-navy">No blog posts found</p>
                    <p className="mt-1 text-xs text-mist">Click &quot;+ Add New Post&quot; to publish your first guide.</p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-paper/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded border border-line bg-paper/50">
                            <Img src={post.coverImage} alt="" fill className="object-cover" sizes="64px" />
                          </div>
                        ) : (
                          <div className="grid h-11 w-16 shrink-0 place-items-center rounded bg-paper text-base">
                            📰
                          </div>
                        )}
                        <div className="min-w-0 max-w-sm">
                          <p className="font-bold text-navy line-clamp-1">{post.title}</p>
                          <p className="text-[11px] text-mist line-clamp-1">{post.summary}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-navy">
                      {post.category?.name || "Uncategorized"}
                    </td>

                    <td className="py-3 px-4 text-steel">
                      {post.author}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          post.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-mist">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/blogs/${post._id}/edit`}
                          className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-navy hover:border-orange hover:text-orange transition"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post._id, post.title)}
                          className="rounded border border-red-200 bg-red-50/50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
