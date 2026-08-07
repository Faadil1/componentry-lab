"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavLink = {
  href: string
  label: string
}

const primaryLinks: NavLink[] = [
  { href: "/library", label: "Library" },
  { href: "/playbooks", label: "Playbooks" },
  { href: "/projects", label: "Projects" },
  { href: "/film-kit", label: "Film Kit" },
  { href: "/youtube", label: "YouTube OS" },
]

const groupedLabLinks: Array<{ label: string; links: NavLink[] }> = [
  {
    label: "Interaction labs",
    links: [
      { href: "/", label: "Spotlight Lab" },
      { href: "/split-flap", label: "Split Flap Lab" },
      { href: "/scrub-input", label: "Scrub Input Lab" },
      { href: "/kinetic-text", label: "Kinetic Text Lab" },
      { href: "/layouts", label: "Layouts" },
      { href: "/scroll-choreography", label: "Scroll Choreography Lab" },
      { href: "/webgl-liquid", label: "WebGL Liquid Lab" },
      { href: "/image-ripple", label: "Image Ripple Lab" },
    ],
  },
  {
    label: "System labs",
    links: [
      { href: "/typography", label: "Typography" },
      { href: "/foundations", label: "Foundations" },
      { href: "/player", label: "Interaction Player" },
      { href: "/decisions", label: "Decision Systems" },
      { href: "/capture", label: "Capture Systems" },
      { href: "/recipes", label: "Composition Recipes" },
    ],
  },
]

export interface LabNavigationProps {
  className?: string
  linkClassName?: string
  activeClassName?: string
  inactiveClassName?: string
}

function NavLinkButton({
  href,
  label,
  isActive,
  linkClassName,
  activeClassName,
  inactiveClassName,
}: NavLink & {
  isActive: boolean
  linkClassName?: string
  activeClassName: string
  inactiveClassName: string
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm font-medium leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70",
        linkClassName,
        isActive ? activeClassName : inactiveClassName,
      )}
    >
      {label}
    </Link>
  )
}

export function LabNavigation({
  className,
  linkClassName,
  activeClassName = "bg-neutral-950 text-white shadow-xs",
  inactiveClassName = "border border-stone-300 bg-stone-100/80 text-neutral-700 transition hover:border-neutral-500 hover:text-neutral-950",
}: LabNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <nav className="flex flex-wrap items-center gap-2 text-xs" aria-label="Primary navigation">
        {primaryLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <NavLinkButton
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={isActive}
              linkClassName={linkClassName}
              activeClassName={activeClassName}
              inactiveClassName={inactiveClassName}
            />
          )
        })}
      </nav>

      <details className="group rounded-2xl border border-stone-300 bg-white/70 p-3 shadow-xs backdrop-blur-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-1 text-xs font-medium uppercase tracking-[0.18em] text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70">
          <span>Labs menu</span>
          <span className="text-[10px] tracking-[0.22em] text-stone-400 group-open:hidden">Open</span>
          <span className="hidden text-[10px] tracking-[0.22em] text-stone-400 group-open:inline">Close</span>
        </summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {groupedLabLinks.map((group) => (
            <section key={group.label} className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
                  return (
                    <NavLinkButton
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      isActive={isActive}
                      linkClassName={cn("text-[11px]", linkClassName)}
                      activeClassName={activeClassName}
                      inactiveClassName={inactiveClassName}
                    />
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </details>
    </div>
  )
}