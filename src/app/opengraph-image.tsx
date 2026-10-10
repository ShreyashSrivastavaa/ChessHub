import { ImageResponse } from "next/og";
import { BUSINESS_CONFIG } from "@/config/business";

export const runtime = "edge";
export const alt = "ChessHub — Learn. Play. Improve.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0e0e10",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          color: "#f5f3ef",
          fontFamily: "sans-serif",
          border: "12px solid #1a1a1e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#cfa859",
            }}
          />
          <span
            style={{
              fontSize: "36px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#f5f3ef",
            }}
          >
            {BUSINESS_CONFIG.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "#f5f3ef",
              margin: 0,
            }}
          >
            {BUSINESS_CONFIG.tagline}
          </h1>
          <p
            style={{
              fontSize: "26px",
              color: "#dcd8d0",
              maxWidth: "850px",
              margin: 0,
            }}
          >
            Personalized 1:1 online chess coaching by Shreyash & Tapesnu.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #2e2e36",
            paddingTop: "24px",
            fontSize: "20px",
            color: "#a8a39a",
          }}
        >
          <div style={{ display: "flex", gap: "30px" }}>
            <span>Beginner: ₹500/session</span>
            <span style={{ color: "#cfa859" }}>·</span>
            <span>Advanced: ₹800/session</span>
          </div>
          <span style={{ color: "#cfa859" }}>chess-hub-six.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
