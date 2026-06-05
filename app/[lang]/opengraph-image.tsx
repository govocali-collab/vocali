import { ImageResponse } from "next/og"

export const alt = "Vocali"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  await params

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF8F4",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://vocali.ca/vocali-logo.png"
          width={560}
          height={140}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size,
  )
}
