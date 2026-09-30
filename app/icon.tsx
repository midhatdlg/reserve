import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 22,
          fontStyle: "italic",
          fontWeight: 600,
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "-0.04em",
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
