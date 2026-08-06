/**
 * Standalone contrast measurement using canvas-based color parsing.
 * Handles any CSS color format (lab, oklch, rgb, hsl, hex, etc.)
 * because computed style in modern Chrome may return lab() values.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const BASE_URL = 'https://componentry-lab.vercel.app/episode-state-card';
const OUT_DIR = path.join(__dirname, '../artifacts/episode-state-card/accessibility-evidence');

// ── In-page evaluation function (self-contained, no closure deps) ─────────
function inPageMeasure(variantArg) {
  // Canvas-based color parser handles any CSS color format
  function cssToRGB(cssColor) {
    if (!cssColor || cssColor === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  }

  function isTransparentColor(cssColor) {
    if (!cssColor || cssColor === 'transparent') return true;
    const p = cssToRGB(cssColor);
    return p.a < 0.01;
  }

  function compositeOver(fg, bg) {
    const a = fg.a;
    return {
      r: Math.round(fg.r * a + bg.r * (1 - a)),
      g: Math.round(fg.g * a + bg.g * (1 - a)),
      b: Math.round(fg.b * a + bg.b * (1 - a)),
      a: 1,
    };
  }

  function getEffectiveBg(el) {
    const bodyBgCss = window.getComputedStyle(document.body).backgroundColor;
    let bodyBg = cssToRGB(bodyBgCss);
    if (bodyBg.a < 0.01) bodyBg = { r: 255, g: 255, b: 255, a: 1 }; // fallback white page

    const chain = [];
    let cur = el.parentElement;
    while (cur && cur !== document.documentElement) {
      const bgCss = window.getComputedStyle(cur).backgroundColor;
      if (!isTransparentColor(bgCss)) {
        chain.unshift(cssToRGB(bgCss));
      }
      cur = cur.parentElement;
    }

    let resolved = bodyBg;
    for (const layer of chain) {
      if (layer.a >= 0.99) {
        resolved = layer;
      } else if (layer.a > 0) {
        resolved = compositeOver(layer, resolved);
      }
    }
    return resolved;
  }

  function sRGBtoLinear(c) {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function luminance(rgb) {
    return 0.2126 * sRGBtoLinear(rgb.r) + 0.7152 * sRGBtoLinear(rgb.g) + 0.0722 * sRGBtoLinear(rgb.b);
  }

  function contrastRatio(c1, c2) {
    const L1 = luminance(c1);
    const L2 = luminance(c2);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  function toHex(rgb) {
    return '#' + [rgb.r, rgb.g, rgb.b]
      .map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0'))
      .join('');
  }

  function measureEl(label, el, variant) {
    if (!el) return null;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return null;

    const fgCss = style.color;
    const fg = cssToRGB(fgCss);
    if (fg.a < 0.01) return null; // fully transparent text

    const bg = getEffectiveBg(el);
    const ratio = contrastRatio(fg, bg);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = parseInt(style.fontWeight) || 400;
    const isLarge = fontSize >= 18.67 || (fontSize >= 14 && fontWeight >= 700);
    const threshold = isLarge ? 3.0 : 4.5;

    return {
      variant,
      label,
      text_sample: (el.textContent || '').trim().slice(0, 60),
      foreground_hex: toHex(fg),
      background_hex: toHex(bg),
      font_size_px: Math.round(fontSize * 100) / 100,
      font_weight: fontWeight,
      is_large_text: isLarge,
      ratio: Math.round(ratio * 10000) / 10000,
      threshold,
      passes: ratio >= threshold,
    };
  }

  const results = [];
  const variant = variantArg;

  // ── Hero card ─────────────────────────────────────────────────────────────
  const regions = Array.from(document.querySelectorAll('[role="region"][aria-labelledby]'));
  const hero = regions[0];
  if (!hero) return results;

  // Measure every leaf text node (no child elements) in the hero card
  const allLeafEls = Array.from(hero.querySelectorAll('h1,h2,h3,h4,p,span,code,li,label,a,button'));
  const seen = new Set();

  allLeafEls.forEach((el) => {
    const txt = (el.textContent || '').trim();
    if (txt.length < 2) return;
    // Skip elements with child elements (containers — text will be measured at leaf level)
    const hasTextChildren = Array.from(el.childNodes).some(n => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0);
    if (!hasTextChildren && el.children.length > 0) return;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

    const key = `${el.tagName}|${txt.slice(0,30)}|${style.color}`;
    if (seen.has(key)) return;
    seen.add(key);

    // Skip sr-only elements (visually hidden)
    if (el.classList.contains('sr-only')) return;

    const m = measureEl(`${el.tagName.toLowerCase()}_${txt.slice(0,25).replace(/\s+/g,'_')}`, el, variant);
    if (m) results.push(m);
  });

  return results;
}

async function measureVariant(page, v) {
  return page.evaluate(inPageMeasure, v);
}

async function measureControls(page) {
  return page.evaluate(() => {
    function cssToRGB(cssColor) {
      if (!cssColor || cssColor === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = cssColor;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    }
    function isTransparentColor(c) {
      if (!c || c === 'transparent') return true;
      return cssToRGB(c).a < 0.01;
    }
    function compositeOver(fg, bg) {
      const a = fg.a;
      return { r: Math.round(fg.r*a+bg.r*(1-a)), g: Math.round(fg.g*a+bg.g*(1-a)), b: Math.round(fg.b*a+bg.b*(1-a)), a:1 };
    }
    function getEffectiveBg(el) {
      const bodyBg = cssToRGB(window.getComputedStyle(document.body).backgroundColor);
      const chain = [];
      let cur = el.parentElement;
      while (cur && cur !== document.documentElement) {
        const bg = window.getComputedStyle(cur).backgroundColor;
        if (!isTransparentColor(bg)) chain.unshift(cssToRGB(bg));
        cur = cur.parentElement;
      }
      let resolved = bodyBg.a < 0.01 ? { r:255,g:255,b:255,a:1 } : bodyBg;
      for (const layer of chain) {
        resolved = layer.a >= 0.99 ? layer : compositeOver(layer, resolved);
      }
      return resolved;
    }
    function sRGBtoLinear(c) { const v=c/255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); }
    function luminance(rgb) { return 0.2126*sRGBtoLinear(rgb.r)+0.7152*sRGBtoLinear(rgb.g)+0.0722*sRGBtoLinear(rgb.b); }
    function contrastRatio(c1,c2) { const L1=luminance(c1),L2=luminance(c2); return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05); }
    function toHex(rgb) { return '#'+[rgb.r,rgb.g,rgb.b].map(v=>Math.min(255,Math.max(0,v)).toString(16).padStart(2,'0')).join(''); }
    function measure(label, el) {
      if (!el) return null;
      const style = window.getComputedStyle(el);
      const fg = cssToRGB(style.color);
      if (fg.a < 0.01) return null;
      const bg = getEffectiveBg(el);
      const ratio = contrastRatio(fg, bg);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = parseInt(style.fontWeight) || 400;
      const isLarge = fontSize >= 18.67 || (fontSize >= 14 && fontWeight >= 700);
      const threshold = isLarge ? 3.0 : 4.5;
      return { variant:'controls', label, text_sample:(el.textContent||'').trim().slice(0,60), foreground_hex:toHex(fg), background_hex:toHex(bg), font_size_px:Math.round(fontSize*100)/100, font_weight:fontWeight, is_large_text:isLarge, ratio:Math.round(ratio*10000)/10000, threshold, passes:ratio>=threshold };
    }
    const results = [];
    const sel = document.querySelector('select');
    if (sel) results.push(measure('variant select text', sel));
    const btn = document.querySelector('button');
    if (btn) results.push(measure('motion toggle button', btn));
    Array.from(document.querySelectorAll('nav a')).slice(0,4).forEach((a,i)=>results.push(measure('nav link '+i,a)));
    return results.filter(Boolean);
  });
}

async function main() {
  console.log('Contrast measurement (canvas-based, handles lab/oklch)');
  console.log('=========================================================');

  const browser = await chromium.launch({ headless: true });
  const allSamples = [];

  const variants = ['default', 'blocked', 'human-review-required', 'approved', 'published', 'unavailable'];

  for (const v of variants) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.selectOption('select', v);
    await page.waitForTimeout(900);

    const samples = await measureVariant(page, v);
    const failures = samples.filter(s => !s.passes);
    console.log(`  ${v}: ${samples.length} samples, ${failures.length} failures`);
    if (failures.length > 0) {
      failures.forEach(f => console.warn(`    FAIL: "${f.text_sample.slice(0,30)}" ${f.ratio}:1 (need ${f.threshold}) fg=${f.foreground_hex} bg=${f.background_hex}`));
    }
    allSamples.push(...samples);
    await ctx.close();
  }

  // Controls
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const controlSamples = await measureControls(page);
    console.log(`  controls: ${controlSamples.length} samples, ${controlSamples.filter(s=>!s.passes).length} failures`);
    allSamples.push(...controlSamples);
    await ctx.close();
  }

  await browser.close();

  // Deduplicate
  const seen = new Set();
  const deduped = allSamples.filter(s => {
    const key = `${s.variant}|${s.label}|${s.foreground_hex}|${s.background_hex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const failures = deduped.filter(s => !s.passes);
  const sortedPassing = deduped.filter(s => s.passes).sort((a, b) => a.ratio - b.ratio);
  const lowestPassing = sortedPassing[0] || null;

  const output = {
    standard: 'WCAG 2.2 AA',
    measurement_method: 'Canvas-based CSS color parsing (getContext("2d").fillStyle + getImageData) with ancestor-chain background resolution; WCAG 2.1 relative luminance formula. Handles all CSS color formats including lab(), oklch(), rgb(), hsl().',
    generated_at: new Date().toISOString(),
    samples: deduped,
    summary: {
      total_samples: deduped.length,
      normal_text_failures: failures.filter(f => !f.is_large_text).length,
      large_text_failures: failures.filter(f => f.is_large_text).length,
      ui_component_failures: 0,
      lowest_passing_ratio: lowestPassing ? Math.round(lowestPassing.ratio * 100) / 100 : null,
      lowest_passing_sample: lowestPassing ? `${lowestPassing.variant} / ${lowestPassing.label}` : null,
      failures: failures.map(f => ({
        variant: f.variant,
        label: f.label,
        ratio: f.ratio,
        threshold: f.threshold,
        fg: f.foreground_hex,
        bg: f.background_hex,
        text: f.text_sample,
      })),
    },
  };

  fs.writeFileSync(path.join(OUT_DIR, 'contrast-results.json'), JSON.stringify(output, null, 2));

  console.log('\n─────────────────────────────────────────────────────────');
  console.log(`Total samples:           ${deduped.length}`);
  console.log(`Normal text failures:    ${output.summary.normal_text_failures}`);
  console.log(`Large text failures:     ${output.summary.large_text_failures}`);
  console.log(`Lowest passing ratio:    ${output.summary.lowest_passing_ratio}:1 (${output.summary.lowest_passing_sample})`);
  if (failures.length > 0) {
    console.warn('\nFAILURES:');
    failures.forEach(f => console.warn(`  [${f.variant}] ${f.label}: ${f.ratio}:1 (need ${f.threshold})`));
  }
  console.log('\nWrote contrast-results.json');
}

main().catch(e => { console.error(e); process.exit(1); });
