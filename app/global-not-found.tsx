import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - SweetShop",
  robots: "noindex",
};

export default function GlobalNotFound() {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, padding: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #fdf9f0 0%, #faf5e8 100%)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 400, padding: "0 16px" }}>
            <p style={{ fontSize: 52, margin: "0 0 16px 0" }}>🚨</p>
            <h1
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#6b5010",
                margin: "0 0 8px 0",
              }}
            >
              404
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#a09880",
                margin: "0 0 24px 0",
                lineHeight: 1.6,
              }}
            >
              beyond别太过分了宝贝，再搞我报警了！
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 28px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #ebd9af, #b8942f)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
            >
              返回首页
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
