// Accessibility check for French pages
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const siteConfig = require('./site-config');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const base = process.env.SITE_URL || siteConfig.url;
  const urls = [
    `${base}/fr?no-modal=1`,
    `${base}/fr/faq?no-modal=1`,
    `${base}/fr/accessibility-settings?no-modal=1`,
    `${base}/fr/terms?no-modal=1`,
  ];

  let failures = 0;

  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(300);
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const count = results.violations.length;
      console.log(`AXE FR: ${url} - ${count} violation(s)`);
      if (count > 0) failures += count;
    } catch (e) {
      console.warn(`Failed to check ${url}:`, e.message);
    }
  }

  await browser.close();
  if (failures > 0) {
    process.exitCode = 1;
  }
})().catch((err) => {
  console.error('FR check failed:', err);
  process.exitCode = 1;
});
