import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter, Newsreader } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Componentry Lab",
    template: "%s · Componentry Lab",
  },
  description:
    "Componentry Lab is a library of capture-ready interactions, typography systems, and reusable primitives for prototypes, demos, and motion studies.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        newsreader.variable,
      )}
    >
      <body className="componentry-system min-h-full flex flex-col">{children}</body>
    </html>
  )
}
