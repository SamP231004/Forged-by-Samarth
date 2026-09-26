import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b0b0f",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(139,92,246,0.35), transparent 50%), radial-gradient(circle at 100% 100%, rgba(56,189,248,0.25), transparent 50%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#fafafa",
              color: "#0b0b0f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            SP
          </div>
          <div style={{ fontSize: 28, color: "#a1a1aa" }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, maxWidth: 980 }}>
            Turning your ideas into production-ready software.
          </div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#a1a1aa" }}>
            Independent full stack developer · Web · Mobile · APIs · Cloud
          </div>
        </div>
      </div>
    ),
    size,
  );
}
