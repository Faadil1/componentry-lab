// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('https://componentry-lab.vercel.app/episode-state-card', { waitUntil: 'networkidle' });
  await page.selectOption('select', 'default');
  await page.waitForTimeout(1200);

  const debug = await page.evaluate(() => {
    const region = document.querySelector('[role="region"][aria-labelledby]');
    const h2 = region ? region.querySelector('h2') : null;
    const h2Style = h2 ? window.getComputedStyle(h2) : null;
    const bodyStyle = window.getComputedStyle(document.body);

    // Get the card's own background color
    const cardEl = document.querySelector('[role="region"]');
    const cardStyle = cardEl ? window.getComputedStyle(cardEl) : null;

    // Walk up from h2 to find backgrounds
    const bgChain = [];
    let cur = h2 ? h2.parentElement : null;
    while (cur && cur !== document.documentElement) {
      const bg = window.getComputedStyle(cur).backgroundColor;
      bgChain.push({ tag: cur.tagName, class: cur.className.slice(0, 40), bg });
      cur = cur.parentElement;
    }

    // All p elements
    const allP = Array.from(region ? region.querySelectorAll('p') : []);

    return {
      region_exists: !!region,
      region_role: region ? region.getAttribute('role') : null,
      h2_exists: !!h2,
      h2_text: h2 ? h2.textContent.trim() : null,
      h2_color: h2Style ? h2Style.color : null,
      h2_font_size: h2Style ? h2Style.fontSize : null,
      body_bg: bodyStyle.backgroundColor,
      card_bg: cardStyle ? cardStyle.backgroundColor : null,
      bg_chain: bgChain.slice(0, 8),
      p_count: allP.length,
      first_p_text: allP[0] ? allP[0].textContent.trim().slice(0, 40) : null,
      first_p_color: allP[0] ? window.getComputedStyle(allP[0]).color : null,
      first_p_font_size: allP[0] ? window.getComputedStyle(allP[0]).fontSize : null,
    };
  });

  console.log(JSON.stringify(debug, null, 2));
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
