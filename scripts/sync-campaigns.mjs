// Sync campaigns to Cloudflare Worker
// Run with: node scripts/sync-campaigns.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const campaignsPath = path.join(__dirname, '..', 'public', 'api', 'campaigns.json');
const campaigns = JSON.parse(fs.readFileSync(campaignsPath, 'utf8'));

const WORKER_URL = 'https://3mpwrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns/bulk';

async function syncCampaigns() {
  try {
    console.log('Syncing', campaigns.length, 'campaigns to worker...');

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaigns }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Sync result:', result);

  } catch (error) {
    console.error('Sync failed:', error);
  }
}

syncCampaigns();