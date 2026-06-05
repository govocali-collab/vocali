import { ImageResponse } from "next/og"

export const alt = "Vocali"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isFr = lang !== "en"

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
          background: "#FAF8F4",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 20,
            background: "#F0E6D3",
            border: "2px solid #C9A864",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <span style={{ fontSize: 64, fontWeight: 900, color: "#C9A864", lineHeight: 1 }}>
            V
          </span>
        </div>

        {/* Brand name */}
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 24 }}>
          <span style={{ fontSize: 96, fontWeight: 900, color: "#1A1714", letterSpacing: "-3px", lineHeight: 1 }}>
            Vocali
          </span>
          <span style={{ fontSize: 96, fontWeight: 900, color: "#C9A864", lineHeight: 1, marginLeft: 4 }}>
            .
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 48, height: 2, background: "#C9A864", borderRadius: 999, marginBottom: 32 }} />

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: "#6B6460",
            textAlign: "center",
            maxWidth: 620,
            lineHeight: 1.5,
          }}
        >
          {isFr
            ? "Réceptionniste IA 24/7 pour cliniques esthétiques au Québec"
            : "24/7 AI Receptionist for Aesthetic Clinics in Quebec"}
        </div>
      </div>
    ),
    size,
  )
}
