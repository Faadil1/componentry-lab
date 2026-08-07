// ─────────────────────────────────────────────────────────────
// Architecture Check: Server Boundary Enforcement (Cross-Platform)
// ─────────────────────────────────────────────────────────────
// Ensures application code does not bypass the server-only boundary
// by importing internal database implementation modules directly.
// Works on Windows, macOS, and Linux.
// ─────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, statSync } from "fs"
import { join, resolve, relative } from "path"

const appDirs = [
  "app",
  "components",
  "lib",
]

const internalModulesPattern = [
  "episode-repository-live-core",
  "episode-repository-live-impl",
  "db-core",
]

// Files that are allowed to import internal modules
const allowedPaths = [
  // Public server-only wrappers that enforce the boundary
  "lib/persistence/episode-repository.ts",
  "lib/persistence/db.ts",
  "lib/youtube/get-episode-state-from-db.ts",
  "lib/youtube/get-published-episodes-from-db.ts",
  "lib/youtube/get-episode-history-from-db.ts",
  // The internal modules themselves
  "lib/persistence/episode-repository-live-core.ts",
  "lib/persistence/db-core.ts",
  // Live tests that directly validate Neon behavior
  "tests/persistence/episode-repository.live.test.ts",
  "tests/youtube/get-episode-state-from-db.test.ts",
  "tests/youtube/get-published-episodes-from-db.test.ts",
  "tests/youtube/get-episode-history-from-db.test.ts",
  // Migration runner (internal infrastructure)
  "scripts/run-migrations.ts",
  // This script itself
  "scripts/arch-check.ts",
]

function isAllowed(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/")
  return allowedPaths.some((allowed) => normalized.endsWith(allowed))
}

function scanDirectory(dir: string, violations: { file: string; imports: string[] }[]) {
  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        // Recurse into subdirectories, but skip node_modules and .next
        if (entry !== "node_modules" && entry !== ".next" && entry !== ".git") {
          scanDirectory(fullPath, violations)
        }
      } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
        // Read file and check for imports
        try {
          const content = readFileSync(fullPath, "utf-8")
          const found: string[] = []

          for (const moduleName of internalModulesPattern) {
            // Check for various import patterns
            const patterns = [
              new RegExp(`from\\s+["'].*${moduleName}`, "g"),
              new RegExp(`import\\s+.*from\\s+["'].*${moduleName}`, "g"),
              new RegExp(`require\\(.*${moduleName}`, "g"),
            ]

            for (const pattern of patterns) {
              if (pattern.test(content)) {
                if (!found.includes(moduleName)) {
                  found.push(moduleName)
                }
              }
            }
          }

          if (found.length > 0 && !isAllowed(fullPath)) {
            violations.push({
              file: relative(process.cwd(), fullPath).replace(/\\/g, "/"),
              imports: found,
            })
          }
        } catch {
          // Skip files that can't be read
        }
      }
    }
  } catch {
    // Skip directories that can't be read
  }
}

function checkArchitecture() {
  console.log("🏗️  Checking server boundary enforcement...\n")

  const violations: { file: string; imports: string[] }[] = []

  for (const appDir of appDirs) {
    const fullPath = resolve(process.cwd(), appDir)
    try {
      statSync(fullPath)
      console.log(`📂 Scanning ${appDir}/`)
      scanDirectory(fullPath, violations)
    } catch {
      console.log(`📂 Scanning ${appDir}/ (not found, skipped)`)
    }
  }

  // Count files scanned (rough estimate)
  let totalFiles = 0
  for (const appDir of appDirs) {
    const fullPath = resolve(process.cwd(), appDir)
    try {
      const countFiles = (dir: string): number => {
        try {
          const entries = readdirSync(dir)
          let count = 0
          for (const entry of entries) {
            const fullSubPath = join(dir, entry)
            const stat = statSync(fullSubPath)
            if (stat.isDirectory()) {
              if (entry !== "node_modules" && entry !== ".next" && entry !== ".git") {
                count += countFiles(fullSubPath)
              }
            } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
              count++
            }
          }
          return count
        } catch {
          return 0
        }
      }
      totalFiles += countFiles(fullPath)
    } catch {
      // Directory doesn't exist
    }
  }

  console.log(`✓ Scanned ${totalFiles} TypeScript files\n`)

  if (violations.length > 0) {
    console.error("❌ ARCHITECTURE VIOLATION: Application code imports internal database module\n")
    console.error("Application code MUST import only from:")
    console.error("  import { createEpisodeRepository } from 'lib/persistence/episode-repository'\n")
    console.error("Violations:\n")

    for (const violation of violations) {
      console.error(`  📄 ${violation.file}`)
      console.error(`     imports: ${violation.imports.join(", ")}\n`)
    }

    process.exit(1)
  }

  console.log("✓ No application code imports of internal modules")
  console.log("✓ Server boundary enforcement active\n")
}

checkArchitecture()
