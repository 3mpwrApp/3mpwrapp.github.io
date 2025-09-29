import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const inputRel = 'docs/release-prep/legal/privacy-policy.html';
  const outputRel = 'docs/release-prep/legal/privacy-policy.pdf';
  const inputPath = path.resolve(__dirname, '..', inputRel);
  const outputPath = path.resolve(__dirname, '..', outputRel);

  // Ensure input exists
  try {
    await fs.access(inputPath);
  } catch (e) {
    console.error(`Input HTML not found at ${inputPath}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    const html = await fs.readFile(inputPath, 'utf-8');
    // Use setContent to avoid file:// navigation flakiness on Windows
    await page.setContent(html, { waitUntil: 'load' });

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '16mm', left: '12mm' },
      preferCSSPageSize: false,
    });
    console.log(`Wrote PDF → ${outputPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
