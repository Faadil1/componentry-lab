// ─────────────────────────────────────────────────────────────
// Architecture Check: Server Boundary Enforcement
// ─────────────────────────────────────────────────────────────
// Ensures application code does not bypass the server-only boundary
// by importing internal database implementation modules directly.
// ─────────────────────────────────────────────────────────────

import { execSync } from "child_process"
import { resolve } from "path"

const appDirs = [
  "app/",
  "components/",
  "lib/youtube/",
]

const internalModules = [
  "episode-repository-live-core",
  "episode-repository-live-impl", // Old name, prevent regression
]

function checkArchitecture() {
  console.log("🏗️  Checking server boundary enforcement...")

  const violations: string[] = []

  for (const appDir of appDirs) {
    for (const internalModule of internalModules) {
      try {
        // Search for imports of internal module in app code
        const result = execSync(
          `grep -r "from.*${internalModule}" "${resolve(process.cwd(), appDir)}" 2>/dev/null || true`,
          { encoding: "utf-8" }
        )

        if (result.trim()) {
          violations.push(`${appDir}: imports ${internalModule}\n${result}`)
        }
      } catch {
        // Directory doesn't exist or no matches - that's fine
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      "\n❌ ARCHITECTURE VIOLATION: Application code imports internal database module"
    )
    console.error("\nApplication code MUST import only from:")
    console.error("  import { createEpisodeRepository } from 'lib/persistence/episode-repository'")
    console.error("\nViolations:")
    violations.forEach((v) => console.error(`  ${v}`))
    process.exit(1)
  }

  console.log("✓ No application code imports of internal modules")
  console.log("✓ Server boundary enforcement active")
}

checkArchitecture()
