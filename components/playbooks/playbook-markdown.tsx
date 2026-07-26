"use client"

// ─────────────────────────────────────────────────────────────
// Playbook Markdown Renderer
// Renders PlaybookMarkdownNode[] without dangerouslySetInnerHTML
// ─────────────────────────────────────────────────────────────

import type { PlaybookMarkdownNode, PlaybookInlineNode, PlaybookListItem } from "@/lib/playbooks"
import { cn } from "@/lib/utils"

// ── Inline renderer ───────────────────────────────────────────
function Inlines({ nodes }: { nodes: PlaybookInlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case "text":
            return <span key={i}>{node.value}</span>
          case "bold":
            return <strong key={i} className="font-semibold">{node.value}</strong>
          case "italic":
            return <em key={i} className="italic">{node.value}</em>
          case "code":
            return (
              <code
                key={i}
                className="rounded-sm bg-stone-100 px-1 py-0.5 font-mono text-[90%] text-stone-700"
              >
                {node.value}
              </code>
            )
          case "link":
            return (
              <a
                key={i}
                href={node.href}
                {...(node.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-neutral-950 underline underline-offset-2 hover:no-underline"
              >
                {node.label}
              </a>
            )
          case "arrow":
            return (
              <span key={i} className="mx-0.5 font-mono text-stone-400" aria-hidden="true">
                {node.value}
              </span>
            )
          default:
            return null
        }
      })}
    </>
  )
}

// ── List item renderer ────────────────────────────────────────
function ListItem({ item }: { item: PlaybookListItem }) {
  return (
    <li className="leading-relaxed">
      <Inlines nodes={item.inlines} />
      {item.children && item.children.length > 0 && (
        <ul className="mt-1 ml-4 flex flex-col gap-0.5">
          {item.children.map((child, i) => (
            <ListItem key={i} item={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

// ── Node renderer ─────────────────────────────────────────────
function Node({ node }: { node: PlaybookMarkdownNode }) {
  switch (node.type) {
    case "heading": {
      const Tag = `h${node.level}` as "h1" | "h2" | "h3" | "h4"
      const sizeClass = {
        1: "text-xl font-bold mt-8 mb-3",
        2: "text-base font-semibold mt-6 mb-2 border-b border-stone-100 pb-1",
        3: "text-sm font-semibold mt-4 mb-1.5 text-neutral-800",
        4: "text-xs font-semibold mt-3 mb-1 text-stone-600 uppercase tracking-wide",
      }[node.level]
      return (
        <Tag
          id={node.id}
          className={cn("scroll-mt-20 text-neutral-950", sizeClass)}
        >
          {node.text}
        </Tag>
      )
    }

    case "paragraph":
      return (
        <p className="my-2 text-sm leading-relaxed text-stone-700">
          <Inlines nodes={node.inlines} />
        </p>
      )

    case "unordered-list":
      return (
        <ul className="my-3 ml-4 flex list-disc flex-col gap-1 text-sm text-stone-700">
          {node.items.map((item, i) => (
            <ListItem key={i} item={item} />
          ))}
        </ul>
      )

    case "ordered-list":
      return (
        <ol className="my-3 ml-4 flex list-decimal flex-col gap-1 text-sm text-stone-700">
          {node.items.map((item, i) => (
            <ListItem key={i} item={item} />
          ))}
        </ol>
      )

    case "blockquote":
      return (
        <blockquote className="my-3 border-l-2 border-stone-300 pl-4 italic text-stone-600">
          <PlaybookMarkdownRenderer nodes={node.children} />
        </blockquote>
      )

    case "code-fence":
      return (
        <div className="my-4 overflow-x-auto rounded-md border border-stone-200 bg-stone-950">
          {node.lang && (
            <div className="border-b border-stone-800 px-3 py-1">
              <span className="font-mono text-[9px] tracking-widest text-stone-500 uppercase">
                {node.lang}
              </span>
            </div>
          )}
          <pre className="px-4 py-3 text-xs leading-relaxed text-stone-300">
            <code>{node.code}</code>
          </pre>
        </div>
      )

    case "hr":
      return (
        <hr className="my-6 border-t border-stone-200" />
      )

    case "table":
      return (
        <div className="my-4 overflow-x-auto rounded-md border border-stone-200">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                {node.headers.map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-3 py-2 text-left text-[9px] tracking-widest text-stone-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {node.rows.map((row, i) => (
                <tr key={i} className="border-b border-stone-100 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-stone-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "blank":
      return null

    default:
      return null
  }
}

// ── Main component ────────────────────────────────────────────
interface PlaybookMarkdownRendererProps {
  nodes: PlaybookMarkdownNode[]
  className?: string
}

export function PlaybookMarkdownRenderer({
  nodes,
  className,
}: PlaybookMarkdownRendererProps) {
  return (
    <div className={cn("", className)}>
      {nodes.map((node, i) => (
        <Node key={i} node={node} />
      ))}
    </div>
  )
}
