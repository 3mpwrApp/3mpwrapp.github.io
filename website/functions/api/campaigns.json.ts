/**
 * Cloudflare Pages Function - GET /api/campaigns.json
 * Returns campaigns data 
 * Note: Cloudflare Pages Functions don't support TypeScript imports from parent directories
 * So we embed the data directly here
 */

// Embed campaigns data directly (synced from data/campaigns.ts)
const campaigns = [
  {
    id: 'every-canadian-counts',
    title: 'Every Canadian Counts',
    summary: 'Support a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities. Sign and share petition e-6746.',
    target: 'Parliament of Canada',
    goalCount: 100000,
    membersCount: 460,
    contactEmail: 'info@everycanadiancounts.com',
    createdAt: 1731196800000,
  },
  {
    id: 'no-more-poverty-pwd',
    title: 'No More Poverty for Persons with Disabilities',
    summary: 'Fight for adequate financial support for ALL disabled Canadians living on government-imposed poverty-level disability income support.',
    target: 'Federal and Provincial Governments',
    goalCount: 50000,
    membersCount: 0,
    contactEmail: 'contact@ashoutabout.ca',
    createdAt: Date.now(),
  },
  {
    id: 'stop-cpp-disability-privatization',
    title: 'Stop CPP Disability Privatization',
    summary: 'End the privatization of CPP Disability benefits by insurance companies. Restore disabled Canadians\' earned pensions.',
    target: 'Parliament of Canada',
    goalCount: 25000,
    membersCount: 0,
    contactEmail: 'karen@thetiderises.ca',
    createdAt: Date.now(),
  },
  {
    id: 'rights-dont-retire',
    title: 'Rights Don\'t Retire - Queens Park Rally',
    summary: 'Injured Workers are coming to Queens Park Toronto to demand removal of the age 65 cut-off for Older Injured Workers from the Workplace Safety and Insurance Act (WSIA).',
    target: 'Ontario Provincial Government & MPPs',
    goalCount: 10000,
    membersCount: 0,
    contactEmail: 'info@injuredworkerscommunitylegalclinic.ca',
    createdAt: Date.now(),
  },
];

export async function onRequest(_context: any) {
  return new Response(
    JSON.stringify({
      campaigns,
      count: campaigns.length,
      lastUpdated: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    }
  );
}
