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
  title: 'TG World | Premium Car Dealership',
  description: 'Discover premium vehicles at TG World. We offer top-selling cars, upcoming arrivals, and the finest selection of luxury and reliable vehicles.',
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
