import Link from "next/link";

export type PublicDownloadItem = {
  _id: string;
  title: string;
  filename: string;
  size: number;
  downloadUrl: string;
};

function formatSize(bytes: number) {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadFileList({
  items,
  emptyLabel,
}: {
  items: PublicDownloadItem[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return (
      <div className="border border-line bg-white px-5 py-10 text-center text-sm text-steel">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line/70 border border-line bg-white">
      {items.map((item) => (
        <li
          key={item._id}
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-bold uppercase tracking-wide text-navy">
              {item.title}
            </h2>
            <p className="mt-1 truncate text-xs text-steel">
              {item.filename}
              {item.size ? ` · ${formatSize(item.size)}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <a
              href={`${item.downloadUrl}?view=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-navy transition hover:border-orange hover:text-orange"
            >
              View
            </a>
            <a
              href={item.downloadUrl}
              className="btn-orange px-3 py-2 text-[11px] font-bold uppercase tracking-wider"
            >
              Download
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DownloadBreadcrumb({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-steel">
      <Link href="/" className="transition hover:text-orange">
        Home
      </Link>
      <span>/</span>
      <span>Download</span>
      <span>/</span>
      <span className="font-semibold text-navy">{current}</span>
    </div>
  );
}
