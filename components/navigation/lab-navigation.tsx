"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SITE_NAVIGATION, getActiveNavigationItem, SiteNavigationItem, getSurfaceContext } from "@/lib/navigation"
import { useMemo } from "react"

export interface LabNavigationProps {
  className?: string
  linkClassName?: string
  activeClassName?: string
  inactiveClassName?: string
  compact?: boolean
}

function NavLinkButton({
  href,
  label,
  isActive,
  linkClassName,
  activeClassName,
  inactiveClassName,
  compact,
}: {
  href: string
  label: string
  isActive: boolean
  linkClassName?: string
  activeClassName: string
  inactiveClassName: string
  compact?: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70",
        compact ? "px-2.5 py-1 text-xs font-medium" : "px-3.5 py-2 text-sm font-medium leading-none",
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
  compact = false,
}: LabNavigationProps) {
  const pathname = usePathname()

  const coreLinks = useMemo(() => SITE_NAVIGATION.filter(item => item.group === "CORE"), [])
  const workspaceLinks = useMemo(() => SITE_NAVIGATION.filter(item => item.group === "WORKSPACE"), [])
  const labLinks = useMemo(() => SITE_NAVIGATION.filter(item => item.group === "LAB"), [])

  const groupedLabs = useMemo(() => {
    const groups: Record<string, SiteNavigationItem[]> = {}
    labLinks.forEach(link => {
      const g = link.subGroup || "Other"
      if (!groups[g]) groups[g] = []
      groups[g].push(link)
    })
    return Object.entries(groups).map(([label, links]) => ({ label, links }))
  }, [labLinks])

  const activeItem = getActiveNavigationItem(pathname)
  const surface = getSurfaceContext(pathname)

  return (
    <div className={cn("flex flex-col min-w-0", compact ? "gap-1.5" : "gap-3", className)}>
      <nav className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-xs" aria-label="Primary navigation">
        
        {/* Global Context Header */}
        <div className="flex flex-col sm:mr-4">
           <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500 opacity-90 font-bold">{surface.brand}</p>
           <h1 className="text-sm sm:text-base font-bold tracking-tight opacity-95">{surface.title}</h1>
        </div>

        {/* Navigation Core / Workspace wrapper */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Core Navigation */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 mr-1 hidden sm:inline-block">Core</span>
            {coreLinks.map((link) => {
              const isActive = activeItem?.id === link.id
              return (
                <NavLinkButton
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={isActive}
                  linkClassName={linkClassName}
                  activeClassName={activeClassName}
                  inactiveClassName={inactiveClassName}
                  compact={compact}
                />
              )
            })}
          </div>

          {/* Workspace Separator */}
          {workspaceLinks.length > 0 && (
            <>
              <div className="w-px h-4 bg-stone-300 mx-1 hidden sm:block opacity-50" aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 mr-1 hidden sm:inline-block">Workspace</span>
                {workspaceLinks.map((link) => {
                  const isActive = activeItem?.id === link.id
                  return (
                    <NavLinkButton
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      isActive={isActive}
                      linkClassName={cn(linkClassName, "font-mono tracking-tight text-stone-600 font-bold")}
                      activeClassName={activeClassName}
                      inactiveClassName={inactiveClassName}
                      compact={compact}
                    />
                  )
                })}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Labs Menu */}
      <details className={cn("group border border-stone-300 bg-white/70 shadow-xs backdrop-blur-sm", compact ? "rounded-lg p-1.5 text-[11px]" : "rounded-xl p-2.5")}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2 py-0.5 font-medium uppercase tracking-[0.18em] text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/70">
          <span className={compact ? "text-[10px]" : "text-[11px]"}>Labs menu</span>
          <span className="text-[9px] tracking-[0.22em] text-stone-400 group-open:hidden">Open</span>
          <span className="hidden text-[9px] tracking-[0.22em] text-stone-400 group-open:inline">Close</span>
        </summary>
        <div className={cn("grid gap-2.5 md:grid-cols-2 xl:grid-cols-4", compact ? "mt-1.5 text-xs" : "mt-2.5")}>
          {groupedLabs.map((group) => (
            <section key={group.label} className={cn("rounded-lg border border-stone-200 bg-stone-50 p-2.5", compact ? "space-y-1 p-2" : "space-y-1.5 p-2.5")}>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.links.map((link) => {
                  const isActive = activeItem?.id === link.id
                  return (
                    <NavLinkButton
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      isActive={isActive}
                      linkClassName={cn("text-[10px] px-2 py-0.5", linkClassName)}
                      activeClassName={activeClassName}
                      inactiveClassName={inactiveClassName}
                      compact={true}
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