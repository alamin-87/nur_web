"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DashboardIcon,
  ProductsIcon,
  PlusCircleIcon,
  FolderIcon,
  TagIcon,
  NewspaperIcon,
  EditPenIcon,
  BookmarkIcon,
  ImageIcon,
  SettingsIcon,
  PaletteIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  SlidersIcon,
  UsersIcon,
  ActivityIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  FileTextIcon,
} from "@/components/admin/AdminIcons";

import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface NavSingleItem {
  type: "link";
  label: string;
  href: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface NavAccordionItem {
  type: "accordion";
  label: string;
  baseHref: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  children: {
    label: string;
    href: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }[];
}

type NavEntry = NavSingleItem | NavAccordionItem;

interface NavGroup {
  title: string;
  entries: NavEntry[];
}

const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    entries: [
      { type: "link", label: "Dashboard", href: "/admin/dashboard", Icon: DashboardIcon },
    ],
  },
  {
    title: "PRODUCT CATALOG",
    entries: [
      { type: "link", label: "All Products", href: "/admin/products", Icon: ProductsIcon },
      { type: "link", label: "Add Product", href: "/admin/products/new", Icon: PlusCircleIcon },
      { type: "link", label: "Categories", href: "/admin/categories", Icon: FolderIcon },
      { type: "link", label: "Brands", href: "/admin/brands", Icon: TagIcon },
    ],
  },
  {
    title: "SERVICES & FEATURES",
    entries: [
      { type: "link", label: "Company Services", href: "/admin/services", Icon: SlidersIcon },
      { type: "link", label: "Special Features", href: "/admin/features", Icon: TagIcon },
      { type: "link", label: "About", href: "/admin/about", Icon: FileTextIcon },
    ],
  },
  {
    title: "CONTENT & BLOG",
    entries: [
      { type: "link", label: "Blog Posts", href: "/admin/blogs", Icon: NewspaperIcon },
      { type: "link", label: "Add Blog Post", href: "/admin/blogs/new", Icon: EditPenIcon },
      { type: "link", label: "Blog Categories", href: "/admin/blogs/categories", Icon: BookmarkIcon },
    ],
  },
  {
    title: "ASSETS & MEDIA",
    entries: [
      { type: "link", label: "Media Library", href: "/admin/media", Icon: ImageIcon },
      { type: "link", label: "Downloads", href: "/admin/downloads", Icon: FolderIcon },
    ],
  },
  {
    title: "SETTINGS & CONFIG",
    entries: [
      {
        type: "accordion",
        label: "Website Settings",
        baseHref: "/admin/settings",
        Icon: SettingsIcon,
        children: [
          { label: "Logo & Branding", href: "/admin/settings?tab=branding", Icon: PaletteIcon },
          { label: "Header & Contacts", href: "/admin/settings?tab=header", Icon: PhoneIcon },
          { label: "Location & Maps", href: "/admin/settings?tab=location", Icon: MapPinIcon },
          { label: "Contact Page", href: "/admin/settings?tab=contact", Icon: FileTextIcon },
          { label: "Social Links", href: "/admin/settings?tab=social", Icon: GlobeIcon },
          { label: "Hero Banners", href: "/admin/settings?tab=hero", Icon: ImageIcon },
          { label: "General & SEO", href: "/admin/settings?tab=general", Icon: SlidersIcon },
          { label: "Footer & QR Codes", href: "/admin/settings?tab=footer", Icon: SettingsIcon },
        ],
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    entries: [
      { type: "link", label: "User Management", href: "/admin/users", Icon: UsersIcon },
      { type: "link", label: "Activity Logs", href: "/admin/logs", Icon: ActivityIcon },
    ],
  },
];

export function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "branding";

  // Auto-expand settings accordion if user is currently on settings page
  const isSettingsActive = pathname.startsWith("/admin/settings");
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.logoUrl || data.settings?.logo) {
          setLogoUrl(data.settings.logoUrl || data.settings.logo);
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogoSelect(newUrl: string) {
    setLogoUrl(newUrl);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            logoUrl: newUrl,
            logo: newUrl,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to update logo:", err);
    }
  }

  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true);
    }
  }, [isSettingsActive]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-line bg-[#071422] text-white transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              title="Click to upload/change NES Logo"
              className="group relative grid h-10 w-10 shrink-0 place-items-center rounded bg-orange font-display text-base font-bold text-white shadow-sm overflow-hidden hover:opacity-90 transition cursor-pointer"
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="NES Logo"
                  className="h-full w-full object-contain p-0.5 bg-white"
                />
              ) : (
                <span>NES</span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition text-[9px] font-bold text-white uppercase tracking-tighter">
                Upload
              </span>
            </button>
            {!collapsed && (
              <Link href="/admin/dashboard" className="flex flex-col leading-tight">
                <span className="font-display text-sm font-bold tracking-wider text-white hover:text-orange transition">
                  NUR CMS
                </span>
                <span className="text-[10px] text-white/50 tracking-wide">ADMIN PANEL</span>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="hidden h-7 w-7 items-center justify-center rounded border border-white/15 text-white/70 hover:bg-white/10 lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.entries.map((entry) => {
                  if (entry.type === "link") {
                    const ItemIcon = entry.Icon;
                    const isExact = pathname === entry.href;
                    const isChild =
                      entry.href === "/admin/dashboard"
                        ? pathname === "/admin"
                        : entry.href === "/admin/products"
                        ? pathname.startsWith("/admin/products/") && pathname !== "/admin/products/new"
                        : entry.href === "/admin/blogs"
                        ? pathname.startsWith("/admin/blogs/") &&
                          pathname !== "/admin/blogs/new" &&
                          !pathname.startsWith("/admin/blogs/categories")
                        : false;
                    const active = isExact || isChild;

                    return (
                      <Link
                        key={entry.href}
                        href={entry.href}
                        onClick={onMobileClose}
                        className={`group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition ${
                          active
                            ? "bg-orange text-white font-semibold shadow-xs"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? entry.label : undefined}
                      >
                        <ItemIcon
                          size={18}
                          className={`shrink-0 transition ${
                            active ? "text-white" : "text-white/70 group-hover:text-white"
                          }`}
                        />
                        {!collapsed && <span className="truncate">{entry.label}</span>}
                      </Link>
                    );
                  }

                  // Accordion Menu (Website Settings)
                  if (entry.type === "accordion") {
                    const GroupIcon = entry.Icon;
                    const isGroupActive = pathname.startsWith(entry.baseHref);

                    return (
                      <div key={entry.label} className="space-y-1">
                        {collapsed ? (
                          <Link
                            href="/admin/settings?tab=branding"
                            onClick={onMobileClose}
                            className={`group flex w-full items-center justify-center rounded-md px-3 py-2 text-xs font-medium transition ${
                              isGroupActive
                                ? "bg-orange text-white font-semibold shadow-xs"
                                : "text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                            title={entry.label}
                          >
                            <GroupIcon
                              size={18}
                              className={`shrink-0 transition ${
                                isGroupActive ? "text-white" : "text-white/70 group-hover:text-white"
                              }`}
                            />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSettingsOpen((prev) => !prev)}
                            className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition ${
                              isGroupActive && !settingsOpen
                                ? "bg-orange/20 text-orange font-semibold border border-orange/40"
                                : isGroupActive
                                ? "bg-white/10 text-white font-semibold"
                                : "text-white/75 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <GroupIcon
                                size={18}
                                className={`shrink-0 transition ${
                                  isGroupActive ? "text-orange" : "text-white/70 group-hover:text-white"
                                }`}
                              />
                              <span className="truncate font-semibold">{entry.label}</span>
                            </div>

                            <ChevronDownIcon
                              size={14}
                              className={`shrink-0 text-white/50 transition-transform duration-200 ${
                                settingsOpen ? "rotate-180 text-white" : ""
                              }`}
                            />
                          </button>
                        )}

                        {/* Collapsible Submenu */}
                        {!collapsed && settingsOpen && (
                          <div className="ml-3.5 space-y-0.5 border-l border-white/15 pl-2.5 pt-1">
                            {entry.children.map((child) => {
                              const ChildIcon = child.Icon;
                              const targetTab = new URL(
                                child.href,
                                "http://local"
                              ).searchParams.get("tab");
                              const isChildActive =
                                isSettingsActive && currentTab === targetTab;

                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={onMobileClose}
                                  className={`group flex items-center gap-2.5 rounded px-2.5 py-1.5 text-[11.5px] transition ${
                                    isChildActive
                                      ? "bg-orange text-white font-semibold shadow-xs"
                                      : "text-white/70 hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  <ChildIcon
                                    size={15}
                                    className={`shrink-0 ${
                                      isChildActive
                                        ? "text-white"
                                        : "text-white/50 group-hover:text-white"
                                    }`}
                                  />
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Live Website Link */}
        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2.5 rounded bg-white/5 px-3 py-2 text-xs font-medium text-white/70 hover:bg-orange hover:text-white transition ${
              collapsed ? "justify-center" : ""
            }`}
            title="View Live Public Website"
          >
            <ExternalLinkIcon size={16} className="shrink-0" />
            {!collapsed && <span>View Live Site</span>}
          </Link>
        </div>
      </aside>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleLogoSelect}
      />
    </>
  );
}
