// Accessibility sweep using Playwright + axe-core/playwright
// Runs against key public URLs with the newsletter modal disabled via ?no-modal=1

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const siteConfig = require('./site-config');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const base = process.env.SITE_URL || siteConfig.url;
  const q = '?no-modal=1';
  const mode = (process.env.AXE_MODE || 'quick').toLowerCase();
  const quick = [
    `${base}/${q}`,
    `${base}/about${q}`,
    `${base}/features${q}`,
    `${base}/user-guide${q}`,
    `${base}/blog${q}`,
    `${base}/contact${q}`,
    `${base}/privacy${q}`,
  ];
  const full = [
    `${base}/${q}`,
    `${base}/about${q}`,
    `${base}/features${q}`,
    `${base}/user-guide${q}`,
    `${base}/community${q}`,
    `${base}/resources${q}`,
    `${base}/wellness${q}`,
    `${base}/contact${q}`,
    `${base}/newsletter${q}`,
    `${base}/blog${q}`,
    `${base}/beta${q}`,
    `${base}/search${q}`,
    `${base}/site-map${q}`,
    `${base}/accessibility${q}`,
    `${base}/privacy${q}`,
  ];
  const urls = mode === 'full' ? full : quick;

  let failures = 0;
  const report = [];

  async function gotoWithRetry(p, url, attempts = 3) {
    let lastErr;
    for (let i = 1; i <= attempts; i++) {
      try {
        await p.goto(url, { waitUntil: 'load', timeout: 20000 });
        // tiny settle time for client JS
        await p.waitForTimeout(300);
        return;
      } catch (e) {
        lastErr = e;
        console.warn(`goto attempt ${i} failed for ${url}:`, e.message || e);
        await p.waitForTimeout(500 * i);
      }
    }
    throw lastErr;
  }

  for (const url of urls) {
    await gotoWithRetry(page, url, 3);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const count = results.violations.length;
    console.log(`AXE: ${url} - ${count} violation(s)`);
    report.push({ url, violations: results.violations });
    if (count > 0) failures += count;
  }

  // Write JSON artifact
  try { fs.writeFileSync('axe-report.json', JSON.stringify(report, null, 2)); } catch {}

  // Write GitHub Step Summary (or local file if not in Actions)
  try {
    const outPath = process.env.GITHUB_STEP_SUMMARY || 'axe-summary.md';
    let md = '# axe-core Summary\n\n';
    let total = 0;
    for (const page of report) {
      const vios = page.violations || [];
      const cnt = vios.length;
      total += cnt;
      md += `## ${page.url} — ${cnt} violation(s)\n`;
      if (cnt) {
        for (const v of vios.slice(0, 10)) {
          const nodes = Array.isArray(v.nodes) ? v.nodes.length : 0;
          const impact = v.impact || 'n/a';
          md += `- [${v.id}] ${v.help} — impact: ${impact}; nodes: ${nodes} ([rule](${v.helpUrl}))\n`;
        }
        if (cnt > 10) {
          md += `- …and ${cnt - 10} more on this page\n`;
        }
      }
      md += '\n';
    }
    md += `\nTotal violations (sum across pages): ${total}\n`;
    fs.writeFileSync(outPath, md);
  } catch {}

  await browser.close();
  if (failures > 0) {
    process.exitCode = 1;
  }
})().catch((err) => {
  console.error('AXE run failed:', err);
  process.exitCode = 1;
});
