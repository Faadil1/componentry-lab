"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

import { cn } from "@/lib/utils"
import { SITE_NAVIGATION, getActiveNavigationItem, SiteNavigationItem, getSurfaceContext } from "@/lib/navigation"

export interface LabNavigationProps {
  className?: string
  linkClassName?: string
  activeClassName?: string
  inactiveClassName?: string
  compact?: boolean
  projectId?: string | null
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
        "inline-flex items-center border-b-2 border-transparent font-mono uppercase tracking-[0.12em] transition-colors focus-visible:outline-none",
        compact ? "px-1.5 py-1.5 text-[10px]" : "px-2 py-2 text-[11px]",
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
  activeClassName = "border-blue-600 text-neutral-950",
  inactiveClassName = "border-transparent text-stone-500 hover:border-stone-400 hover:text-neutral-950",
  compact = false,
  projectId,
}: LabNavigationProps) {
  const pathname = usePathname()
  const routeProjectId = pathname.startsWith("/projects/") || pathname.startsWith("/film-kit/") ? pathname.split("/")[2] : null
  const activeProjectId = projectId ?? routeProjectId

  const coreLinks = useMemo(() => SITE_NAVIGATION.filter((item) => item.group === "CORE"), [])
  const workspaceLinks = useMemo(() => SITE_NAVIGATION.filter((item) => item.group === "WORKSPACE"), [])
  const labLinks = useMemo(() => SITE_NAVIGATION.filter((item) => item.group === "LAB"), [])

  const groupedLabs = useMemo(() => {
    const groups: Record<string, SiteNavigationItem[]> = {}
    labLinks.forEach((link) => {
      const group = link.subGroup || "Other"
      if (!groups[group]) groups[group] = []
      groups[group].push(link)
    })
    return Object.entries(groups).map(([label, links]) => ({ label, links }))
  }, [labLinks])

  const activeItem = getActiveNavigationItem(pathname)
  const surface = getSurfaceContext(pathname)

  const preserveProjectHref = (href: string) => {
    if (!activeProjectId) return href
    if (href === "/" || href === "/projects" || href.startsWith("/film-kit")) {
      const separator = href.includes("?") ? "&" : "?"
      return `${href}${separator}project=${encodeURIComponent(activeProjectId)}`
    }
    return href
  }

  return (
    <div className={cn("min-w-0", compact ? "space-y-1.5" : "space-y-2.5", className)}>
      <nav className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between" aria-label="Primary navigation">
        <div className="flex min-w-0 items-end gap-4">
          <div className="shrink-0 border-r border-stone-300 pr-4">
            <p className="cl-kicker text-stone-500">{surface.brand}</p>
            <h1 className="mt-1 font-sans text-sm font-semibold tracking-tight text-neutral-950 sm:text-base">{surface.title}</h1>
          </div>

          <div className="hidden min-w-0 items-center gap-1 lg:flex">
            <span className="mr-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Core</span>
            {coreLinks.map((link) => (
              <NavLinkButton
                key={link.href}
                href={preserveProjectHref(link.href)}
                label={link.label}
                isActive={activeItem?.id === link.id}
                linkClassName={linkClassName}
                activeClassName={activeClassName}
                inactiveClassName={inactiveClassName}
                compact={compact}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex flex-wrap items-center gap-1 lg:hidden">
            {coreLinks.map((link) => (
              <NavLinkButton
                key={link.href}
                href={preserveProjectHref(link.href)}
                label={link.label}
                isActive={activeItem?.id === link.id}
                linkClassName={linkClassName}
                activeClassName={activeClassName}
                inactiveClassName={inactiveClassName}
                compact={true}
              />
            ))}
          </div>

          {workspaceLinks.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 border-l border-stone-300 pl-2">
              <span className="mr-1 hidden font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:inline">Workspace</span>
              {workspaceLinks.map((link) => (
                <NavLinkButton
                  key={link.href}
                  href={preserveProjectHref(link.href)}
                  label={link.label}
                  isActive={activeItem?.id === link.id}
                  linkClassName={linkClassName}
                  activeClassName={activeClassName}
                  inactiveClassName={inactiveClassName}
                  compact={compact}
                />
              ))}
            </div>
          ) : null}
        </div>
      </nav>

      <details className="group border-y border-stone-300 bg-transparent py-1.5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-stone-500 focus-visible:outline-none">
          <span>Labs / reference surfaces</span>
          <span className="text-stone-400 group-open:hidden">Open +</span>
          <span className="hidden text-stone-400 group-open:inline">Close −</span>
        </summary>
        <div className={cn("grid gap-px border-t border-stone-200 bg-stone-200", compact ? "mt-1.5" : "mt-2.5", "md:grid-cols-2 xl:grid-cols-4")}>
          {groupedLabs.map((group) => (
            <section key={group.label} className="bg-stone-50 p-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">{group.label}</p>
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                {group.links.map((link) => (
                  <NavLinkButton
                    key={link.href}
                    href={preserveProjectHref(link.href)}
                    label={link.label}
                    isActive={activeItem?.id === link.id}
                    linkClassName={cn("px-0.5 py-1", linkClassName)}
                    activeClassName={activeClassName}
                    inactiveClassName={inactiveClassName}
                    compact={true}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </details>
    </div>
  )
}
