import type { Metadata } from "next";
import { CatalogShell } from "@/components/CatalogShell";
import { DownloadBreadcrumb, DownloadFileList } from "@/components/DownloadFileList";
import { RelatedSearch } from "@/components/RelatedSearch";
import { connectDB } from "@/lib/db";
import { DownloadFile } from "@/lib/models";
import { getCategories, getSettings } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return buildPageMetadata({
    site,
    title: "User Manual",
    description: "Download user manuals from Nur Engineering Solution.",
    path: "/user-manual",
  });
}

export default async function UserManualPage() {
  const [categories, items] = await Promise.all([
    getCategories("product"),
    loadItems(),
  ]);

  return (
    <CatalogShell categories={categories} showSearch={false}>
      <div className="border-b border-line pb-5">
        <DownloadBreadcrumb current="User Manual" />
        <h1 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tight text-navy sm:text-3xl">
          User Manual
        </h1>
        <p className="mt-2 max-w-2xl text-xs text-steel sm:text-sm">
          Download user manuals as PDF. Each file can be viewed or saved separately.
        </p>
      </div>
      <DownloadFileList items={items} emptyLabel="No user manuals are available for download yet." />
      <RelatedSearch currentHref="/user-manual" />
    </CatalogShell>
  );
}

async function loadItems() {
  try {
    const db = await connectDB();
    if (!db) return [];
    const docs = await DownloadFile.find({ kind: "manual" })
      .sort({ order: 1, createdAt: -1 })
      .lean<Array<{ _id: unknown; title: string; filename: string; size: number }>>();
    return docs.map((doc) => ({
      _id: String(doc._id),
      title: doc.title,
      filename: doc.filename,
      size: doc.size,
      downloadUrl: `/api/downloads/${String(doc._id)}/file`,
    }));
  } catch {
    return [];
  }
}
