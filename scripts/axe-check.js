// Accessibility sweep using Playwright + axe-core/playwright
// Runs against key public URLs with the newsletter modal disabled via ?no-modal=1

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const urls = [
    'https://3mpwrapp.github.io/?no-modal=1',
    'https://3mpwrapp.github.io/about?no-modal=1',
    'https://3mpwrapp.github.io/features?no-modal=1',
    'https://3mpwrapp.github.io/user-guide?no-modal=1',
    'https://3mpwrapp.github.io/community?no-modal=1',
    'https://3mpwrapp.github.io/resources?no-modal=1',
    'https://3mpwrapp.github.io/wellness?no-modal=1',
    'https://3mpwrapp.github.io/contact?no-modal=1',
    'https://3mpwrapp.github.io/newsletter?no-modal=1',
    'https://3mpwrapp.github.io/blog?no-modal=1',
    'https://3mpwrapp.github.io/beta?no-modal=1',
    'https://3mpwrapp.github.io/search?no-modal=1',
    'https://3mpwrapp.github.io/site-map?no-modal=1',
    'https://3mpwrapp.github.io/accessibility?no-modal=1',
    'https://3mpwrapp.github.io/privacy?no-modal=1',
  ];

  let failures = 0;
  const report = [];

  for (const url of urls) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
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
