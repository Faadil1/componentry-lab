"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const labLinks = [
  { href: "/library", label: "Library" },
  { href: "/", label: "Spotlight Lab" },
  { href: "/split-flap", label: "Split Flap Lab" },
  { href: "/scrub-input", label: "Scrub Input Lab" },
  { href: "/kinetic-text", label: "Kinetic Text Lab" },
  { href: "/typography", label: "Typography" },
  { href: "/foundations", label: "Foundations" },
  { href: "/layouts", label: "Layouts" },
  { href: "/scroll-choreography", label: "Scroll Choreography Lab" },
  { href: "/webgl-liquid", label: "WebGL Liquid Lab" },
  { href: "/image-ripple", label: "Image Ripple Lab" },
] as const

export interface LabNavigationProps {
  className?: string
  linkClassName?: string
  activeClassName?: string
  inactiveClassName?: string
}

export function LabNavigation({
  className,
  linkClassName,
  activeClassName = "bg-neutral-950 text-white shadow-xs",
  inactiveClassName = "border border-stone-300 bg-stone-100/80 text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950",
}: LabNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-wrap items-center gap-2 text-xs", className)} aria-label="Lab navigation">
      {labLinks.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70",
              linkClassName,
              isActive ? activeClassName : inactiveClassName
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
