"use client";

import { DragEvent, FormEvent, useEffect, useState } from "react";

type Kind = "catalogue" | "manual";

interface DownloadItem {
  _id: string;
  kind: Kind;
  title: string;
  filename: string;
  size: number;
  order: number;
  downloadUrl: string;
}

const CLIENT_CHUNK_SIZE = 2611200; // ~2.49 MB (safely below Vercel's 4.5MB limit)
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export default function AdminDownloadsPage() {
  const [kind, setKind] = useState<Kind>("catalogue");
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DownloadItem | null>(null);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadItems(kind);
  }, [kind]);

  async function loadItems(nextKind: Kind) {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/downloads?kind=${nextKind}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } catch (err) {
      console.error("Failed to load downloads:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setTitle("");
    setOrder(items.length + 1);
    setFile(null);
    setError("");
    setUploadProgress(null);
    setUploadStatusText("");
    setModalOpen(true);
  }

  function openEdit(item: DownloadItem) {
    setEditing(item);
    setTitle(item.title);
    setOrder(item.order || 0);
    setFile(null);
    setError("");
    setUploadProgress(null);
    setUploadStatusText("");
    setModalOpen(true);
  }

  function validateSelectedFile(selectedFile: File): boolean {
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".pdf")) {
      setError("Only PDF files allowed");
      setFile(null);
      return false;
    }
    if (selectedFile.size > MAX_BYTES) {
      const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(1);
      setError(`File exceeds 50MB limit (selected file is ${sizeMb} MB)`);
      setFile(null);
      return false;
    }
    setError("");
    return true;
  }

  function handleFileChange(selectedFile: File | null) {
    if (!selectedFile) return;
    if (validateSelectedFile(selectedFile)) {
      setFile(selectedFile);
      if (!title.trim() && !editing) {
        const autoTitle = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
        setTitle(autoTitle);
      }
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  }

  async function uploadInChunks(targetFile: File, itemTitle: string, itemOrder: number, itemKind: Kind) {
    const totalSize = targetFile.size;
    const totalChunks = Math.ceil(totalSize / CLIENT_CHUNK_SIZE);

    setUploadProgress(0);
    setUploadStatusText(`Initializing upload (0 of ${totalChunks} chunks)...`);

    // 1. Start chunked upload session
    const startRes = await fetch("/api/admin/downloads/chunk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        title: itemTitle,
        kind: itemKind,
        filename: targetFile.name,
        totalSize,
        totalChunks,
        order: itemOrder,
      }),
    });

    const startData = await startRes.json();
    if (!startRes.ok) {
      throw new Error(startData.error || "Failed to start upload session");
    }

    const sessionId = startData.sessionId;

    try {
      // 2. Upload chunks in sequential order
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CLIENT_CHUNK_SIZE;
        const end = Math.min(start + CLIENT_CHUNK_SIZE, totalSize);
        const chunkBlob = targetFile.slice(start, end);

        setUploadStatusText(`Uploading chunk ${i + 1} of ${totalChunks} (${Math.round((i / totalChunks) * 100)}%)...`);

        const chunkFormData = new FormData();
        chunkFormData.set("action", "upload");
        chunkFormData.set("sessionId", sessionId);
        chunkFormData.set("chunkIndex", String(i));
        chunkFormData.set("chunk", chunkBlob, targetFile.name);

        const uploadRes = await fetch("/api/admin/downloads/chunk", {
          method: "POST",
          body: chunkFormData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || `Failed uploading chunk ${i + 1}`);
        }

        const percent = Math.round(((i + 1) / totalChunks) * 100);
        setUploadProgress(percent);
      }

      // 3. Finish & instantly assemble metadata
      setUploadStatusText("Finalizing file in GridFS...");
      const finishRes = await fetch("/api/admin/downloads/chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finish",
          sessionId,
        }),
      });

      const finishData = await finishRes.json();
      if (!finishRes.ok) {
        throw new Error(finishData.error || "Failed to finalize upload");
      }

      return finishData.item;
    } catch (uploadError) {
      // Clean up partial chunks on failure
      try {
        await fetch("/api/admin/downloads/chunk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", sessionId }),
        });
      } catch {
        // Ignore delete cleanup error
      }
      throw uploadError;
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!title.trim()) {
        setError("Please enter a title.");
        setSaving(false);
        return;
      }

      if (!editing && !file) {
        setError("Please choose a PDF file.");
        setSaving(false);
        return;
      }

      // A. If a file is selected (new upload or replacing existing file)
      if (file) {
        if (!validateSelectedFile(file)) {
          setSaving(false);
          return;
        }

        // Use direct GridFS chunk streaming architecture for all uploads
        await uploadInChunks(file, title.trim(), order, kind);

        // If editing an existing item and replaced file, delete the old item
        if (editing) {
          await fetch(`/api/admin/downloads/${editing._id}`, { method: "DELETE" });
        }
      } else if (editing) {
        // B. Metadata update only (title and order)
        const updateFormData = new FormData();
        updateFormData.set("title", title.trim());
        updateFormData.set("order", String(order));

        const res = await fetch(`/api/admin/downloads/${editing._id}`, {
          method: "PUT",
          body: updateFormData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update item");
      }

      setModalOpen(false);
      await loadItems(kind);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during save");
    } finally {
      setSaving(false);
      setUploadProgress(null);
      setUploadStatusText("");
    }
  }

  async function handleDelete(item: DownloadItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/downloads/${item._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete");
        return;
      }
      loadItems(kind);
    } catch (err) {
      alert("Failed to delete file");
      console.error(err);
    }
  }

  const label = kind === "catalogue" ? "Catalogue" : "User Manual";

  function formatFileSize(bytes?: number) {
    if (!bytes || bytes <= 0) return "—";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
            Download Management
          </h2>
          <p className="text-xs text-steel">
            Upload, replace, and remove catalogue and user manual PDFs (Direct GridFS Chunk Streaming up to 50MB).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-orange px-4 py-2 text-xs font-bold uppercase shadow-sm"
        >
          + Add {label}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setKind("catalogue")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
            kind === "catalogue" ? "bg-navy text-white shadow-sm" : "border border-line bg-white text-navy hover:bg-paper"
          }`}
        >
          Catalogue
        </button>
        <button
          type="button"
          onClick={() => setKind("manual")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
            kind === "manual" ? "bg-navy text-white shadow-sm" : "border border-line bg-white text-navy hover:bg-paper"
          }`}
        >
          User Manual
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mist">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mist">
                    No {label.toLowerCase()} files yet. Click &quot;+ Add {label}&quot; to upload up to 50MB PDFs.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-paper/30 transition">
                    <td className="px-4 py-3 font-mono text-slate-500">{item.order || 0}</td>
                    <td className="px-4 py-3 font-semibold text-navy">{item.title}</td>
                    <td className="px-4 py-3 text-steel font-mono text-[11px] max-w-[200px] truncate" title={item.filename}>
                      {item.filename}
                    </td>
                    <td className="px-4 py-3 text-steel font-mono">
                      {formatFileSize(item.size)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-navy hover:text-orange"
                      >
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="font-semibold text-navy hover:text-orange cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg space-y-4 rounded-lg border border-line bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-navy">
                {editing ? `Edit ${label}` : `Add ${label} (50MB Chunk Upload)`}
              </h3>
              <span className="rounded bg-orange-soft/20 px-2 py-0.5 text-[10px] font-bold text-orange">
                Max 50MB PDF
              </span>
            </div>

            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-navy">
                  Document Title <span className="text-red-500">*</span>
                  <input
                    required
                    value={title}
                    disabled={saving}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Inovance MD500 AC Drive Technical Manual"
                    className="mt-1 w-full border border-line px-3 py-2 text-sm focus:border-navy focus:outline-hidden"
                  />
                </label>
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-navy">
                  Sort Order
                  <input
                    type="number"
                    value={order}
                    disabled={saving}
                    onChange={(e) => setOrder(Number(e.target.value) || 0)}
                    className="mt-1 w-full border border-line px-3 py-2 text-sm focus:border-navy focus:outline-hidden"
                  />
                </label>
              </div>
            </div>

            {/* Drag & Drop Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                PDF File {editing ? "(Optional: leave empty to retain current PDF)" : <span className="text-red-500">*</span>}
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition cursor-pointer ${
                  isDragging
                    ? "border-orange bg-orange-soft/10"
                    : file
                    ? "border-emerald-500 bg-emerald-50/40"
                    : "border-slate-300 hover:border-slate-400 bg-paper/40"
                }`}
                onClick={() => {
                  if (!saving) document.getElementById("file-input-modal")?.click();
                }}
              >
                <input
                  id="file-input-modal"
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={saving}
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-emerald-600 font-bold text-sm">
                      <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {file.name}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Size: {formatFileSize(file.size)} | Direct Chunking Ready
                    </p>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <svg className="mx-auto h-8 w-8 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-xs text-slate-700 font-medium">
                      Drag and drop your PDF here, or <span className="text-orange font-bold">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Standard PDF documents up to 50 MB (automatic 2.49MB chunk slicing)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Real-Time Progress Bar */}
            {uploadProgress !== null && (
              <div className="rounded-lg border border-orange-soft/40 bg-orange-soft/10 p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-bold text-navy">
                  <span>{uploadStatusText || "Uploading..."}</span>
                  <span className="font-mono text-orange">{uploadProgress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-orange to-orange-bright transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Streaming directly to MongoDB GridFS. Please do not close or navigate away.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2.5 border-t border-line pt-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => setModalOpen(false)}
                className="border border-line px-4 py-2 text-xs font-bold uppercase tracking-wider text-navy hover:bg-paper transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-orange px-5 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save {label}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
