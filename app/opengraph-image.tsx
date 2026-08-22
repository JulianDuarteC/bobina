import { ImageResponse } from "next/og";

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
          alignItems: "center",
          justifyContent: "center",
          background: "#1A0B10",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#E8B04B",
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Ahora en cartelera
        </div>
        <div
          style={{
            fontSize: 96,
            color: "#F3EADA",
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          BOBINA
        </div>
        <div style={{ fontSize: 28, color: "#F3EADA", opacity: 0.8, marginTop: 24 }}>
          Tu diario de cine
        </div>
      </div>
    ),
    { ...size }
  );
}
