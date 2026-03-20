import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Mono, Bebas_Neue } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Stack Rush — Competitive Pentomino Skill Game',
  description: 'Everyone gets the same pieces. The best player wins. 5-minute sessions, 13 pieces, ranked brackets.',
}

export const viewport: Viewport = {
  themeColor: '#f0c040',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${bebasNeue.variable} h-full`}>
      <body className="min-h-full bg-[#0a0a0a] text-[#ececec] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
