import * as React from "react"

interface LayoutShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  sidebarPosition?: "left" | "right"
}

export function LayoutShell({
  header,
  sidebar,
  footer,
  children,
  sidebarPosition = "left",
  className = "",
  ...props
}: LayoutShellProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`} {...props}>
      {header && <header className="w-full shrink-0">{header}</header>}

      <div className="flex-1 flex flex-row min-w-0 relative">
        {sidebar && sidebarPosition === "left" && (
          <aside className="shrink-0">{sidebar}</aside>
        )}

        <main className="flex-1 min-w-0">
          {children}
        </main>

        {sidebar && sidebarPosition === "right" && (
          <aside className="shrink-0">{sidebar}</aside>
        )}
      </div>

      {footer && <footer className="w-full shrink-0">{footer}</footer>}
    </div>
  )
}
