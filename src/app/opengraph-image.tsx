import { ImageResponse } from "next/og";
export const alt = "Shaun Denver Mathiasz — Travel, Commerce & Strategy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#090B0F",
        color: "#F4F0E8",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 70,
        borderBottom: "8px solid #C9A86A",
      }}
    >
      <div style={{ color: "#C9A86A", fontSize: 19, letterSpacing: 5 }}>
        TRAVEL · COMMERCE · STRATEGY
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 70,
          fontFamily: "serif",
        }}
      >
        <span>Beyond Destinations.</span>
        <span style={{ color: "#C9A86A" }}>Towards Possibilities.</span>
      </div>
      <div style={{ fontSize: 24 }}>
        SHAUN DENVER MATHIASZ / Travel Product Specialist
      </div>
    </div>,
    size,
  );
}
