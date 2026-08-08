// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const resp = await page.goto('https://componentry-lab.vercel.app/episode-state-card', { waitUntil: 'networkidle' });

  console.log('HTTP:', resp.status());
  console.log('ETag:', resp.headers()['etag']);

  // Check unavailable variant
  await page.selectOption('select', 'unavailable');
  await page.waitForTimeout(800);

  const unavailableTexts = await page.evaluate(() => {
    const region = document.querySelector('[role="region"][aria-labelledby]');
    return Array.from(region.querySelectorAll('p')).map(p => p.textContent.trim());
  });
  console.log('\nUnavailable paragraphs:', JSON.stringify(unavailableTexts, null, 2));

  const hasDuplicate = unavailableTexts.length !== new Set(unavailableTexts).size;
  console.log('Has duplicate:', hasDuplicate);

  // Check React.useId pattern
  const ids = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[id]')).map(el => el.id).filter(Boolean);
  });
  const reactPattern = /^:r[a-zA-Z0-9]+:/;
  const hasReactIds = ids.some(id => reactPattern.test(id));
  console.log('\nSample IDs:', ids.slice(0, 6));
  console.log('Has React.useId IDs:', hasReactIds);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
