import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C3A2E",
          color: "#F5F0E8",
          fontSize: 118,
          fontStyle: "italic",
          fontWeight: 600,
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "-0.04em",
          borderRadius: 36,
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
