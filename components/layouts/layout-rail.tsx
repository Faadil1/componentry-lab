import * as React from "react"

interface LayoutRailProps extends React.HTMLAttributes<HTMLDivElement> {
  snap?: boolean
  paddingStart?: boolean
  paddingEnd?: boolean
  children: React.ReactNode
}

export function LayoutRail({
  snap = false,
  paddingStart = true,
  paddingEnd = true,
  children,
  className = "",
  ...props
}: LayoutRailProps) {
  const containerClasses = [
    "flex overflow-x-auto min-w-0 w-full select-none no-scrollbar",
    snap ? "scroll-x scroll-smooth snap-x snap-mandatory" : "",
    paddingStart ? "ps-4 md:ps-6 lg:ps-8" : "",
    paddingEnd ? "pe-4 md:pe-6 lg:pe-8" : "",
    className,
  ].filter(Boolean).join(" ")

  return (
    <div
      className={containerClasses}
      style={{ WebkitOverflowScrolling: "touch" }}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null
        return (
          <div className={`shrink-0 ${snap ? "snap-start" : ""}`}>
            {child}
          </div>
        )
      })}
    </div>
  )
}
