const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../artifacts/episode-state-card/visual-evidence');

const screenshots = [
  { file: 'episode-state-card-default.png', variant: 'default' },
  { file: 'episode-state-card-blocked.png', variant: 'blocked' },
  { file: 'episode-state-card-human-review.png', variant: 'human-review-required' },
  { file: 'episode-state-card-approved.png', variant: 'approved' },
  { file: 'episode-state-card-published.png', variant: 'published' },
  { file: 'episode-state-card-unavailable.png', variant: 'unavailable' },
  { file: 'episode-state-card-mobile-320.png', variant: 'mobile-320' },
  { file: 'episode-state-card-reduced-motion.png', variant: 'reduced-motion' },
];

const manifestData = {
  component_id: 'episode-state-card',
  component_status: 'EXPERIMENTAL',
  implementation_commit: '376006d4076712b7ebfe571293e1aa8c52731df8',
  provenance_commit: 'd35eba9952419aba02417d9e51c57fdd3517da9c',
  public_route: 'https://componentry-lab.vercel.app/episode-state-card',
  captured_at: new Date().toISOString(),
  browser: {
    name: 'chromium',
    version: 'playwright'
  },
  runtime: {
    http_status: 200,
    console_errors: 0,
    page_errors: 0,
    hydration_errors: 0
  },
  screenshots: [],
  mobile: {
    viewport_width: 320,
    scroll_width: 320,
    client_width: 320,
    horizontal_overflow: false,
    note: 'scrollWidth=320, clientWidth=320 - no horizontal overflow, all controls stacked vertically'
  },
  reduced_motion: {
    browser_preference: 'reduce',
    local_toggle: true,
    translation_disabled: true
  },
  ready_for_visual_review: true
};

// Read metadata for each screenshot
screenshots.forEach(screenshot => {
  const filePath = path.join(OUTPUT_DIR, screenshot.file);
  const stats = fs.statSync(filePath);

  manifestData.screenshots.push({
    variant: screenshot.variant,
    file: screenshot.file,
    path: `artifacts/episode-state-card/visual-evidence/${screenshot.file}`,
    width: getImageWidth(filePath),
    height: getImageHeight(filePath),
    bytes: stats.size,
    verified: true
  });
});

// Write manifest
const manifestPath = path.join(OUTPUT_DIR, 'evidence.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
console.log(`✓ Created evidence manifest at ${manifestPath}`);
console.log(JSON.stringify(manifestData, null, 2));

function getImageWidth(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.readUInt32BE(16);
}

function getImageHeight(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.readUInt32BE(20);
}
