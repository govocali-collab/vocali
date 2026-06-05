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

  const [interRegular, playfairBold] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-400-normal.woff2").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.8/files/playfair-display-latin-700-normal.woff2").then((r) => r.arrayBuffer()),
  ])

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
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 120,
              fontWeight: 700,
              color: "#1A1714",
              fontFamily: "Playfair Display, serif",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Vocali
          </span>
          <span
            style={{
              fontSize: 120,
              fontWeight: 700,
              color: "#C9A864",
              fontFamily: "Playfair Display, serif",
              lineHeight: 1,
              marginLeft: 2,
            }}
          >
            .
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 48,
            height: 2,
            background: "#C9A864",
            borderRadius: 999,
            marginBottom: 36,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: "#6B6460",
            textAlign: "center",
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          {isFr
            ? "Réceptionniste IA 24/7 pour cliniques esthétiques au Québec"
            : "24/7 AI Receptionist for Aesthetic Clinics in Quebec"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Playfair Display", data: playfairBold, weight: 700, style: "normal" },
      ],
    },
  )
}
