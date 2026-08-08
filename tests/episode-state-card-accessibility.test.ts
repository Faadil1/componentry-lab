/**
 * Accessibility regression tests for Episode State Card
 * Run: node --experimental-strip-types --test tests/episode-state-card-accessibility.test.ts
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { test, describe } = require('node:test')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const assert = require('node:assert/strict')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodePath = require('path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AxeBuilder } = require('@axe-core/playwright')

const BASE_URL = 'https://componentry-lab.vercel.app/episode-state-card'
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function withPage(opts: Record<string, unknown>, fn: (page: unknown) => Promise<void>) {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  try {
    await fn(page)
  } finally {
    await ctx.close()
    await browser.close()
  }
}

describe('Episode State Card — Accessibility', async () => {

  // ── 1. No duplicate IDs with all 6 cards rendered ─────────────────────────
  await test('no duplicate IDs with all 6 cards rendered', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const report = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((el: Element) => (el as HTMLElement).id).filter(Boolean)
        const duplicates = ids.filter((id: string, i: number) => ids.indexOf(id) !== i)
        return { total: ids.length, duplicates: [...new Set(duplicates)] }
      })
      assert.equal(report.duplicates.length, 0,
        `Duplicate IDs found: ${report.duplicates.join(', ')}`)
    })
  })

  // ── 2. All aria-labelledby references resolve ──────────────────────────────
  await test('all aria-labelledby references resolve to existing elements', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const broken = await page.evaluate(() => {
        const results: string[] = []
        document.querySelectorAll('[aria-labelledby]').forEach((el: Element) => {
          const ids = el.getAttribute('aria-labelledby')!.trim().split(/\s+/).filter(Boolean)
          ids.forEach((id: string) => {
            if (!document.getElementById(id)) results.push(id)
          })
        })
        return results
      })
      assert.equal(broken.length, 0,
        `Broken aria-labelledby references: ${broken.join(', ')}`)
    })
  })

  // ── 3. Each card has a non-empty accessible name ───────────────────────────
  await test('each card region has a non-empty accessible name', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const cards = await page.evaluate(() => {
        return [...document.querySelectorAll('[role="region"][aria-labelledby]')].map((el: Element) => {
          const ids = el.getAttribute('aria-labelledby')!.trim().split(/\s+/).filter(Boolean)
          const name = ids.map((id: string) => document.getElementById(id)?.textContent?.trim() || '').join(' ').trim()
          return { name, labelledby: el.getAttribute('aria-labelledby') }
        })
      })
      assert.ok(cards.length >= 6, `Expected at least 6 card regions, got ${cards.length}`)
      for (const card of cards) {
        assert.ok(card.name.length > 0,
          `Card with aria-labelledby="${card.labelledby}" has empty accessible name`)
      }
    })
  })

  // ── 4. Decorative SVGs are hidden from assistive technology ───────────────
  await test('all SVG icons are hidden from assistive technology', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const exposed = await page.evaluate(() => {
        return [...document.querySelectorAll('svg')]
          .filter((svg: SVGElement) =>
            svg.getAttribute('aria-hidden') !== 'true' &&
            !svg.getAttribute('aria-label') &&
            !svg.querySelector('title') &&
            svg.getAttribute('role') !== 'img'
          )
          .map((svg: SVGElement) => svg.parentElement?.textContent?.trim().slice(0, 60) || '(unknown)')
      })
      assert.equal(exposed.length, 0,
        `${exposed.length} SVG(s) exposed to AT without accessible label`)
    })
  })

  // ── 5. No card is unnecessarily tabbable ──────────────────────────────────
  await test('card regions are not in tab sequence', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const tabbable = await page.evaluate(() => {
        return [...document.querySelectorAll('[role="region"][aria-labelledby]')]
          .filter((el: Element) => {
            const ti = el.getAttribute('tabindex')
            return ti !== null && parseInt(ti) >= 0
          })
          .map((el: Element) => el.getAttribute('aria-labelledby'))
      })
      assert.equal(tabbable.length, 0,
        `Card regions should not be tabbable: ${tabbable.join(', ')}`)
    })
  })

  // ── 6. Select has accessible name ─────────────────────────────────────────
  await test('variant select has an accessible name via associated label', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const info = await page.evaluate(() => {
        const sel = document.querySelector('select')
        if (!sel) return null
        const explicitLabel = sel.id ? document.querySelector(`label[for="${sel.id}"]`) : null
        return {
          id: sel.id,
          aria_label: sel.getAttribute('aria-label'),
          aria_labelledby: sel.getAttribute('aria-labelledby'),
          has_explicit_label: !!explicitLabel,
          label_text: explicitLabel?.textContent?.trim(),
        }
      })
      assert.ok(info, 'select element not found')
      const hasName = info.aria_label || info.aria_labelledby || info.has_explicit_label
      assert.ok(hasName, `select has no accessible name`)
    })
  })

  // ── 7. Motion toggle is keyboard accessible ────────────────────────────────
  await test('motion toggle button is operable', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const btn = await page.evaluate(() => {
        const b = document.querySelector('button')
        if (!b) return null
        return { disabled: b.hasAttribute('disabled'), tabindex: b.getAttribute('tabindex') }
      })
      assert.ok(btn, 'motion toggle button not found')
      assert.ok(!btn.disabled, 'motion toggle is disabled')
      assert.notEqual(btn.tabindex, '-1', 'motion toggle should not be removed from tab order')
    })
  })

  // ── 8. Reduced motion removes vertical translation ────────────────────────
  await test('reduced motion disables vertical translation', async () => {
    await withPage({ reducedMotion: 'reduce' }, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const transforms = await page.evaluate(() => {
        return [...document.querySelectorAll('[role="region"]')].map((el: Element) => {
          const style = window.getComputedStyle(el)
          return style.transform
        })
      })
      for (const transform of transforms) {
        if (transform && transform !== 'none' && transform.includes('matrix')) {
          const parts = transform.replace('matrix(', '').replace(')', '').split(',').map(Number)
          const translateY = Math.abs(parts[5])
          assert.ok(translateY <= 1, `Card has translateY=${translateY}px under reduced motion`)
        }
      }
    })
  })

  // ── 9. No horizontal overflow at 320px ───────────────────────────────────
  await test('no horizontal overflow at 320px viewport', async () => {
    await withPage({ viewport: { width: 320, height: 900 } }, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      assert.equal(overflow.scrollWidth, overflow.clientWidth,
        `Horizontal overflow: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`)
    })
  })

  // ── 10. Blocker severity has sr-only text ─────────────────────────────────
  await test('blocker severity communicated via sr-only text', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.selectOption('select', 'blocked')
      await page.waitForTimeout(600)
      const srTexts = await page.evaluate(() => {
        return [...document.querySelectorAll('.sr-only')]
          .map((el: Element) => el.textContent?.trim())
          .filter((t: string) => t && (t.includes('Critical') || t.includes('Warning') || t.includes('Info')))
      })
      assert.ok(srTexts.length > 0,
        'No sr-only severity text in blocked variant — screen readers cannot convey severity')
    })
  })

  // ── 11. Unavailable state has no inappropriate live region ────────────────
  await test('unavailable state does not use live region or alert role', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.selectOption('select', 'unavailable')
      await page.waitForTimeout(600)
      const liveRegions = await page.evaluate(() => {
        return [...document.querySelectorAll('[aria-live],[role="alert"],[role="status"]')]
          .map((el: Element) => ({ role: el.getAttribute('role'), live: el.getAttribute('aria-live') }))
      })
      assert.equal(liveRegions.length, 0,
        `Unexpected live regions on page: ${JSON.stringify(liveRegions)}`)
    })
  })

  // ── 12. Axe: 0 critical + serious on full page ────────────────────────────
  await test('axe reports 0 critical and 0 serious violations', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
      const critical = results.violations.filter((v: { impact: string }) => v.impact === 'critical')
      const serious = results.violations.filter((v: { impact: string }) => v.impact === 'serious')
      if (critical.length > 0 || serious.length > 0) {
        const detail = [...critical, ...serious].map((v: { impact: string; id: string; description: string; nodes: unknown[] }) =>
          `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`
        ).join('\n')
        assert.fail(`Axe violations:\n${detail}`)
      }
      assert.equal(critical.length, 0)
      assert.equal(serious.length, 0)
    })
  })

  // ── 13. Contrast evidence contains no invalid white-on-white samples ───────
  await test('contrast evidence contains no invalid white-on-white measurements', async () => {
    const evidencePath = nodePath.join(__dirname, '../artifacts/episode-state-card/accessibility-evidence/contrast-results.json')
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'))
    const invalid = evidence.samples.filter((s: { foreground_hex: string; background_hex: string; passes: boolean }) =>
      s.foreground_hex === '#ffffff' && s.background_hex === '#ffffff' && !s.passes
    )
    assert.equal(invalid.length, 0,
      `Found ${invalid.length} invalid white-on-white samples — indicates measurement error`)
  })

  // ── 14. Every contrast sample has parseable foreground and background ──────
  await test('every contrast sample has valid hex foreground and background', async () => {
    const evidencePath = nodePath.join(__dirname, '../artifacts/episode-state-card/accessibility-evidence/contrast-results.json')
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'))
    const hexPattern = /^#[0-9a-f]{6}$/i
    const invalid = evidence.samples.filter((s: { foreground_hex: string; background_hex: string }) =>
      !hexPattern.test(s.foreground_hex) || !hexPattern.test(s.background_hex)
    )
    assert.equal(invalid.length, 0,
      `${invalid.length} samples have invalid hex colors: ${JSON.stringify(invalid.slice(0, 3))}`)
  })

  // ── 15. All required contrast samples pass their applicable threshold ──────
  await test('all measured contrast samples pass WCAG 2.2 AA threshold', async () => {
    const evidencePath = nodePath.join(__dirname, '../artifacts/episode-state-card/accessibility-evidence/contrast-results.json')
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'))
    const failures = evidence.samples.filter((s: { passes: boolean }) => !s.passes)
    if (failures.length > 0) {
      const detail = failures.slice(0, 5).map((f: { variant: string; label: string; ratio: number; threshold: number; foreground_hex: string; background_hex: string }) =>
        `[${f.variant}] ${f.label}: ${f.ratio}:1 (need ${f.threshold}) fg=${f.foreground_hex} bg=${f.background_hex}`
      ).join('\n')
      assert.fail(`${failures.length} contrast failure(s):\n${detail}`)
    }
    assert.equal(failures.length, 0)
    assert.ok(evidence.samples.length > 10, `Expected >10 samples, got ${evidence.samples.length}`)
  })

  // ── 16. Every axe incomplete rule has a manual resolution ─────────────────
  await test('every axe incomplete rule has a manual resolution recorded', async () => {
    const evidencePath = nodePath.join(__dirname, '../artifacts/episode-state-card/accessibility-evidence/axe-incomplete-review.json')
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'))
    assert.equal(evidence.unresolved_incomplete_rules, 0,
      `${evidence.unresolved_incomplete_rules} incomplete rules remain unresolved`)
    for (const [ruleId, rule] of Object.entries(evidence.rules as Record<string, { manual_review: { performed: boolean; result: string } }>)) {
      assert.ok(rule.manual_review?.performed === true,
        `Rule ${ruleId} has no manual review recorded`)
      assert.ok(
        ['PASS', 'FAIL', 'NOT_APPLICABLE', 'RESOLVED_BY_MEASUREMENT'].includes(rule.manual_review.result),
        `Rule ${ruleId} manual review result is invalid: ${rule.manual_review.result}`
      )
    }
  })

  // ── 17. Unavailable error text is not duplicated verbatim ─────────────────
  await test('unavailable variant does not render duplicate error text', async () => {
    await withPage({}, async (page: any) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.selectOption('select', 'unavailable')
      await page.waitForTimeout(600)
      const texts = await page.evaluate(() => {
        const region = document.querySelector('[role="region"][aria-labelledby]')
        if (!region) return []
        return [...region.querySelectorAll('p')]
          .map((el: Element) => el.textContent?.trim() || '')
          .filter(Boolean)
      })
      const seen = new Set<string>()
      const duplicates: string[] = []
      for (const t of texts) {
        if (seen.has(t)) duplicates.push(t)
        seen.add(t)
      }
      assert.equal(duplicates.length, 0,
        `Duplicate paragraph text in unavailable variant: ${JSON.stringify(duplicates)}`)
    })
  })

})
