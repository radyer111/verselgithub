import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Vercel教程项目',
  description: 'Vercel教程项目',
  generator: 'Vercel教程项目',
  keywords: ['Vercel', '教程', '项目'],
  authors: [{ name: 'Vercel', url: 'https://vercel.com' }],
  creator: 'Vercel',
  publisher: 'Vercel',
  openGraph: {
    title: 'Vercel教程项目',
    description: 'Vercel教程项目',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
