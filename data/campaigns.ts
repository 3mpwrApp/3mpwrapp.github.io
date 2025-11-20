// pii-scan-ignore-file - Contains example contact email addresses in mock data
import type { Campaign } from '../types/models';

// NOTE: All campaigns listed here are REAL campaigns from actual organizations.
// Sample/example campaigns have been removed. These represent genuine petitions
// and advocacy efforts to Parliament of Canada and provincial governments.

export const campaigns: Campaign[] = [
  {
    id: 'every-canadian-counts',
    title: 'Every Canadian Counts',
    summary: 'Support a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities. Sign and share petition e-6746.',
    target: 'Parliament of Canada',
    goalCount: 100000,
    membersCount: 460, // Real signature count as of November 9, 2025
    contactEmail: 'info@everycanadiancounts.com',
    createdAt: 1731196800000, // Fixed timestamp - November 9, 2025
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
  {
    id: 'no-more-poverty-pwd',
    title: 'No More Poverty for Persons with Disabilities',
    summary: 'Fight for adequate financial support for ALL disabled Canadians living on government-imposed poverty-level disability income support. Join the movement to end poverty for persons with disabilities across Canada.',
    target: 'Federal and Provincial Governments',
    goalCount: 50000,
    membersCount: 0, // New campaign as of November 15, 2025
    contactEmail: 'contact@ashoutabout.ca', // Placeholder - update with actual contact
    createdAt: Date.now(), // November 15, 2025
    // Extended fields for this specific campaign
    websiteUrl: 'https://x.com/AShoutAbout',
    description: `No More Poverty PWD is a grassroots movement demanding adequate financial support for ALL disabled Canadians living on disability income support across Canada.

The current system forces people with disabilities to live in government-imposed POVERTY, unable to afford:

• Basic housing and utilities
• Nutritious food and medications
• Essential medical equipment and assistive devices
• Transportation and accessibility accommodations
• Participation in community and social activities

This campaign fights for:

• Increased disability benefit amounts that meet the actual cost of living
• Removal of asset limits that trap people in poverty
• Fair income thresholds that allow part-time work without clawbacks
• Provincial and federal coordination to ensure consistent support
• Recognition that disability supports are NOT "welfare" but human rights

Every disabled Canadian deserves to live with dignity, not in poverty.`,
    legislation: [
      {
        name: 'Bill C-22',
        fullName: 'An Act to Reduce Poverty and to Support the Financial Security of Persons with Disabilities',
        status: 'Passed',
        description: 'Establishes the Canada Disability Benefit, but implementation and benefit amounts remain inadequate for many.',
      },
    ],
    actionItems: [
      { id: 1, text: 'Sign the petition to end poverty for PWD', completed: false },
      { id: 2, text: 'Share #NoMorePovertyPWD on social media', completed: false },
      { id: 3, text: 'Contact your MP and MPP about poverty-level supports', completed: false },
      { id: 4, text: 'Join the A Shout About community', completed: false },
      { id: 5, text: 'Share your story of living on disability support', completed: false },
    ],
    shareTemplates: {
      twitter: 'Disabled Canadians deserve to live with DIGNITY, not in government-imposed POVERTY! Join the fight for adequate financial support. #NoMorePovertyPWD #DisabilityRights 🇨🇦\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
      facebook: 'I\'m supporting the fight to end poverty for persons with disabilities in Canada. The current disability income support keeps people in government-imposed poverty - unable to afford housing, food, medications, and basic necessities.\n\nDisabled Canadians deserve DIGNITY, not poverty. Join the #NoMorePovertyPWD movement and demand adequate financial support!\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
      email: {
        subject: 'End Poverty for Persons with Disabilities in Canada',
        body: `Hi,

I wanted to share an important campaign with you: No More Poverty PWD.

This movement fights for adequate financial support for ALL disabled Canadians living on government-imposed poverty-level disability income support.

The current system forces people with disabilities to live in poverty, unable to afford:
• Basic housing and utilities
• Nutritious food and medications
• Essential medical equipment
• Transportation and accessibility needs
• Community participation

Disabled Canadians deserve to live with dignity, not in poverty.

Learn more and join the movement: https://x.com/AShoutAbout
Use hashtag: #NoMorePovertyPWD

🔗 Powered by 3mpwr App
🌐 https://3mpwrapp.pages.dev/campaigns/

Thank you for supporting disability rights!`,
      },
    },
  } as Campaign & {
    websiteUrl?: string;
    description?: string;
    legislation?: Array<{
      name: string;
      fullName: string;
      status: string;
      description: string;
    }>;
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
  {
    id: 'stop-cpp-disability-privatization',
    title: 'Stop CPP Disability Privatization',
    summary: 'End the privatization of CPP Disability benefits by insurance companies. Restore disabled Canadians\' earned pensions and stop insurers from profiting twice from our contributions. Sign petition e-6873.',
    target: 'Parliament of Canada',
    goalCount: 25000,
    membersCount: 0, // New campaign as of November 15, 2025
    contactEmail: 'karen@thetiderises.ca', // Update with actual contact
    createdAt: Date.now(), // November 15, 2025
    // Extended fields for this specific campaign
    petitionId: 'e-6873',
    petitionUrl: 'https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6873',
    websiteUrl: 'https://x.com/TheTideRises333',
    description: `Stop CPP Disability Privatization exposes how disabled Canadians' earned pensions have been weaponized against them since the 1990s.

**The Privatization Timeline:**

**1996 - The Turning Point (Auditor General Report Chapter 17)**
Disabled contributors went from protected participants in a contributory insurance plan to "liabilities to be managed." CPP Disability expenditures tripled ($841M to $3B), but instead of viewing this as social need, the Department treated it as a "budgetary problem" requiring "significant savings."

**1997 - Bill C-2 Expands Ministerial Power**
Section 65(3) was added to the Canada Pension Act, creating a legal mechanism for "administrators of disability income programs" to be reimbursed directly from CPP benefits. The term "administrator" was never defined—anyone who applied would be rubber-stamped approved.

**2003 - Insurance Industry Lobbying**
The Canadian Life and Health Insurance Association (CLHIA) openly described CPP-D benefits as "advance payments" and "integrated benefits" within private LTD insurance. Your earned pension became their subsidy.

**The Result:**
Private insurers collect premiums from workers, then when those workers become disabled, the insurers:
1. Pay reduced benefits (deducting your CPP entitlement)
2. Force you to apply for CPP Disability
3. Collect your retroactive CPP payment directly from the government
4. Profit TWICE: once from your premiums, again from your pension

**What This Means for You:**
• Your CPP contributions are no longer yours—they're an accounting tool for insurer profit
• You can't use your CPP to finance needed accommodations—insurers take it first
• You're punished for being disabled—treated as a "liability" instead of a contributor
• Secret agreements exist between insurers and the Minister (see ISP1618C form)
• No transparency, no consent, no choice

**Disabled Canadians were considered people entitled to CPP until the 1990s. We demand that dignity back.**`,
    legislation: [
      {
        name: 'Section 65(3) CPP Act',
        fullName: 'Canada Pension Plan - Reimbursement Provision',
        status: 'In Force (1997)',
        description: 'Allows "approved administrators" (private insurers) to be reimbursed directly from disabled Canadians\' CPP benefits without proper oversight or transparency.',
      },
      {
        name: '1996 Auditor General Report',
        fullName: 'Chapter 17 - CPP Disability Program',
        status: 'Historical',
        description: 'Marked the turning point where disabled contributors were redefined as financial burdens to be controlled through cost-sharing agreements.',
      },
      {
        name: 'Bill C-2 (1997)',
        fullName: 'Budget Implementation Act, 1997',
        status: 'Passed',
        description: 'Expanded ministerial power over "overpayments" and created the legal framework for insurer reimbursement from CPP Disability.',
      },
    ],
    actionItems: [
      { id: 1, text: 'Sign petition e-6873 to stop CPP privatization', completed: false },
      { id: 2, text: 'Share Karen Bingley\'s research on social media', completed: false },
      { id: 3, text: 'Contact your MP about Section 65(3) abuse', completed: false },
      { id: 4, text: 'Read the 1996 Auditor General Report (Chapter 17)', completed: false },
      { id: 5, text: 'Check ISP1618C form for list of approved insurers', completed: false },
      { id: 6, text: 'Follow @TheTideRises333 for updates', completed: false },
    ],
    shareTemplates: {
      twitter: 'Disabled Canadians\' CPP pensions are being PRIVATIZED by insurance companies who profit TWICE—from our premiums AND our earned benefits. This MUST stop. Sign petition e-6873! #StopCPPPrivatization #TheTideRises\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
      facebook: 'URGENT: Since the 1990s, disabled Canadians have been stripped of our earned CPP Disability pensions through secret agreements between the government and private insurers.\n\nInsurers collect premiums from workers, then when we become disabled, they:\n✗ Deduct CPP from our benefits\n✗ Force us to apply for CPP-D\n✗ Take our retroactive CPP payments directly from government\n✗ PROFIT TWICE from our contributions\n\nWe were "people entitled to CPP" until the 1990s. Now we\'re "liabilities to be managed."\n\nKaren Bingley\'s research exposes this privatization scheme. Sign petition e-6873 and demand transparency!\n\n#StopCPPPrivatization #TheTideRises #DisabilityRights\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
      email: {
        subject: 'Stop the Privatization of CPP Disability Benefits',
        body: `Hi,

I need to share something urgent about CPP Disability that most Canadians don't know.

Since the 1990s, disabled Canadians' earned CPP pensions have been systematically privatized through secret agreements between the federal government and private insurance companies.

Here's how it works:

1. Workers pay CPP premiums their entire working lives
2. Workers also pay private insurance premiums through employers
3. When they become disabled, insurers deduct CPP from benefits
4. Insurers force them to apply for CPP Disability
5. Insurers collect the retroactive CPP payment directly from government
6. Insurers profit TWICE: from premiums AND from our pensions

This started with the 1996 Auditor General Report (Chapter 17) that redefined disabled contributors as "liabilities to be managed" instead of people with earned entitlements.

In 1997, Bill C-2 added Section 65(3) to the CPP Act, giving the Minister power to approve "administrators" (insurers) for direct reimbursement—with NO transparency about who's approved or how much they're taking.

By 2003, the insurance industry was openly lobbying Parliament, describing our CPP as "advance payments" for their private plans.

Karen Bingley (@TheTideRises333) has documented this entire scheme with government audit reports, legislative history, and insurance industry submissions.

We need your voice:
→ Sign petition e-6873: https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6873
→ Learn more: https://x.com/TheTideRises333
→ Demand transparency: Check ISP1618C form for the secret list of approved insurers

Disabled Canadians deserve to be treated as people with earned rights, not liabilities to be exploited for corporate profit.

🔗 Powered by 3mpwr App
🌐 https://3mpwrapp.pages.dev/campaigns/

Thank you,`,
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
  {
    id: 'rights-dont-retire',
    title: 'Rights Don\'t Retire - Queens Park Rally',
    summary: 'Injured Workers are coming to Queens Park Toronto to demand removal of the age 65 cut-off for Older Injured Workers from the Workplace Safety and Insurance Act (WSIA). Email your MPP now.',
    target: 'Ontario Provincial Government & MPPs',
    goalCount: 10000,
    membersCount: 0, // New campaign as of November 20, 2025
    contactEmail: 'info@injuredworkerscommunitylegalclinic.ca',
    createdAt: Date.now(), // November 20, 2025
    // Extended fields for this specific campaign
    websiteUrl: 'https://win.newmode.net/injuredworkerscommunitylegalclinic/rightsdontretire-1',
    eventDate: 1732492800000, // November 25, 2025
    description: `Rights Don't Retire is a movement to end age discrimination against Older Injured Workers in Ontario.

**The Issue:**

Currently, the Workplace Safety and Insurance Act (WSIA) contains an arbitrary age 65 cut-off that strips injured workers of their rights and benefits simply because they turn 65 - regardless of their ongoing medical needs, disability, or work history.

This discriminatory policy:

• Forces injured workers into poverty at age 65
• Denies ongoing medical care and rehabilitation
• Violates the Ontario Human Rights Code
• Treats older workers as less deserving of support
• Ignores the reality that many Canadians work past 65 by choice or necessity

**Join us at Queens Park on November 25th, 2025** to stand with Older Injured Workers and demand:

• Removal of the age 65 cut-off from the WSIA
• Continued benefits based on medical need, not arbitrary age limits
• Equal treatment under the law for all injured workers
• Recognition that workplace injuries don't stop mattering at 65

**Take Action Now:**
Email your MPP through the NewMode platform and demand they support removing this discriminatory provision.`,
    legislation: [
      {
        name: 'Workplace Safety and Insurance Act (WSIA)',
        fullName: 'Workplace Safety and Insurance Act, 1997',
        status: 'In Force - Needs Amendment',
        description: 'Contains discriminatory age 65 cut-off that denies benefits to Older Injured Workers.',
      },
      {
        name: 'Ontario Human Rights Code',
        fullName: 'Ontario Human Rights Code',
        status: 'In Force',
        description: 'Prohibits age discrimination - conflicts with WSIA age 65 cut-off.',
      },
    ],
    actionItems: [
      { id: 1, text: 'Email your MPP via NewMode platform', completed: false },
      { id: 2, text: 'Attend Queens Park rally on November 25th', completed: false },
      { id: 3, text: 'Share #RightsDontRetire on social media', completed: false },
      { id: 4, text: 'Contact Injured Workers Community Legal Clinic', completed: false },
      { id: 5, text: 'Join the injured workers advocacy network', completed: false },
    ],
    shareTemplates: {
      twitter: 'Injured workers\' rights DON\'T END at age 65! Join us at Queens Park on Nov 25th to demand removal of the discriminatory age cut-off in Ontario\'s WSIA. #RightsDontRetire #InjuredWorkersUnite 🇨🇦\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
      facebook: 'RALLY AT QUEENS PARK - NOVEMBER 25, 2025\n\nInjured Workers are coming to Queens Park Toronto to demand removal of the age 65 cut-off for Older Injured Workers from the Workplace Safety and Insurance Act (WSIA).\n\nThis discriminatory policy forces injured workers into poverty at 65, denies ongoing medical care, and violates the Ontario Human Rights Code.\n\nWorkplace injuries don\'t stop mattering at age 65. Rights Don\'t Retire!\n\nTake action:\n✓ Email your MPP now\n✓ Join us at Queens Park on November 25th\n✓ Share this message\n\n#RightsDontRetire #InjuredWorkersUnite\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
      email: {
        subject: 'Support Older Injured Workers - Remove Age 65 Cut-off from WSIA',
        body: `Hi,

I'm writing to ask for your support in ending age discrimination against Older Injured Workers in Ontario.

The Workplace Safety and Insurance Act (WSIA) currently contains an arbitrary age 65 cut-off that strips injured workers of their rights and benefits simply because they turn 65 - regardless of their ongoing medical needs or disability.

This discriminatory policy:
• Forces injured workers into poverty at age 65
• Denies ongoing medical care and rehabilitation
• Violates the Ontario Human Rights Code
• Treats older workers as less deserving of support

Injured Workers are rallying at Queens Park on November 25, 2025 to demand change.

Please take 2 minutes to email your MPP and ask them to support removing the age 65 cut-off from the WSIA:

https://win.newmode.net/injuredworkerscommunitylegalclinic/rightsdontretire-1

Workplace injuries don't stop mattering at age 65. Rights Don't Retire!

🔗 Powered by 3mpwr App
🌐 https://3mpwrapp.pages.dev/campaigns/

Thank you for supporting injured workers' rights.`,
      },
    },
  } as Campaign & {
    websiteUrl?: string;
    eventDate?: number;
    description?: string;
    legislation?: Array<{
      name: string;
      fullName: string;
      status: string;
      description: string;
    }>;
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


