import type { Campaign } from "../types/models";

// NOTE: Every Canadian Counts is the ONLY real campaign from an actual organization.
// All other campaigns in the past were samples/examples and have been removed.
// This campaign represents a genuine petition to Parliament of Canada.

export const campaigns: Campaign[] = [
  {
    id: 'every-canadian-counts',
    title: 'Every Canadian Counts',
    summary: 'Support a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities. Sign and share petition e-6746.',
    target: 'Parliament of Canada',
    goalCount: 100000,
    membersCount: 460, // Real signature count as of November 9, 2025
    contactEmail: 'contact@everycanadiancounts.com',
    createdAt: Date.now(),
    // Extended fields for this specific campaign
    petitionId: 'e-6746',
    petitionUrl: 'https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6746',
    websiteUrl: 'https://everycanadiancounts.com',
    description: `Every Canadian Counts is a movement to ensure that those with long-term or chronic disabilities have access to:

• Housing
• Professional support
• Caregivers
• Programs and services
• Assistive technologies

All provided through a publicly funded national disability insurance plan, similar to Australia's National Disability Insurance Scheme (NDIS).`,
    legislation: [
      {
        name: 'Bill C-22',
        fullName: 'An Act to Reduce Poverty and to Support the Financial Security of Persons with Disabilities',
        status: 'Passed',
        description: 'Establishes the Canada Disability Benefit to reduce poverty among working-age persons with disabilities.',
      },
      {
        name: 'Accessible Canada Act',
        fullName: 'An Act to Ensure a Barrier-free Canada',
        status: 'In Force',
        description: 'Federal accessibility legislation to identify, remove, and prevent barriers to accessibility.',
      },
    ],
    internationalModel: {
      country: 'Australia',
      name: 'National Disability Insurance Scheme (NDIS)',
      description: 'Provides support for Australians with permanent and significant disability. Covers reasonable and necessary supports including daily activities, employment, social participation, and more.',
      launchYear: 2013,
      url: 'https://www.ndis.gov.au',
    },
    actionItems: [
      { id: 1, text: 'Sign petition e-6746', completed: false },
      { id: 2, text: 'Share petition on social media', completed: false },
      { id: 3, text: 'Email your MP about disability insurance', completed: false },
      { id: 4, text: 'Join the Every Canadian Counts community', completed: false },
      { id: 5, text: 'Attend a local advocacy event', completed: false },
    ],
    shareTemplates: {
      twitter: 'Every Canadian with a disability deserves access to housing, support, and care. Sign petition e-6746 for a national disability insurance plan! #EveryCanadianCounts #DisabilityRights\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
      facebook: 'I just signed a petition calling for a publicly funded national disability insurance plan in Canada - similar to Australia\'s successful NDIS model. Those with long-term or chronic disabilities deserve access to housing, professionals, caregivers, programs, and technologies. Sign petition e-6746 and share! #EveryCanadianCounts\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
      email: {
        subject: 'Support Every Canadian Counts - National Disability Insurance',
        body: `Hi,

I wanted to share an important petition with you: Every Canadian Counts.

This petition calls for a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities - ensuring access to housing, professional support, caregivers, programs, and assistive technologies.

Similar to Australia's successful National Disability Insurance Scheme (NDIS), this plan would complement Bill C-22 and the Accessible Canada Act to truly support Canadians with disabilities.

Please sign and share: https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6746

Learn more: https://everycanadiancounts.com

🔗 Powered by 3mpwr App
🌐 https://3mpwrapp.pages.dev/campaigns/

Thank you!`,
      },
    },
  } as Campaign & {
    petitionId?: string;
    petitionUrl?: string;
    websiteUrl?: string;
    description?: string;
    legislation?: Array<{
      name: string;
      fullName: string;
      status: string;
      description: string;
    }>;
    internationalModel?: {
      country: string;
      name: string;
      description: string;
      launchYear: number;
      url: string;
    };
    actionItems?: Array<{
      id: number;
      text: string;
      completed: boolean;
    }>;
    shareTemplates?: {
      twitter: string;
      facebook: string;
      email: {
        subject: string;
        body: string;
      };
    };
  },
];

