// ─────────────────────────────────────────────────────────────
// Playbook Knowledge System — Server-Only Content Reader
// ALL fs operations must live here.
// NEVER import this file from client components.
// ─────────────────────────────────────────────────────────────

import "server-only"
import { readFile } from "fs/promises"
import { join } from "path"
import type { PlaybookDocument, PlaybookEntry } from "./types"
import { getPlaybookBySlug, getPlaybookById, getCollectionNeighbors } from "./catalog"
import { parseMarkdown, extractHeadings } from "./markdown"

// ── Path resolution ───────────────────────────────────────────
const CONTENT_ROOT = join(process.cwd(), "content", "playbooks")

function getAbsolutePath(entry: PlaybookEntry): string {
  // publicTargetPath: "content/playbooks/uiux/07-TYPOGRAPHY-SYSTEM.md"
  // We strip the "content/playbooks/" prefix to get the relative path within CONTENT_ROOT.
  const relPath = entry.publicTargetPath.replace(/^content\/playbooks\//, "")
  return join(CONTENT_ROOT, relPath)
}

// ── Security guard ────────────────────────────────────────────
// Prevents user slugs from being used as arbitrary fs paths.
// A slug must be matched against the catalog first.
function resolveEntryFromSlug(slugSegments: string[]): PlaybookEntry | null {
  const slug = slugSegments.join("/")
  const entry = getPlaybookBySlug(slug)
  if (!entry) return null

  // Extra guard: path must start with our content root
  const absPath = getAbsolutePath(entry)
  if (!absPath.startsWith(CONTENT_ROOT)) {
    throw new Error(
      `[content.server] Path traversal detected for slug "${slug}": "${absPath}" is outside content root.`
    )
  }

  return entry
}

// ── Core reader ───────────────────────────────────────────────
export async function readPlaybookDocument(
  slugSegments: string[]
): Promise<PlaybookDocument | null> {
  const entry = resolveEntryFromSlug(slugSegments)
  if (!entry) return null

  const absPath = getAbsolutePath(entry)

  let source: string
  try {
    source = await readFile(absPath, "utf8")
  } catch {
    console.error(`[content.server] Failed to read file: ${absPath}`)
    return null
  }

  const nodes = parseMarkdown(source)
  const headings = extractHeadings(nodes)
  const { prev, next } = getCollectionNeighbors(entry.id)

  return {
    entry,
    headings,
    nodes,
    prevEntry: prev,
    nextEntry: next,
  }
}

// ── Existence verification (for build validation) ──────────────
export async function verifyAllPlaybookFiles(
  catalog: PlaybookEntry[]
): Promise<{ missing: string[]; found: number }> {
  const missing: string[] = []
  let found = 0

  await Promise.all(
    catalog.map(async (entry) => {
      const absPath = getAbsolutePath(entry)
      try {
        await readFile(absPath, "utf8")
        found++
      } catch {
        missing.push(entry.publicTargetPath)
      }
    })
  )

  return { missing, found }
}

// ── Quick excerpt (for OG / metadata) ─────────────────────────
export async function readPlaybookExcerpt(
  id: string,
  maxChars = 300
): Promise<string | null> {
  const entry = getPlaybookById(id)
  if (!entry) return null

  const absPath = getAbsolutePath(entry)
  try {
    const source = await readFile(absPath, "utf8")
    // Extract first substantive paragraph
    const lines = source.split("\n")
    for (const line of lines) {
      const trimmed = line.trim()
      if (
        trimmed.length > 40 &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("---") &&
        !trimmed.startsWith("```") &&
        !trimmed.startsWith(">") &&
        !trimmed.startsWith("-") &&
        !trimmed.startsWith("*") &&
        !/^\d+\./.test(trimmed)
      ) {
        return trimmed.length > maxChars
          ? trimmed.slice(0, maxChars) + "…"
          : trimmed
      }
    }
    // Fallback to summary from manifest
    return entry.summary.length > maxChars
      ? entry.summary.slice(0, maxChars) + "…"
      : entry.summary
  } catch {
    return entry.summary
  }
}

// ── Static params generation ──────────────────────────────────
export { allPlaybookSlugSegments } from "./catalog"
