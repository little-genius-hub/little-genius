import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Nunito } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/store/app-context"
import { PWAInstaller } from "@/components/common/pwa-installer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })

export const metadata: Metadata = {
  title: "Little Genius - Educational Games for Kids",
  description: "Fun educational games and stories for children with bilingual support",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Little Genius",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Little Genius",
    title: "Little Genius - Educational Games for Kids",
    description: "Fun educational games and stories for children with bilingual support",
  },
  twitter: {
    card: "summary",
    title: "Little Genius - Educational Games for Kids",
    description: "Fun educational games and stories for children with bilingual support",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} ${nunito.variable} font-nunito`}>
        <AppProvider>
          {children}
          <PWAInstaller />
          <Toaster />
        </AppProvider>
      </body>
    </html>
  )
}
