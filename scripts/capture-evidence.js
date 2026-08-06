// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const BASE_URL = 'https://componentry-lab.vercel.app/episode-state-card';
const OUTPUT_DIR = path.join(__dirname, '../artifacts/episode-state-card/visual-evidence');

const VARIANTS = [
  { value: 'default', file: 'episode-state-card-default.png' },
  { value: 'blocked', file: 'episode-state-card-blocked.png' },
  { value: 'human-review-required', file: 'episode-state-card-human-review.png' },
  { value: 'approved', file: 'episode-state-card-approved.png' },
  { value: 'published', file: 'episode-state-card-published.png' },
  { value: 'unavailable', file: 'episode-state-card-unavailable.png' },
];

async function captureVariant(browser, variant) {
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Select the variant from dropdown
    const select = await page.$('select');
    if (select) {
      await select.selectOption(variant.value);
      await page.waitForTimeout(500);
    }

    // Wait for animation
    await page.waitForTimeout(1000);

    // Capture the hero section
    const heroSection = await page.$('section:has(h2:has-text("Workflow State Display"))');
    if (heroSection) {
      const filePath = path.join(OUTPUT_DIR, variant.file);
      await heroSection.screenshot({ path: filePath });
      console.log(`? Captured ${variant.file}`);
      return true;
    }

    console.error(`? Could not find hero section for ${variant.value}`);
    return false;
  } catch (error) {
    console.error(`Error capturing ${variant.value}:`, error.message);
    return false;
  } finally {
    await page.close();
  }
}

async function captureMobile(browser) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 320, height: 1000 });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Select blocked variant for mobile
    const select = await page.$('select');
    if (select) {
      await select.selectOption('blocked');
      await page.waitForTimeout(500);
    }

    // Check for horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    console.log(`Mobile overflow check: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}, overflow=${scrollWidth > clientWidth}`);

    const heroSection = await page.$('section:has(h2:has-text("Workflow State Display"))');
    if (heroSection) {
      const filePath = path.join(OUTPUT_DIR, 'episode-state-card-mobile-320.png');
      await heroSection.screenshot({ path: filePath });
      console.log(`? Captured episode-state-card-mobile-320.png`);
      return true;
    }

    console.error(`? Could not find hero section for mobile`);
    return false;
  } catch (error) {
    console.error('Error capturing mobile:', error.message);
    return false;
  } finally {
    await page.close();
  }
}

async function captureReducedMotion(browser) {
  const page = await browser.newPage();
  // Emulate reduced motion preference
  await page.emulateMedia({ reducedMotion: 'reduce' });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Select human-review-required variant
    const select = await page.$('select');
    if (select) {
      await select.selectOption('human-review-required');
      await page.waitForTimeout(500);
    }

    // Click reduced motion button
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await button.textContent();
      if (text.includes('Motion')) {
        await button.click();
        await page.waitForTimeout(500);
        break;
      }
    }

    const heroSection = await page.$('section:has(h2:has-text("Workflow State Display"))');
    if (heroSection) {
      const filePath = path.join(OUTPUT_DIR, 'episode-state-card-reduced-motion.png');
      await heroSection.screenshot({ path: filePath });
      console.log(`? Captured episode-state-card-reduced-motion.png`);
      return true;
    }

    console.error(`? Could not find hero section for reduced motion`);
    return false;
  } catch (error) {
    console.error('Error capturing reduced motion:', error.message);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting visual evidence capture...\n');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    // Capture all variants
    for (const variant of VARIANTS) {
      const success = await captureVariant(browser, variant);
      results.push({ variant: variant.value, file: variant.file, captured: success });
    }

    // Capture mobile
    const mobileCaptured = await captureMobile(browser);
    results.push({ variant: 'mobile-320', file: 'episode-state-card-mobile-320.png', captured: mobileCaptured });

    // Capture reduced motion
    const rmCaptured = await captureReducedMotion(browser);
    results.push({ variant: 'reduced-motion', file: 'episode-state-card-reduced-motion.png', captured: rmCaptured });

  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n=== Capture Summary ===');
  results.forEach(r => {
    const status = r.captured ? '?' : '?';
    console.log(`${status} ${r.variant}: ${r.file}`);
  });

  const allCaptured = results.every(r => r.captured);
  process.exit(allCaptured ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
