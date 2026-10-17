import './globals.css'

export const metadata = {
  title: "SyncItUp — No Swiping, just Vibin'",
  description: 'The dating app that matches frequencies, not faces.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0b0d',
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=Unbounded:wght@500;800;900&family=Space+Grotesk:wght@400;500;700&display=swap'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <div className="phone">{children}</div>
      </body>
    </html>
  )
}
