// Accessibility sweep using Playwright + axe-core/playwright
// Runs against key public URLs with the newsletter modal disabled via ?no-modal=1

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

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

  for (const url of urls) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const count = results.violations.length;
    console.log(`AXE: ${url} - ${count} violation(s)`);
    if (count > 0) {
      failures += count;
    }
  }

  await browser.close();
  if (failures > 0) {
    process.exitCode = 1;
  }
})().catch((err) => {
  console.error('AXE run failed:', err);
  process.exitCode = 1;
});
