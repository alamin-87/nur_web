"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Analytics({ gaId }: { gaId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaId || typeof window === "undefined") return;
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("config", gaId, { page_path: pathname });
  }, [gaId, pathname]);

  if (!gaId) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
        }}
      />
    </>
  );
}
