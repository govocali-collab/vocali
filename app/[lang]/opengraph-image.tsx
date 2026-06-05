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

  // Load Inter from jsDelivr — supports French accented characters
  const [interRegular, interBold] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-400-normal.woff2").then((r) => r.arrayBuffer()),
    fetch("https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-700-normal.woff2").then((r) => r.arrayBuffer()),
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
          background: "linear-gradient(150deg, #FAF8F4 0%, #EDE0CA 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 18,
            background: "#F8F2EC",
            border: "2px solid #C9A864",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              color: "#C9A864",
              lineHeight: 1,
            }}
          >
            V
          </div>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: "#1C1916",
            letterSpacing: "-3px",
            marginBottom: 22,
          }}
        >
          Vocali
        </div>

        {/* Separator */}
        <div
          style={{
            width: 52,
            height: 2,
            background: "#C9A864",
            borderRadius: 999,
            marginBottom: 28,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#C9A864",
            textAlign: "center",
            maxWidth: 720,
            marginBottom: 16,
          }}
        >
          {isFr
            ? "Réceptionniste IA 24/7 pour cliniques esthétiques"
            : "24/7 AI Receptionist for Aesthetic Clinics"}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: "#7A7068",
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          {isFr
            ? "Ne manquez plus jamais un appel client. Au Québec."
            : "Never miss another client call. Across Quebec."}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
      ],
    },
  )
}
