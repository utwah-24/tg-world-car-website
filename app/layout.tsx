import React from "react"
import type { Metadata } from 'next'
import { Playfair_Display, Inter, Lato, Outfit } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-lato',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://tgworldtz.com'),
  title: 'TG World | Premium Car Dealership',
  description: 'Discover premium vehicles at TG World. We offer top-selling cars, upcoming arrivals, and the finest selection of luxury and reliable vehicles.',
  icons: {
    icon: '/tg-world-logo-proforma.png',
    apple: '/tg-world-logo-proforma.png',
  },
  openGraph: {
    title: 'TG World International | Premium Car Dealership',
    description: 'Discover premium vehicles at TG World. Top-selling cars, upcoming arrivals, and the finest selection of luxury and reliable vehicles.',
    url: 'https://tgworldtz.com',
    siteName: 'TG World International',
    images: [
      {
        url: '/tg-world_dark_logo.jpg',
        width: 1080,
        height: 756,
        alt: 'TG World International',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TG World International | Premium Car Dealership',
    description: 'Discover premium vehicles at TG World. Top-selling cars, upcoming arrivals, and the finest selection of luxury and reliable vehicles.',
    images: ['/tg-world_dark_logo.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} ${lato.variable} ${outfit.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
