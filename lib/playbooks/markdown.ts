// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Markdown Renderer
// Custom, constrained, deterministic renderer.
// No external dependencies. No dangerouslySetInnerHTML.
// CLIENT-SAFE (tokenizer runs both server + client, but
// content.server.ts calls it server-side only).
// ─────────────────────────────────────────────────────────────

import type {
  PlaybookMarkdownNode,
  PlaybookInlineNode,
  PlaybookListItem,
  PlaybookHeading,
} from "./types"

// ── Heading ID generator ──────────────────────────────────────
function slugifyHeading(text: string, seen: Map<string, number>): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  const count = seen.get(slug) ?? 0
  seen.set(slug, count + 1)
  return count === 0 ? slug : `${slug}-${count}`
}

// ── Inline parser ─────────────────────────────────────────────
// Handles: **bold**, *italic*, `code`, [label](href), →/arrow text
// We process left-to-right with a simple state machine.
function parseInlines(text: string): PlaybookInlineNode[] {
  const nodes: PlaybookInlineNode[] = []
  let i = 0

  while (i < text.length) {
    // Bold **text**
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2)
      if (end !== -1) {
        const value = text.slice(i + 2, end)
        nodes.push({ type: "bold", value })
        i = end + 2
        continue
      }
    }

    // Italic *text*
    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1)
      if (end !== -1) {
        const value = text.slice(i + 1, end)
        nodes.push({ type: "italic", value })
        i = end + 1
        continue
      }
    }

    // Inline code `text`
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1)
      if (end !== -1) {
        const value = text.slice(i + 1, end)
        nodes.push({ type: "code", value })
        i = end + 1
        continue
      }
    }

    // Links [label](href)
    if (text[i] === "[") {
      const labelEnd = text.indexOf("]", i)
      if (labelEnd !== -1 && text[labelEnd + 1] === "(") {
        const hrefEnd = text.indexOf(")", labelEnd + 2)
        if (hrefEnd !== -1) {
          const label = text.slice(i + 1, labelEnd)
          const href = text.slice(labelEnd + 2, hrefEnd)
          const external =
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("//")
          nodes.push({ type: "link", href, label, external })
          i = hrefEnd + 1
          continue
        }
      }
    }

    // Arrow: → (either literal → or -> in text)
    if (
      (text[i] === "→") ||
      (text[i] === "-" && text[i + 1] === ">")
    ) {
      const arrowStr = text[i] === "→" ? "→" : "->"
      nodes.push({ type: "arrow", value: arrowStr })
      i += arrowStr.length
      continue
    }

    // Accumulate plain text
    const lastNode = nodes[nodes.length - 1]
    if (lastNode && lastNode.type === "text") {
      lastNode.value += text[i]
    } else {
      nodes.push({ type: "text", value: text[i] })
    }
    i++
  }

  return nodes
}

// ── List parser ───────────────────────────────────────────────
// Handles unordered (- or * prefix) and ordered (1. prefix) lists,
// including nested lists detected by indentation.
function parseListItems(
  lines: string[],
  startIdx: number,
  baseIndent: number
): { items: PlaybookListItem[]; endIdx: number } {
  const items: PlaybookListItem[] = []
  let i = startIdx

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trimStart()
    const indent = line.length - trimmed.length

    // Stop if less indented than base
    if (indent < baseIndent) break

    const isUnordered = /^[-*+] /.test(trimmed)
    const isOrdered = /^\d+\. /.test(trimmed)

    if (indent === baseIndent && (isUnordered || isOrdered)) {
      const text = trimmed.replace(/^[-*+] /, "").replace(/^\d+\. /, "")
      const item: PlaybookListItem = {
        inlines: parseInlines(text),
      }
      i++

      // Check for nested list
      if (i < lines.length) {
        const nextLine = lines[i]
        const nextTrimmed = nextLine.trimStart()
        const nextIndent = nextLine.length - nextTrimmed.length
        const nextIsUnordered = /^[-*+] /.test(nextTrimmed)
        const nextIsOrdered = /^\d+\. /.test(nextTrimmed)

        if (nextIndent > baseIndent && (nextIsUnordered || nextIsOrdered)) {
          const nested = parseListItems(lines, i, nextIndent)
          item.children = nested.items
          i = nested.endIdx
        }
      }

      items.push(item)
    } else {
      break
    }
  }

  return { items, endIdx: i }
}

