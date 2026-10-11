"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { ISiteSettings, IUseCase } from "@/lib/models";

type SiteContextValue = {
  settings: ISiteSettings;
  useCases: IUseCase[];
  updateSettings?: (newSettings: Partial<ISiteSettings>) => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({
  settings: initialSettings,
  useCases,
  children,
}: {
  settings: ISiteSettings;
  useCases: IUseCase[];
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<ISiteSettings>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  // Client-side dynamic synchronization for live logo, favicon and branding updates
  useEffect(() => {
    let lastFetchAt = 0;
    function fetchLatestSettings() {
      if (Date.now() - lastFetchAt < 60_000) return;
      lastFetchAt = Date.now();
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            setSettings((prev) => ({
              ...prev,
              ...data.settings,
              logoUrl: data.settings.logoUrl || data.settings.logo || prev.logoUrl,
              footerLogoUrl: data.settings.footerLogoUrl ?? prev.footerLogoUrl,
              favicon: data.settings.favicon || prev.favicon,
            }));

            // Dynamically update document favicon links in real time
            const favUrl = data.settings.favicon;
            if (favUrl) {
              const rels = ["icon", "shortcut icon", "apple-touch-icon"];
              rels.forEach((rel) => {
                let link: HTMLLinkElement | null = document.querySelector(`link[rel='${rel}']`);
                if (!link) {
                  link = document.createElement("link");
                  link.rel = rel;
                  document.head.appendChild(link);
                }
                link.href = favUrl;
              });
            }
          }
        })
        .catch(() => {});
    }

    // Initial settings are already server-rendered; refresh only when returning
    // to the tab, with a cooldown to avoid duplicate multi-megabyte requests.
    window.addEventListener("focus", fetchLatestSettings);
    return () => window.removeEventListener("focus", fetchLatestSettings);
  }, []);

  return (
    <SiteContext.Provider value={{ settings, useCases }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx.settings;
}

export function useUseCases() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useUseCases must be used within SiteProvider");
  return ctx.useCases;
}
