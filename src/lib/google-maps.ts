/**
 * Universal Google Maps URL Resolver & Embed URL Generator
 * Supports:
 * - Shareable Short Links (maps.app.goo.gl, goo.gl/maps)
 * - Standard Google Maps URLs (google.com/maps/place/..., google.com/maps/@lat,lng, etc.)
 * - Search & Query URLs (maps.google.com/?q=..., /maps/search/...)
 * - Direct Embed URLs (google.com/maps/embed?pb=..., maps.google.com/maps?output=embed)
 * - Full <iframe> code snippets
 * - Structured address fallback
 */

export interface ParsedMapInfo {
  isValid: boolean;
  rawInput: string;
  cleanUrl: string;
  embedUrl: string;
  placeName?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  error?: string;
}

/**
 * Extracts URL from <iframe> snippet or trimmed string
 */
export function extractUrlFromInput(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // If input contains <iframe ... src="..." ...>
  const iframeSrcMatch = trimmed.match(/<iframe[^>]*\s+src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return iframeSrcMatch[1].trim();
  }

  // If input is wrapped in quotes
  const quoteMatch = trimmed.match(/^["'](.*)["']$/);
  if (quoteMatch && quoteMatch[1]) {
    return quoteMatch[1].trim();
  }

  return trimmed;
}

/**
 * Checks if a string looks like a Google Maps link or embed
 */
export function isGoogleMapsUrl(url: string): boolean {
  if (!url) return false;
  const clean = extractUrlFromInput(url).toLowerCase();
  return (
    clean.includes("maps.google.") ||
    clean.includes("google.com/maps") ||
    clean.includes("google.") && clean.includes("/maps") ||
    clean.includes("maps.app.goo.gl") ||
    clean.includes("goo.gl/maps") ||
    clean.startsWith("https://maps.") ||
    clean.startsWith("http://maps.")
  );
}

/**
 * Checks if URL is a shareable short URL
 */
export function isGoogleMapsShortUrl(url: string): boolean {
  if (!url) return false;
  const clean = extractUrlFromInput(url).toLowerCase();
  return clean.includes("maps.app.goo.gl") || clean.includes("goo.gl/maps");
}

/**
 * Parses any standard or embed Google Maps URL into an embed URL
 */
export function parseAndBuildEmbedUrl(
  input: string,
  customZoom?: number,
  fallbackAddress?: string
): ParsedMapInfo {
  const clean = extractUrlFromInput(input);

  if (!clean) {
    const defaultQuery = fallbackAddress || "House#43-44, Road-1, Block -B, Mirpur-1, Dhaka-1216";
    const z = customZoom || 16;
    const defaultEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(
      defaultQuery
    )}&t=&z=${z}&ie=UTF8&iwloc=&output=embed`;
    return {
      isValid: true,
      rawInput: input,
      cleanUrl: "",
      embedUrl: defaultEmbed,
      zoom: z,
      placeName: defaultQuery,
    };
  }

  // 1. Direct Google Maps Embed API URL (google.com/maps/embed?pb=...)
  if (clean.includes("/maps/embed") || clean.includes("google.com/maps/embed")) {
    return {
      isValid: true,
      rawInput: input,
      cleanUrl: clean,
      embedUrl: clean,
      zoom: customZoom,
    };
  }

  // 2. Already an output=embed format
  if (clean.includes("output=embed")) {
    let finalEmbed = clean;
    if (customZoom && !isNaN(customZoom)) {
      if (finalEmbed.includes("z=")) {
        finalEmbed = finalEmbed.replace(/z=\d+/, `z=${customZoom}`);
      } else {
        finalEmbed += `&z=${customZoom}`;
      }
    }
    return {
      isValid: true,
      rawInput: input,
      cleanUrl: clean,
      embedUrl: finalEmbed,
      zoom: customZoom,
    };
  }

  let placeName: string | undefined;
  let coordinates: { lat: number; lng: number } | undefined;
  let zoom = customZoom || 16;

  try {
    // 3. Google Maps Place URL: /maps/place/Place+Name/@lat,lng,zoomz/...
    const placeMatch = clean.match(/\/maps\/place\/([^/@?]+)(?:\/@([0-9.-]+),([0-9.-]+)(?:,([0-9.]+)z)?)?/i);
    if (placeMatch) {
      if (placeMatch[1]) {
        try {
          placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        } catch {
          placeName = placeMatch[1].replace(/\+/g, " ");
        }
      }
      if (placeMatch[2] && placeMatch[3]) {
        coordinates = {
          lat: parseFloat(placeMatch[2]),
          lng: parseFloat(placeMatch[3]),
        };
      }
      if (placeMatch[4] && !customZoom) {
        zoom = Math.round(parseFloat(placeMatch[4])) || 16;
      }

      const query = placeName || (coordinates ? `${coordinates.lat},${coordinates.lng}` : "");
      if (query) {
        return {
          isValid: true,
          rawInput: input,
          cleanUrl: clean,
          embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
          placeName,
          coordinates,
          zoom,
        };
      }
    }

    // 4. Google Maps Coordinates URL: /@lat,lng,zoomz
    const coordMatch = clean.match(/@([0-9.-]+),([0-9.-]+)(?:,([0-9.]+)z)?/i);
    if (coordMatch && coordMatch[1] && coordMatch[2]) {
      coordinates = {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2]),
      };
      if (coordMatch[3] && !customZoom) {
        zoom = Math.round(parseFloat(coordMatch[3])) || 16;
      }
      return {
        isValid: true,
        rawInput: input,
        cleanUrl: clean,
        embedUrl: `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
        coordinates,
        zoom,
      };
    }

    // 5. Query parameters (e.g. ?q=..., ?query=..., ?ll=..., ?cid=...)
    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
    } catch {
      // not a standard URL string
    }

    if (parsedUrl) {
      const q = parsedUrl.searchParams.get("q") || parsedUrl.searchParams.get("query");
      const cid = parsedUrl.searchParams.get("cid");
      const ll = parsedUrl.searchParams.get("ll");
      const zParam = parsedUrl.searchParams.get("z");

      if (zParam && !customZoom) {
        const parsedZ = parseInt(zParam, 10);
        if (!isNaN(parsedZ)) zoom = parsedZ;
      }

      if (cid) {
        return {
          isValid: true,
          rawInput: input,
          cleanUrl: clean,
          embedUrl: `https://maps.google.com/maps?cid=${encodeURIComponent(cid)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
          zoom,
        };
      }

      if (q) {
        return {
          isValid: true,
          rawInput: input,
          cleanUrl: clean,
          embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
          placeName: q,
          zoom,
        };
      }

      if (ll) {
        return {
          isValid: true,
          rawInput: input,
          cleanUrl: clean,
          embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(ll)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
          zoom,
        };
      }

      // Search URL path e.g. /maps/search/My+Place
      if (parsedUrl.pathname.includes("/maps/search/")) {
        const searchQuery = parsedUrl.pathname.replace(/^.*\/maps\/search\//, "").split("/")[0];
        if (searchQuery) {
          const decoded = decodeURIComponent(searchQuery.replace(/\+/g, " "));
          return {
            isValid: true,
            rawInput: input,
            cleanUrl: clean,
            embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(decoded)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
            placeName: decoded,
            zoom,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Error parsing Google Maps URL:", err);
  }

  // Fallback: If it starts with http, create search query embed from fallback address or the URL itself
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return {
      isValid: true,
      rawInput: input,
      cleanUrl: clean,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
        fallbackAddress || "House#43-44, Road-1, Block -B, Mirpur-1, Dhaka-1216"
      )}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
      zoom,
    };
  }

  return {
    isValid: false,
    rawInput: input,
    cleanUrl: clean,
    embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
      fallbackAddress || "House#43-44, Road-1, Block -B, Mirpur-1, Dhaka-1216"
    )}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`,
    error: "Invalid Google Maps URL format. Please paste a valid Google Maps link or iframe embed code.",
  };
}

/**
 * Server-side helper to resolve Google Maps short links (maps.app.goo.gl / goo.gl/maps)
 * by following HTTP redirects to get the canonical expanded URL.
 */
export async function resolveGoogleMapsUrlServer(
  rawInput: string,
  customZoom?: number,
  fallbackAddress?: string
): Promise<ParsedMapInfo> {
  const clean = extractUrlFromInput(rawInput);
  if (!clean) {
    return parseAndBuildEmbedUrl("", customZoom, fallbackAddress);
  }

  if (isGoogleMapsShortUrl(clean)) {
    try {
      const targetUrl = clean.startsWith("http") ? clean : `https://${clean}`;
      const res = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      let expandedUrl = res.url || targetUrl;

      // Also check if body has a canonical link or meta location
      if (res.ok && (!expandedUrl.includes("/place/") && !expandedUrl.includes("@"))) {
        const text = await res.text().catch(() => "");
        const canonicalMatch = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        if (canonicalMatch && canonicalMatch[1]) {
          expandedUrl = canonicalMatch[1];
        } else {
          const ogMatch = text.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
          if (ogMatch && ogMatch[1]) {
            expandedUrl = ogMatch[1];
          }
        }
      }

      const parsed = parseAndBuildEmbedUrl(expandedUrl, customZoom, fallbackAddress);
      return {
        ...parsed,
        rawInput,
        cleanUrl: expandedUrl,
      };
    } catch (err) {
      console.warn("Failed to resolve short Google Maps link:", err);
      // Fallback to client-side parser
      return parseAndBuildEmbedUrl(clean, customZoom, fallbackAddress);
    }
  }

  return parseAndBuildEmbedUrl(clean, customZoom, fallbackAddress);
}

/**
 * Safe client-side helper to ensure any map embed URL is always safe and valid
 */
export function getValidMapEmbedUrl(
  mapUrl?: string,
  zoomLevel?: number,
  fallbackAddress?: string
): string {
  if (!mapUrl || !mapUrl.trim()) {
    const addr = fallbackAddress || "House#43-44, Road-1, Block -B, Mirpur-1 (Beside Shah Ali Thana), Dhaka-1216";
    const z = zoomLevel && !isNaN(zoomLevel) ? zoomLevel : 16;
    return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&t=&z=${z}&ie=UTF8&iwloc=&output=embed`;
  }

  const parsed = parseAndBuildEmbedUrl(mapUrl, zoomLevel, fallbackAddress);
  return parsed.embedUrl;
}
