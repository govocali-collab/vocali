import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logoPath = path.join(process.cwd(), 'public', 'vocali-logo-black.png')
  const logoData = readFileSync(logoPath)
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    <div
      style={{
        background: '#FDFCF8',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={logoBase64}
        style={{
          maxWidth: '700px',
          maxHeight: '250px',
          objectFit: 'contain',
        }}
      />
    </div>,
    { width: 1200, height: 630 }
  )
}