// ── Table parser ──────────────────────────────────────────────
function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim())
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s|:-]+\|$/.test(line.trim())
}

// ── Main tokenizer ────────────────────────────────────────────
export function parseMarkdown(source: string): PlaybookMarkdownNode[] {
  const lines = source.split("\n")
  const nodes: PlaybookMarkdownNode[] = []
  const headingSeen = new Map<string, number>()
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trimEnd()

    // ── Blank line ─────────────────────────────────────────
    if (line.trim() === "") {
      i++
      continue
    }

    // ── Horizontal rule ────────────────────────────────────
    if (/^---+$/.test(line.trim())) {
      nodes.push({ type: "hr" })
      i++
      continue
    }

    // ── Code fence ─────────────────────────────────────────
    if (line.trimStart().startsWith("```")) {
      const fenceMatch = line.match(/^`{3}(\w*)/)
      const lang = fenceMatch ? fenceMatch[1] : ""
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++ // consume closing fence
      nodes.push({ type: "code-fence", lang, code: codeLines.join("\n") })
      continue
    }

    // ── Headings ───────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4
      const text = headingMatch[2].trim()
      const id = slugifyHeading(text, headingSeen)
      nodes.push({ type: "heading", level, id, text })
      i++
      continue
    }

    // ── Table ──────────────────────────────────────────────
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseTableRow(line)
      i += 2 // skip header + separator
      const rows: string[][] = []
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(parseTableRow(lines[i]))
        i++
      }
      nodes.push({ type: "table", headers, rows })
      continue
    }

    // ── Blockquote ─────────────────────────────────────────
    if (line.startsWith(">")) {
      const bqLines: string[] = []
      while (i < lines.length && lines[i].startsWith(">")) {
        bqLines.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      const children = parseMarkdown(bqLines.join("\n"))
      nodes.push({ type: "blockquote", children })
      continue
    }

    // ── Unordered list ─────────────────────────────────────
    if (/^[-*+] /.test(line.trimStart())) {
      const baseIndent = raw.length - raw.trimStart().length
      const result = parseListItems(lines, i, baseIndent)
      nodes.push({ type: "unordered-list", items: result.items })
      i = result.endIdx
      continue
    }

    // ── Ordered list ───────────────────────────────────────
    if (/^\d+\. /.test(line.trimStart())) {
      const baseIndent = raw.length - raw.trimStart().length
      const result = parseListItems(lines, i, baseIndent)
      nodes.push({ type: "ordered-list", items: result.items })
      i = result.endIdx
      continue
    }

    // ── Paragraph ──────────────────────────────────────────
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("---") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith(">") &&
      !/^[-*+] /.test(lines[i].trimStart()) &&
      !/^\d+\. /.test(lines[i].trimStart()) &&
      !lines[i].includes("|")
    ) {
      paraLines.push(lines[i].trimEnd())
      i++
    }

    if (paraLines.length > 0) {
      const text = paraLines.join(" ")
      nodes.push({ type: "paragraph", text, inlines: parseInlines(text) })
    } else {
      i++
    }
  }

  return nodes
}

// ── Heading extractor ─────────────────────────────────────────
export function extractHeadings(nodes: PlaybookMarkdownNode[]): PlaybookHeading[] {
  const headings: PlaybookHeading[] = []
  for (const node of nodes) {
    if (node.type === "heading") {
      headings.push({ level: node.level, text: node.text, id: node.id })
    }
  }
  return headings
}
