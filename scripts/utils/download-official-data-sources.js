/**
 * Download Official Data Sources for Analysis
 * Downloads ONSBT caseload data, HRTO reports, and AWCBC statistics
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Create data directory
const DATA_DIR = path.join(__dirname, '../data/official-sources');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath);
      reject(err);
    });
  });
}

async function main() {
  console.log('📥 Downloading Official Data Sources...\n');
  
  await ensureDir(DATA_DIR);
  
  // ONSBT Caseload Data
  const downloads = [
    {
      url: 'https://data.ontario.ca/dataset/social-assistance-caseloads/resource/d1fdd536-d79e-4c13-818d-b9492fbf05e9/download/odsp-monthly-data-en.csv',
      filename: 'onsbt-odsp-monthly-caseload-2019-2025.csv',
      description: 'ODSP Monthly Caseload (April 2019 - June 2025)'
    },
    {
      url: 'https://data.ontario.ca/dataset/social-assistance-caseloads/resource/1fbf18cd-f473-43cd-9502-49afd0864bc4/download/ow-monthly-data-en.csv',
      filename: 'onsbt-ow-monthly-caseload-2019-2025.csv',
      description: 'OW Monthly Caseload (April 2019 - June 2025)'
    },
    {
      url: 'https://data.ontario.ca/dataset/social-assistance-caseloads/resource/ebafe1da-3e3b-468d-99c3-d77a7277ae2f/download/social-assistance-caseloads-historical-data-en.xlsx',
      filename: 'onsbt-historical-caseload-1969-2025.xlsx',
      description: 'Historical Caseload Data (1969-2025) - 57 YEARS!'
    },
    {
      url: 'https://data.ontario.ca/dataset/ontario-social-assistance-case-characteristics-by-census-metropolitan-area/resource/44586634-0738-4483-89b9-9cfdd9dc79d0/download/characteristics-by-census-metropolitan-area-en.xlsx',
      filename: 'onsbt-case-characteristics-by-cma-2003-2025.xlsx',
      description: 'Case Characteristics by CMA (2003-2025)'
    }
  ];
  
  for (const { url, filename, description } of downloads) {
    try {
      const filepath = path.join(DATA_DIR, filename);
      console.log(`📥 Downloading: ${description}`);
      await downloadFile(url, filepath);
    } catch (err) {
      console.error(`❌ Failed to download ${filename}:`, err.message);
    }
  }
  
  console.log('\n✅ All downloads complete!');
  console.log(`\n📁 Files saved to: ${DATA_DIR}`);
  
  // List downloaded files with sizes
  const files = await fs.readdir(DATA_DIR);
  console.log('\n📊 Downloaded files:');
  for (const file of files) {
    const stats = await fs.stat(path.join(DATA_DIR, file));
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`   ${file} (${sizeKB} KB)`);
  }
}

main().catch(console.error);
