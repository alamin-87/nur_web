import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/data";

export const alt = "Nur Engineering Solution";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const site = await getSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "linear-gradient(145deg, #07182b 0%, #0a2540 50%, #123556 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            border: "4px solid #e86a12",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          NES
        </div>
        <div style={{ marginTop: 28, fontSize: 54, fontWeight: 700, textTransform: "uppercase" }}>
          {site.brandName}
        </div>
        <div style={{ marginTop: 16, fontSize: 24, color: "#f4842f" }}>
          {site.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
