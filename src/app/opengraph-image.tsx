import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// 동적 OG 카드 — next/og(=@vercel/og) 로 SNS 공유 썸네일을 빌드/요청 시 생성한다.
export const alt = `${siteConfig.name} · ${siteConfig.role}`;
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
          justifyContent: "center",
          padding: "80px",
          background: "#101216",
          color: "#f1f3f6",
        }}
      >
        <div style={{ fontSize: 32, color: "#7e8593" }}>{siteConfig.role}</div>
        <div style={{ marginTop: 24, fontSize: 88, fontWeight: 700 }}>
          {siteConfig.name}
        </div>
        <div style={{ marginTop: 32, fontSize: 36, color: "#aab1bd" }}>
          {siteConfig.url.replace("https://", "")}
        </div>
      </div>
    ),
    size,
  );
}
