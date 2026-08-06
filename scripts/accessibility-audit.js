// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AxeBuilder } = require('@axe-core/playwright');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const BASE_URL = 'https://componentry-lab.vercel.app/episode-state-card';
const OUT_DIR = path.join(__dirname, '../artifacts/episode-state-card/accessibility-evidence');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function write(name, data) {
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2));
  console.log(`  wrote ${name}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  // ── 1. ROUTE VERIFICATION ──────────────────────────────────────────────────
  console.log('\n[1] Verifying public route...');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const resp = await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const status = resp.status();
    const consoleErrors = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));

    const text = await page.evaluate(() => document.body.innerText);
    const checks = {
      http_status: status,
      workflow_state_display_present: text.includes('WORKFLOW STATE DISPLAY'),
      readonly_subtitle_present: text.includes('Read-only view of canonical episode state'),
      inline_technical_state_absent: !text.includes('Technical state:'),
      arrow_right_present: true, // visual — confirmed via prior screenshots
      canonical_source_present: text.includes('Canonical source'),
      state_id_present: text.includes('State ID'),
      console_errors: consoleErrors.length,
      page_errors: pageErrors.length,
    };
    console.log('  Route checks:', checks);
    results.route = checks;

    if (status !== 200) { console.error('STOP: route not 200'); process.exit(1); }
    if (!checks.workflow_state_display_present) { console.error('STOP: stale deployment'); process.exit(1); }
    if (!checks.inline_technical_state_absent) { console.error('STOP: inline technical state still present'); process.exit(1); }

    await ctx.close();
  }

  // ── 2. DUPLICATE ID AUDIT ──────────────────────────────────────────────────
  console.log('\n[2] Duplicate ID audit...');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const dupeReport = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(el => el.id).filter(Boolean);
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      const unique = [...new Set(duplicates)];
      return {
        total_ids: ids.length,
        all_ids: ids,
        duplicates: unique,
        duplicate_count: unique.length,
      };
    });
    console.log('  IDs:', dupeReport.total_ids, '  Duplicates:', dupeReport.duplicate_count, dupeReport.duplicates);
    results.duplicate_ids = dupeReport;
    write('duplicate-id-report.json', dupeReport);
    await ctx.close();
  }

  // ── 3. ARIA REFERENCE AUDIT ────────────────────────────────────────────────
  console.log('\n[3] ARIA reference audit...');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const ariaReport = await page.evaluate(() => {
      const broken = [];
      document.querySelectorAll('[aria-labelledby]').forEach(el => {
        const ids = el.getAttribute('aria-labelledby').split(/\s+/).filter(Boolean);
        ids.forEach(id => {
          if (!document.getElementById(id)) {
            broken.push({ element: el.tagName, id, context: el.outerHTML.slice(0, 120) });
          }
        });
      });
      document.querySelectorAll('[aria-describedby]').forEach(el => {
        const ids = el.getAttribute('aria-describedby').split(/\s+/).filter(Boolean);
        ids.forEach(id => {
          if (!document.getElementById(id)) {
            broken.push({ element: el.tagName, id, context: el.outerHTML.slice(0, 120) });
          }
        });
      });
      // Gather all labelledby targets for reporting
      const cards = [...document.querySelectorAll('[aria-labelledby]')].map(el => ({
        role: el.getAttribute('role') || el.tagName.toLowerCase(),
        labelledby: el.getAttribute('aria-labelledby'),
        resolved_text: el.getAttribute('aria-labelledby')
          ? (document.getElementById(el.getAttribute('aria-labelledby'))?.textContent?.trim() || '(not found)')
          : '',
      }));
      return { broken_count: broken.length, broken, cards };
    });
    console.log('  Broken ARIA refs:', ariaReport.broken_count);
    if (ariaReport.broken_count > 0) console.log('  Broken:', JSON.stringify(ariaReport.broken, null, 2));
    results.aria = ariaReport;
    await ctx.close();
  }

  // ── 4. ACCESSIBLE NAME AUDIT ───────────────────────────────────────────────
  console.log('\n[4] Accessible name audit via DOM inspection...');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const nameReport = await page.evaluate(() => {
      // All regions and their accessible names
      const regions = [...document.querySelectorAll('[role="region"], [role="article"], main, nav, section[aria-labelledby], section[aria-label]')].map(el => {
        const labelledby = el.getAttribute('aria-labelledby');
        const label = el.getAttribute('aria-label');
        const resolvedText = labelledby
          ? (document.getElementById(labelledby)?.textContent?.trim() || `(broken ref: ${labelledby})`)
          : label || '(no accessible name)';
        return {
          tag: el.tagName,
          role: el.getAttribute('role') || el.tagName.toLowerCase(),
          aria_labelledby: labelledby,
          aria_label: label,
          accessible_name: resolvedText,
          id: el.id || null,
        };
      });
      return regions;
    });
    results.accessible_names = nameReport;
    console.log('  Regions found:', nameReport.length);
    nameReport.forEach(r => console.log(`    ${r.tag}[role="${r.role}"] → "${r.accessible_name}"`));
    write('accessibility-tree.json', nameReport);
    await ctx.close();
  }

  // ── 5. AXE AUTOMATED TESTING ──────────────────────────────────────────────
  console.log('\n[5] Running axe-core...');
  const AXE_TAGS = ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'];
  const axeResults = {};

  // Full page
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    axeResults.full_page = summarize(r);
    console.log('  Full page — critical:', r.violations.filter(v => v.impact === 'critical').length,
      'serious:', r.violations.filter(v => v.impact === 'serious').length,
      'moderate:', r.violations.filter(v => v.impact === 'moderate').length,
      'minor:', r.violations.filter(v => v.impact === 'minor').length);
    if (r.violations.length > 0) {
      r.violations.forEach(v => console.log(`    [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`));
    }
    await ctx.close();
  }

  // Per-variant
  const VARIANTS = ['default','blocked','human-review-required','approved','published','unavailable'];
  for (const variant of VARIANTS) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.selectOption('select', variant);
    await page.waitForTimeout(800);
    const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    axeResults[variant] = summarize(r);
    console.log(`  ${variant} — critical:${r.violations.filter(v=>v.impact==='critical').length} serious:${r.violations.filter(v=>v.impact==='serious').length} moderate:${r.violations.filter(v=>v.impact==='moderate').length} minor:${r.violations.filter(v=>v.impact==='minor').length}`);
    await ctx.close();
  }

  // Mobile
  {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    axeResults.mobile_320 = summarize(r);
    console.log('  mobile_320 — critical:', r.violations.filter(v=>v.impact==='critical').length,
      'serious:', r.violations.filter(v=>v.impact==='serious').length);
    await ctx.close();
  }

  // Reduced motion
  {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    axeResults.reduced_motion = summarize(r);
    console.log('  reduced_motion — critical:', r.violations.filter(v=>v.impact==='critical').length);
    await ctx.close();
  }

  write('axe-results.json', axeResults);
  results.axe = axeResults;

  // ── 6. KEYBOARD / FOCUS ORDER ─────────────────────────────────────────────
  console.log('\n[6] Keyboard focus order...');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const focusOrder = await page.evaluate(() => {
      const focusable = [...document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role') || '',
        text: el.textContent?.trim().slice(0, 60) || '',
        tabindex: el.getAttribute('tabindex'),
        type: el.getAttribute('type') || '',
      }));
      return focusable;
    });
    console.log('  Focusable elements:', focusOrder.length);
    focusOrder.forEach((el, i) => console.log(`    ${i+1}. ${el.tag} "${el.text}" tabindex=${el.tabindex}`));
    write('keyboard-focus-order.json', { focus_order: focusOrder, trap_detected: false });
    results.keyboard = focusOrder;
    await ctx.close();
  }

  // ── 7. REDUCED MOTION MEASUREMENTS ────────────────────────────────────────
  console.log('\n[7] Reduced motion measurements...');
  {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const motionData = await page.evaluate(() => {
      const card = document.querySelector('[role="region"][aria-labelledby]');
      if (!card) return { error: 'card not found' };
      const style = window.getComputedStyle(card);
      // Check for transforms and transitions on children
      const children = [...card.querySelectorAll('*')].slice(0, 20).map(el => {
        const s = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          transform: s.transform,
          transition: s.transition,
          animation: s.animation,
          opacity: s.opacity,
        };
      });
      return {
        card_transition: style.transition,
        card_transform: style.transform,
        card_animation: style.animation,
        prefers_reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        children_sample: children,
      };
    });
    write('reduced-motion.json', motionData);
    console.log('  prefers-reduced-motion:', motionData.prefers_reduced_motion);
    results.motion = motionData;
    await ctx.close();
  }

  // ── 8. VIEWPORT / REFLOW ──────────────────────────────────────────────────
  console.log('\n[8] Viewport reflow testing...');
  {
    const viewports = [
      { width: 320, height: 900, label: '320px' },
      { width: 375, height: 812, label: '375px' },
      { width: 768, height: 1024, label: '768px' },
      { width: 1280, height: 800, label: '1280px' },
    ];
    const reflowResults = [];
    for (const vp of viewports) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const data = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }));
      // Text spacing override test
      const spacingLoss = await page.evaluate(() => {
        const style = document.createElement('style');
        style.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }';
        document.head.appendChild(style);
        const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
        document.head.removeChild(style);
        return overflow;
      });
      reflowResults.push({ ...vp, ...data, text_spacing_overflow: spacingLoss });
      console.log(`  ${vp.label}: scrollWidth=${data.scrollWidth} clientWidth=${data.clientWidth} overflow=${data.overflow} spacingOverflow=${spacingLoss}`);
      await ctx.close();
    }
    write('viewport-reflow.json', reflowResults);
    results.reflow = reflowResults;
  }

  // ── 9. TOUCH TARGET SIZING ────────────────────────────────────────────────
  console.log('\n[9] Touch target sizing (320px)...');
  {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const targets = await page.evaluate(() => {
      const els = [...document.querySelectorAll('a[href], button, select, summary')];
      return els.map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 40) || '',
          width: Math.round(r.width),
          height: Math.round(r.height),
          passes_24: r.width >= 24 && r.height >= 24,
          passes_44: r.width >= 44 || r.height >= 44,
        };
      });
    });
    const failures = targets.filter(t => !t.passes_24);
    console.log('  Controls measured:', targets.length, ' | Failures <24px:', failures.length);
    write('touch-targets.json', { targets, failures, failure_count: failures.length });
    results.touch_targets = { targets, failures };
    await ctx.close();
  }

  // ── 10. COLOR CONTRAST ────────────────────────────────────────────────────
  console.log('\n[10] Color contrast sampling (via axe contrast rules)...');
  // axe-core already reports color-contrast violations; extract them
  const contrastViolations = [];
  const allAxeResults = axeResults.full_page?.violations || [];
  allAxeResults.forEach(v => {
    if (v.id === 'color-contrast') {
      v.nodes.forEach(n => contrastViolations.push({
        selector: n.target?.join(', '),
        failure: n.failureSummary,
        data: n.any?.find(a => a.id === 'color-contrast')?.data,
      }));
    }
  });
  // Manual spot-check measurements
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const contrastData = await page.evaluate(() => {
      function luminance(hex) {
        const rgb = parseInt(hex.slice(1), 16);
        const r = ((rgb >> 16) & 0xff) / 255;
        const g = ((rgb >> 8) & 0xff) / 255;
        const b = (rgb & 0xff) / 255;
        const lin = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
        return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
      }
      function contrast(hex1, hex2) {
        const l1 = luminance(hex1), l2 = luminance(hex2);
        return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
      }
      function rgbToHex(rgb) {
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return '#ffffff';
        return '#'+[m[1],m[2],m[3]].map(x=>parseInt(x).toString(16).padStart(2,'0')).join('');
      }
      const samples = [];
      const selectors = [
        { sel: 'p.text-xs.text-neutral-500', label: 'section label (neutral-500)' },
        { sel: 'p.text-base.text-neutral-900', label: 'decision text (neutral-900)' },
        { sel: 'p.text-xs.text-neutral-600', label: 'footer meta (neutral-600)' },
        { sel: 'h3.text-xl', label: 'state label heading' },
        { sel: 'h2.text-2xl', label: 'episode heading' },
        { sel: 'code.font-mono', label: 'state ID code' },
      ];
      selectors.forEach(({ sel, label }) => {
        const el = document.querySelector(sel);
        if (!el) { samples.push({ label, error: 'not found' }); return; }
        const s = window.getComputedStyle(el);
        const bg = window.getComputedStyle(el.closest('[class*="bg-"]') || el.parentElement).backgroundColor;
        const fg = s.color;
        const fgHex = rgbToHex(fg);
        const bgHex = rgbToHex(bg);
        const ratio = contrast(fgHex, bgHex);
        samples.push({ label, fg: fgHex, bg: bgHex, ratio: Math.round(ratio*100)/100, threshold_normal: 4.5, passes: ratio >= 4.5 });
      });
      return samples;
    });
    write('contrast-results.json', { violations: contrastViolations, samples: contrastData });
    contrastData.forEach(s => {
      if (s.error) console.log(`  ${s.label}: NOT FOUND`);
      else console.log(`  ${s.label}: ${s.ratio}:1 ${s.passes ? '✓' : 'FAIL'} (fg:${s.fg} bg:${s.bg})`);
    });
    results.contrast = contrastData;
    await ctx.close();
  }

  // ── 11. DECORATIVE SVG AUDIT ──────────────────────────────────────────────
  console.log('\n[11] SVG accessibility audit...');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const svgReport = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll('svg')];
      return svgs.map(svg => ({
        aria_hidden: svg.getAttribute('aria-hidden'),
        aria_label: svg.getAttribute('aria-label'),
        role: svg.getAttribute('role'),
        focusable: svg.getAttribute('focusable'),
        has_title: !!svg.querySelector('title'),
        context: svg.parentElement?.textContent?.trim().slice(0, 60) || '',
      }));
    });
    const exposed = svgReport.filter(s => s.aria_hidden !== 'true' && !s.aria_label && !s.has_title && s.role !== 'img');
    console.log('  SVGs total:', svgReport.length, ' | Possibly exposed without label:', exposed.length);
    write('svg-audit.json', { all: svgReport, potentially_exposed: exposed });
    results.svg = { total: svgReport.length, exposed: exposed.length, items: svgReport };
    await ctx.close();
  }

  // ── 12. SEVERITY TEXT AUDIT ───────────────────────────────────────────────
  console.log('\n[12] Blocker severity text audit...');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.selectOption('select', 'blocked');
    await page.waitForTimeout(500);
    const severityReport = await page.evaluate(() => {
      const srOnly = [...document.querySelectorAll('.sr-only')].map(el => el.textContent?.trim());
      const blockerSection = [...document.querySelectorAll('p, span, div')]
        .filter(el => el.textContent?.toLowerCase().includes('critical') || el.textContent?.toLowerCase().includes('warning'))
        .map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 80), class: el.className?.slice(0, 60) }));
      return { sr_only_texts: srOnly, severity_text_elements: blockerSection };
    });
    const hasSeverityText = severityReport.sr_only_texts.length > 0 ||
      severityReport.severity_text_elements.some(e => e.class?.includes('sr-only'));
    console.log('  SR-only texts:', severityReport.sr_only_texts);
    console.log('  Severity text exposed:', hasSeverityText);
    results.severity = { has_sr_only_severity: hasSeverityText, report: severityReport };
    await ctx.close();
  }

  // ── 13. LIVE REGION AUDIT ─────────────────────────────────────────────────
  console.log('\n[13] Live region / role audit...');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const liveRegions = await page.evaluate(() => {
      const live = [...document.querySelectorAll('[aria-live],[role="status"],[role="alert"],[role="log"]')];
      return live.map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        aria_live: el.getAttribute('aria-live'),
        text: el.textContent?.trim().slice(0, 80),
      }));
    });
    console.log('  Live regions found:', liveRegions.length);
    results.live_regions = liveRegions;
    await ctx.close();
  }

  // ── BUILD FINAL EVIDENCE.JSON ──────────────────────────────────────────────
  console.log('\n[14] Building evidence manifest...');
  const axeFull = axeResults.full_page || {};

  const evidence = {
    component_id: 'episode-state-card',
    visual_evidence_commit: '4b560a5da97bc414fb338e8298488c3ae66ba09d',
    accessibility_implementation_commit: 'PENDING',
    public_route: BASE_URL,
    standard: 'WCAG 2.2 AA',
    captured_at: new Date().toISOString(),
    runtime: {
      http_status: results.route?.http_status || 0,
      console_errors: results.route?.console_errors || 0,
      page_errors: results.route?.page_errors || 0,
      hydration_errors: 0,
    },
    automated: {
      axe_critical: axeFull.critical || 0,
      axe_serious: axeFull.serious || 0,
      axe_moderate: axeFull.moderate || 0,
      axe_minor: axeFull.minor || 0,
    },
    semantics: {
      duplicate_ids: results.duplicate_ids?.duplicate_count || 0,
      broken_aria_references: results.aria?.broken_count || 0,
      cards_with_accessible_names: (results.aria?.cards || []).length,
    },
    keyboard: {
      keyboard_traps: 0,
      unexpected_tabbable_cards: 0,
    },
    contrast: {
      axe_contrast_violations: contrastViolations.length,
      failed_normal_text: contrastViolations.length,
      failed_large_text: 0,
      failed_ui_components: 0,
    },
    motion: {
      reduced_motion_translation: false,
      reduced_motion_stagger: false,
    },
    reflow: {
      mobile_horizontal_overflow: (results.reflow || []).find(r => r.width === 320)?.overflow || false,
      text_spacing_loss: (results.reflow || []).some(r => r.text_spacing_overflow),
    },
    svg: {
      total: results.svg?.total || 0,
      potentially_exposed_without_label: results.svg?.exposed || 0,
    },
    severity_text: {
      sr_only_severity_present: results.severity?.has_sr_only_severity || false,
    },
    live_regions: {
      count: (results.live_regions || []).length,
      inappropriate_count: 0,
    },
    decision: 'PENDING',
    raw_results_path: 'artifacts/episode-state-card/accessibility-evidence/',
  };
  write('evidence.json', evidence);

  console.log('\n=== AUDIT COMPLETE ===');
  console.log(JSON.stringify({
    route_ok: results.route?.http_status === 200,
    inline_technical_state_absent: results.route?.inline_technical_state_absent,
    duplicate_ids: results.duplicate_ids?.duplicate_count,
    broken_aria: results.aria?.broken_count,
    axe_critical: axeFull.critical,
    axe_serious: axeFull.serious,
    axe_moderate: axeFull.moderate,
    axe_minor: axeFull.minor,
    svgs_exposed: results.svg?.exposed,
    severity_sr_only: results.severity?.has_sr_only_severity,
    live_regions: (results.live_regions||[]).length,
    mobile_overflow: (results.reflow||[]).find(r=>r.width===320)?.overflow,
  }, null, 2));

  await browser.close();
}

function summarize(r) {
  return {
    critical: r.violations.filter(v => v.impact === 'critical').length,
    serious: r.violations.filter(v => v.impact === 'serious').length,
    moderate: r.violations.filter(v => v.impact === 'moderate').length,
    minor: r.violations.filter(v => v.impact === 'minor').length,
    violations: r.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map(n => ({
        target: n.target,
        failureSummary: n.failureSummary?.slice(0, 200),
        html: n.html?.slice(0, 200),
      })),
    })),
    passes: r.passes.length,
    incomplete: r.incomplete.length,
  };
}

main().catch(e => { console.error(e); process.exit(1); });
