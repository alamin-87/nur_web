"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Img } from "@/components/Img";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface BlogCategory {
  _id: string;
  name: string;
}

interface BlogFormProps {
  initialData?: {
    _id?: string;
    title: string;
    slug?: string;
    summary: string;
    content: string;
    coverImage?: string;
    author: string;
    category?: string | { _id: string };
    tags: string[];
    seoTitle?: string;
    seoDescription?: string;
    status: "draft" | "published" | "scheduled";
    featured: boolean;
  };
  isEdit?: boolean;
}

export function BlogForm({ initialData, isEdit }: BlogFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [author, setAuthor] = useState(initialData?.author || "Nur Engineering Team");
  const [category, setCategory] = useState(
    typeof initialData?.category === "object"
      ? initialData.category._id
      : initialData?.category || ""
  );
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    initialData?.status || "draft"
  );
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/blogs/categories")
      .then((res) => res.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title,
        slug: slug.trim() || undefined,
        summary,
        content,
        coverImage,
        author,
        category: category || undefined,
        tags,
        seoTitle,
        seoDescription,
        status,
        featured,
      };

      const blogId = initialData?._id || initialData?.slug;
      const url = isEdit
        ? `/api/admin/blogs/${blogId}`
        : "/api/admin/blogs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save blog post");

      router.push("/admin/blogs");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy">
            {isEdit ? "Edit Blog Post" : "Create Blog Post"}
          </h2>
          <p className="text-xs text-steel">
            Draft technical articles, application notes and industry updates.
          </p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Link
            href="/admin/blogs"
            className="rounded border border-line bg-white px-3.5 sm:px-4 py-2 text-xs font-bold uppercase text-navy hover:bg-paper transition flex-1 sm:flex-none text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-orange px-5 sm:px-6 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50 flex-1 sm:flex-none text-center"
          >
            {loading ? "Saving..." : isEdit ? "Update Post" : "Publish / Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[2fr_1fr]">
        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-navy">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How to Choose the Right VFD for Heavy Industrial Motors"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-sm font-bold text-navy outline-none focus:border-orange"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none bg-white text-navy"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Author Name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Short Summary *</label>
              <textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Short lead paragraph summarizing the post..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Article Body (Markdown / Text) *</label>
              <textarea
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                className="mt-1 w-full rounded border border-line p-3 text-xs outline-none font-mono leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="VFD, Inverter, Automation, Industrial Maintenance"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          {/* SEO Meta */}
          <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-2">
              Search Engine Optimization (SEO)
            </h3>
            <div>
              <label className="block text-xs font-bold uppercase text-navy">SEO Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Custom title for Google search results..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-navy">SEO Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Concise 150-160 character description..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-2">
              Publication Status
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published" | "scheduled")}
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none bg-white text-navy font-bold"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Live)</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded accent-orange"
              />
              <span className="text-xs font-bold text-navy">Featured Article</span>
            </label>
          </div>

          {/* Cover Image */}
          <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                Cover Image
              </h3>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="text-xs font-bold text-orange hover:underline"
              >
                Choose Image
              </button>
            </div>

            {coverImage ? (
              <div className="relative aspect-video overflow-hidden rounded border border-line bg-paper/50">
                <Img src={coverImage} alt="" fill className="object-cover" sizes="250px" />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded border border-dashed border-line bg-paper/30 text-xs text-mist">
                No cover image selected
              </div>
            )}

            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... or /uploads/..."
              className="w-full rounded border border-line px-3 py-1.5 text-xs outline-none"
            />
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => setCoverImage(url)}
      />
    </form>
  );
}
