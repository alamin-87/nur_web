"use client";

import { useState, useEffect } from "react";
import { Img } from "@/components/Img";
import { ImageIcon } from "@/components/admin/AdminIcons";
import { compressImageFile } from "@/lib/image-compression";

interface MediaItem {
  _id: string;
  title: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  acceptType = "image",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  acceptType?: "image" | "video";
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [acceptType, isOpen, search]);

  async function loadMedia() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/media?q=${encodeURIComponent(search)}&type=${acceptType}`
      );
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error("Load media error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    // Validate type
    if (!rawFile.type.startsWith(`${acceptType}/`)) {
      setUploadError(`Please select a valid ${acceptType} file.`);
      return;
    }

    const maxSize = acceptType === "video" ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
    if (rawFile.size > maxSize) {
      setUploadError(`File size is too large (maximum ${acceptType === "video" ? "50MB" : "15MB"}).`);
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const optimizedFile =
        acceptType === "image"
          ? await compressImageFile(rawFile, 1600, 0.85)
          : rawFile;

      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("title", rawFile.name);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) {
        setUploadError("Upload payload too large. Please choose a smaller image.");
        return;
      }

      const data = await res.json();
      if (data.success && data.item) {
        setItems((prev) => [data.item, ...prev]);
        onSelect(data.item.url);
        onClose();
      } else {
        setUploadError(data.error || "Failed to upload image.");
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "Network error during upload.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-line bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-paper/40">
          <div className="flex items-center gap-2 text-navy">
            <ImageIcon size={18} className="text-orange" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy">
              Select or Upload {acceptType === "image" ? "Image" : "Video"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-mist hover:text-navy text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-line p-3 sm:p-4 bg-white">
          {/* Direct URL input */}
          <div className="flex flex-1 items-center gap-2 min-w-0 w-full sm:w-auto">
            <input
              type="url"
              placeholder="Or paste external image URL..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 min-w-0 rounded border border-line px-2.5 py-1.5 text-xs outline-none focus:border-orange"
            />
            <button
              type="button"
              disabled={!customUrl.trim()}
              onClick={() => {
                onSelect(customUrl.trim());
                onClose();
              }}
              className="btn-orange px-3 py-1.5 text-xs font-bold shrink-0 disabled:opacity-50"
            >
              Use URL
            </button>
          </div>

          {/* Upload Button */}
          <label className="btn-navy cursor-pointer px-4 py-1.5 text-xs font-bold shrink-0 w-full sm:w-auto text-center flex items-center justify-center gap-1.5">
            <ImageIcon size={14} />
            <span>{uploading ? "Uploading..." : "+ Upload New"}</span>
            <input
              type="file"
              accept={acceptType === "image" ? "image/*" : "video/*"}
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {uploadError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs font-semibold text-red-600">
            {uploadError}
          </div>
        )}

        {/* Search Bar */}
        <div className="px-4 py-2 bg-paper/20 border-b border-line">
          <input
            type="search"
            placeholder="Search media files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-line px-2.5 py-1 text-xs outline-none focus:border-orange"
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin max-h-[50vh]">
          {loading ? (
            <div className="py-12 text-center text-xs text-mist">Loading media...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-navy">No media files found</p>
              <p className="mt-1 text-xs text-mist">Upload a {acceptType} or paste a URL above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
              {items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative aspect-square overflow-hidden rounded border border-line bg-paper/40 transition hover:border-orange hover:shadow-md"
                >
                  {acceptType === "video" ? (
                    <video
                      src={item.url}
                      muted
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Img
                      src={item.url}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="120px"
                    />
                  )}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-1">
                    <p className="truncate text-[9px] text-white">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
