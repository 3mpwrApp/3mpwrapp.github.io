#!/usr/bin/env node
/**
 * POST-CAMPAIGN-PROMO.JS
 * Posts active campaign promotions to social media
 * 
 * Features:
 * - Rotates through 24 prepared promotional posts (12 per campaign)
 * - Posts to Mastodon, Bluesky, Discord
 * - Tracks state to avoid repetition
 * - Tuesday posts: Rights Don't Retire campaign
 * - Friday posts: Pass Bill 86 campaign
 * 
 * Runs twice weekly via GitHub Actions
 */

const fs = require('fs');
const path = require('path');

// Campaign data
const CAMPAIGNS = {
  'rights-dont-retire': {
    title: 'Rights Don\'t Retire',
    url: 'https://win.newmode.net/rightsdontretire',
    hashtags: ['#RightsDontRetire', '#WorkersRights', '#DisabilityJustice', '#InjuredWorkers'],
    description: 'Join the grassroots campaign to end discrimination against injured workers over 65. 1 minute to write your Minister of Labour and MPP.',
  },
  'pass-bill-86': {
    title: 'Pass Bill 86',
    url: 'https://passbill86.ca/',
    hashtags: ['#PassBill86', '#WorkersRights', '#WSIB', '#OntarioLabour'],
    description: 'Support Bill 86 to create fairer workplace injury compensation in Ontario. Make your voice heard.',
  },
  'flywheels': {
    title: '3 Flywheels of Change',
    url: 'https://3mpwrapp.pages.dev/2026/04/01/3-flywheels-thunder-bay-presentation-success/',
    hashtags: ['#3Flywheels', '#CollectivePower', '#PatternDetection', '#WorkersRights'],
    description: 'Turning isolated struggles into collective power through Evidence, Collective Action, and Knowledge Network flywheels.',
  }
};

// Post templates organized by campaign
const POSTS = {
  'rights-dont-retire': [
    // Variation 1
    {
      mastodon: `✊ Rights Don't Retire Campaign

You turn 65. WSIB cuts your benefits. How is that fair?

Injured workers over 65 face automatic benefit reductions just for aging. It's discrimination, plain and simple.

✅ Takes 1 minute
✅ Email Minister of Labour + your MPP
✅ Pre-written message (customize if you want)

🔗 https://win.newmode.net/rightsdontretire

#RightsDontRetire #WorkersRights #DisabilityJustice`,
      bluesky: `Rights Don't Retire! ✊

65? WSIB cuts your benefits. That's age discrimination.

1 minute → Email Minister of Labour + MPP
Pre-written message ready.

🔗 win.newmode.net/rightsdontretire

#RightsDontRetire #WorkersRights`,
      discord: `**✊ Rights Don't Retire Campaign**

Injured workers over 65 shouldn't face automatic benefit cuts.

**Action**: Email Minister of Labour + your MPP (1 minute)
**Link**: https://win.newmode.net/rightsdontretire

Join the grassroots movement for fairness! 💪`
    },
    // Variation 2
    {
      mastodon: `💪 Your injury doesn't retire when you turn 65. Neither should your rights.

The Rights Don't Retire campaign is fighting to end automatic WSIB benefit reductions for workers over 65.

📧 Send a pre-written email to decision-makers
⏱️ Takes less than 60 seconds
🎯 Real impact on Ontario labour policy

Join thousands demanding fairness: https://win.newmode.net/rightsdontretire

#RightsDontRetire #InjuredWorkers #Ontario`,
      bluesky: `Your injury doesn't retire at 65. Neither should your rights. 💪

Join the Rights Don't Retire campaign.
Email decision-makers in <60 seconds.

🔗 win.newmode.net/rightsdontretire

#RightsDontRetire`,
      discord: `**💪 Rights Don't Retire**

Your injury doesn't retire when you turn 65. Why should your benefits?

**Quick action** → Email Ontario decision-makers
**Time**: <60 seconds
**Link**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 3
    {
      mastodon: `🎯 1 minute. 1 email. Real change.

Rights Don't Retire campaign: End age discrimination in WSIB benefits.

Why it matters:
• Injured workers over 65 face automatic cuts
• Same injury, less support, just for aging
• Impacts thousands of Ontario workers

Take action: https://win.newmode.net/rightsdontretire

Your voice + thousands of others = policy change.

#RightsDontRetire #WorkersRights`,
      bluesky: `1 minute. 1 email. Real change. 🎯

End age discrimination in WSIB benefits for workers over 65.

Join the Rights Don't Retire campaign:
🔗 win.newmode.net/rightsdontretire

#RightsDontRetire`,
      discord: `**🎯 Rights Don't Retire - Quick Action**

1 minute to email decision-makers about age discrimination in WSIB.

Injured workers over 65 deserve fair treatment.

**Act now**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 4
    {
      mastodon: `📢 Grassroots campaign alert: Rights Don't Retire

Fighting automatic WSIB benefit reductions for workers over 65.

What you can do:
✅ Email Minister of Labour + your MPP
✅ Use the pre-written message (or customize)
✅ Share with networks fighting for workers' rights

Action link: https://win.newmode.net/rightsdontretire

Every email matters. Every voice counts.

#RightsDontRetire #DisabilityJustice`,
      bluesky: `📢 Rights Don't Retire campaign

Email Minister of Labour + your MPP about age discrimination in WSIB.

Pre-written message ready.
Takes 1 minute.

🔗 win.newmode.net/rightsdontretire

#RightsDontRetire`,
      discord: `**📢 Rights Don't Retire Campaign**

Join the grassroots movement to end age discrimination in WSIB benefits.

**Quick email** → Minister of Labour + your MPP
**Link**: https://win.newmode.net/rightsdontretire

Every voice counts! 💪`
    },
    // Variation 5
    {
      mastodon: `🔥 Why do injured workers lose rights when they turn 65?

Rights Don't Retire campaign is asking Ontario decision-makers the same question.

Age discrimination in WSIB benefits hurts real people:
• Reduced income when costs rise
• Same injury, less support
• Punishment for surviving

Make your voice heard (60 seconds): https://win.newmode.net/rightsdontretire

#RightsDontRetire #WorkersRights`,
      bluesky: `Why do injured workers lose rights at 65? 🔥

Rights Don't Retire campaign demands answers.

Email Ontario decision-makers:
🔗 win.newmode.net/rightsdontretire

60 seconds for fairness.

#RightsDontRetire`,
      discord: `**🔥 Rights Don't Retire**

Why do injured workers lose rights when they turn 65?

Age discrimination in WSIB benefits must end.

**Email decision-makers**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 6
    {
      mastodon: `✊ Turning 65 shouldn't mean losing your rights as an injured worker.

Rights Don't Retire campaign: Grassroots push to end WSIB age discrimination.

📧 Pre-written email ready
🎯 Sent to Minister of Labour + your MPP
⏱️ Less than 1 minute
💪 Join thousands demanding fairness

Take action: https://win.newmode.net/rightsdontretire

#RightsDontRetire #Ontario #InjuredWorkers`,
      bluesky: `Turning 65 ≠ losing workers' rights ✊

Join Rights Don't Retire campaign.
Email ready. <1 minute.

🔗 win.newmode.net/rightsdontretire

Thousands demanding fairness.

#RightsDontRetire`,
      discord: `**✊ Rights Don't Retire Campaign**

Turning 65 shouldn't mean losing your rights as an injured worker.

**Action**: Email Minister + MPP (pre-written, <1 min)
**Link**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 7
    {
      mastodon: `💼 Same injury. Same pain. Same medical needs.

But if you're over 65, WSIB cuts your benefits automatically.

Rights Don't Retire campaign is fighting this discrimination.

Your action:
• Email Minister of Labour + MPP
• Takes 60 seconds
• Pre-written message (customize if you want)

https://win.newmode.net/rightsdontretire

Let's end age discrimination in workers' compensation.

#RightsDontRetire #DisabilityJustice`,
      bluesky: `Same injury. Same pain. But 65+ = automatic WSIB cuts. 💼

Rights Don't Retire fights this discrimination.

Email Minister + MPP (60 sec):
🔗 win.newmode.net/rightsdontretire

#RightsDontRetire`,
      discord: `**💼 Rights Don't Retire**

Same injury, same pain, but 65+ workers face automatic WSIB benefit cuts.

Fight age discrimination:
**Email**: Minister of Labour + your MPP
**Link**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 8
    {
      mastodon: `🎯 Quick win for workers' rights:

Rights Don't Retire campaign → Email Ontario decision-makers about WSIB age discrimination

Why now:
• Grassroots momentum building
• Policy change is possible
• Your email adds to thousands

Action (1 minute): https://win.newmode.net/rightsdontretire

Injured workers over 65 deserve dignity and fair compensation.

#RightsDontRetire #WorkersRights`,
      bluesky: `Quick win for workers' rights 🎯

Email Ontario about WSIB age discrimination.

Momentum building.
Policy change possible.

🔗 win.newmode.net/rightsdontretire

#RightsDontRetire`,
      discord: `**🎯 Rights Don't Retire - Policy Impact**

Grassroots momentum building for fair WSIB treatment of workers 65+.

Add your voice:
**1-minute email**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 9
    {
      mastodon: `📣 Advocacy opportunity: Rights Don't Retire

Take 1 minute to email Ontario decision-makers about ending WSIB age discrimination.

Campaign goal: Fair benefits for injured workers regardless of age.

✅ Pre-written message
✅ Sent directly to Minister of Labour + your MPP
✅ Part of coordinated grassroots push

https://win.newmode.net/rightsdontretire

#RightsDontRetire #InjuredWorkers #Advocacy`,
      bluesky: `Advocacy opportunity: Rights Don't Retire 📣

1 minute → Email Ontario about WSIB age discrimination

Pre-written message ready.

🔗 win.newmode.net/rightsdontretire

#RightsDontRetire`,
      discord: `**📣 Rights Don't Retire - Advocacy Alert**

1-minute action to email Ontario decision-makers about fair WSIB benefits for workers 65+.

**Pre-written message**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 10
    {
      mastodon: `💪 Injured workers over 65: Your rights matter.

Rights Don't Retire campaign = End automatic WSIB benefit reductions based on age.

How to help:
1. Visit https://win.newmode.net/rightsdontretire
2. Email sends to Minister of Labour + your MPP
3. Takes <60 seconds

Join the grassroots movement for fairness in Ontario labour policy.

#RightsDontRetire #DisabilityJustice #Ontario`,
      bluesky: `Injured workers 65+: Your rights matter 💪

Rights Don't Retire = End WSIB age discrimination

<60 seconds to email:
🔗 win.newmode.net/rightsdontretire

#RightsDontRetire`,
      discord: `**💪 Rights Don't Retire**

Injured workers over 65: Your rights matter.

End automatic WSIB benefit reductions based on age.

**Quick email**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 11
    {
      mastodon: `🔥 Age discrimination in workers' compensation must end.

Rights Don't Retire campaign: Fight WSIB benefit cuts for workers over 65.

Your 1-minute action:
• Email Minister of Labour
• Email your MPP
• Use pre-written message

https://win.newmode.net/rightsdontretire

Every email strengthens the grassroots push for policy change.

#RightsDontRetire #WorkersRights`,
      bluesky: `Age discrimination in workers' comp must end 🔥

Rights Don't Retire campaign.

1-minute email to Ontario decision-makers:
🔗 win.newmode.net/rightsdontretire

#RightsDontRetire`,
      discord: `**🔥 Rights Don't Retire Campaign**

Age discrimination in WSIB must end.

**1-minute action**: Email Minister + MPP
**Link**: https://win.newmode.net/rightsdontretire`
    },
    // Variation 12
    {
      mastodon: `✊ Join thousands fighting for workers' rights:

Rights Don't Retire = End WSIB benefit discrimination against workers over 65

Quick action:
📧 Pre-written email to Ontario decision-makers
⏱️ 60 seconds of your time
💪 Real impact on labour policy

https://win.newmode.net/rightsdontretire

Your voice + our collective power = change.

#RightsDontRetire #InjuredWorkers #Solidarity`,
      bluesky: `Join thousands fighting for workers' rights ✊

Rights Don't Retire → End WSIB age discrimination

60 seconds:
🔗 win.newmode.net/rightsdontretire

Collective power = change

#RightsDontRetire`,
      discord: `**✊ Rights Don't Retire - Collective Action**

Join thousands demanding fair WSIB treatment for workers 65+.

**Your voice matters**: https://win.newmode.net/rightsdontretire
**Time**: 60 seconds

Together we create change! 💪`
    }
  ],
  'pass-bill-86': [
    // Variation 1
    {
      mastodon: `📘 Pass Bill 86: Fairer WSIB for Ontario Workers

Bill 86 addresses critical gaps in workplace injury compensation.

Why it matters:
• Injured workers face uphill battles with WSIB
• Current system fails too many people
• Bill 86 proposes concrete reforms

Learn more + support: https://passbill86.ca/

Share your story. Make your voice heard.

#PassBill86 #WorkersRights #WSIB #Ontario`,
      bluesky: `📘 Pass Bill 86 → Fairer WSIB

Current system fails injured workers.
Bill 86 proposes reforms.

Learn more:
🔗 passbill86.ca

Share your story.

#PassBill86 #WorkersRights`,
      discord: `**📘 Pass Bill 86 Campaign**

Fairer workplace injury compensation for Ontario workers.

Bill 86 addresses critical WSIB gaps.

**Learn more**: https://passbill86.ca/
**Get involved**: Share your story, support the campaign`
    },
    // Variation 2
    {
      mastodon: `💼 Ontario workers deserve better WSIB support.

Pass Bill 86 campaign: Push for workplace injury compensation reform.

Current problems:
• Denied claims
• Inadequate support
• Complex bureaucracy

Bill 86 offers solutions.

Read the bill + take action: https://passbill86.ca/

#PassBill86 #WSIB #WorkersRights`,
      bluesky: `Ontario workers deserve better WSIB 💼

Pass Bill 86 → compensation reform

Current system: denials, inadequate support, red tape

🔗 passbill86.ca

#PassBill86`,
      discord: `**💼 Pass Bill 86**

Ontario workers deserve better WSIB support.

Bill 86 = workplace injury compensation reform.

**Learn more**: https://passbill86.ca/`
    },
    // Variation 3
    {
      mastodon: `🎯 Bill 86: Hope for injured workers navigating WSIB

If you've struggled with WSIB claims, denials, or inadequate support, Bill 86 addresses real problems.

Campaign goals:
• Legislative reform
• Better worker protections
• Fairer compensation processes

Support the campaign: https://passbill86.ca/

#PassBill86 #InjuredWorkers #Ontario`,
      bluesky: `Bill 86: Hope for injured workers 🎯

Struggled with WSIB? Bill 86 addresses real problems.

Better protections.
Fairer processes.

🔗 passbill86.ca

#PassBill86`,
      discord: `**🎯 Pass Bill 86**

Hope for injured workers navigating WSIB.

Bill 86 addresses: claims denials, inadequate support, unfair processes.

**Learn more**: https://passbill86.ca/`
    },
    // Variation 4
    {
      mastodon: `📢 Pass Bill 86: Workplace injury compensation reform in Ontario

Grassroots campaign supporting legislative changes to improve WSIB for workers.

Why Bill 86:
• Based on injured workers' real experiences
• Proposes concrete policy changes
• Supported by labour advocates

Get involved: https://passbill86.ca/

#PassBill86 #WorkersRights #WSIB`,
      bluesky: `📢 Pass Bill 86 campaign

WSIB reform based on workers' real experiences.

Concrete policy changes.
Labour advocate support.

🔗 passbill86.ca

#PassBill86`,
      discord: `**📢 Pass Bill 86 Campaign**

WSIB reform based on injured workers' real experiences.

Concrete policy changes proposed.

**Learn more**: https://passbill86.ca/`
    },
    // Variation 5
    {
      mastodon: `🔥 WSIB system broken? Bill 86 proposes fixes.

Pass Bill 86 campaign: Support workplace injury compensation reform in Ontario.

What changes:
• Better claim processes
• Improved worker protections
• Fairer appeals

Read the bill + support: https://passbill86.ca/

Your voice matters in labour policy.

#PassBill86 #WSIB #Ontario`,
      bluesky: `WSIB broken? Bill 86 proposes fixes 🔥

Better claims.
Improved protections.
Fairer appeals.

🔗 passbill86.ca

Your voice matters.

#PassBill86`,
      discord: `**🔥 Pass Bill 86**

WSIB system broken? Bill 86 proposes fixes.

Better claims, improved protections, fairer appeals.

**Support the campaign**: https://passbill86.ca/`
    },
    // Variation 6
    {
      mastodon: `📘 Support Bill 86: Injured workers need legislative reform

The Pass Bill 86 campaign is pushing for real change in Ontario's workplace injury compensation system.

Key issues addressed:
• Claim denials
• Benefit adequacy
• Appeal processes

Learn more: https://passbill86.ca/

#PassBill86 #InjuredWorkers #OntarioLabour`,
      bluesky: `Support Bill 86 📘

Injured workers need legislative reform.

WSIB issues: denials, inadequate benefits, appeals

🔗 passbill86.ca

#PassBill86`,
      discord: `**📘 Pass Bill 86 - Legislative Reform**

Injured workers need change in Ontario's workplace injury compensation.

Key issues: claim denials, benefit adequacy, appeals

**Learn more**: https://passbill86.ca/`
    },
    // Variation 7
    {
      mastodon: `💪 Bill 86 = Real reform for Ontario injured workers

Pass Bill 86 campaign builds grassroots support for workplace injury compensation improvements.

Why support:
• Addresses systemic WSIB problems
• Based on worker experiences
• Proposes concrete solutions

Get involved: https://passbill86.ca/

#PassBill86 #WorkersRights #WSIB`,
      bluesky: `Bill 86 = Real WSIB reform 💪

Grassroots support for workplace injury compensation improvements.

Worker-experience based.

🔗 passbill86.ca

#PassBill86`,
      discord: `**💪 Pass Bill 86**

Real reform for Ontario injured workers.

Addresses systemic WSIB problems with concrete solutions.

**Support**: https://passbill86.ca/`
    },
    // Variation 8
    {
      mastodon: `🎯 Ontario labour policy update: Pass Bill 86

Campaign supporting workplace injury compensation reform.

If you care about workers' rights:
✅ Read Bill 86 proposals
✅ Share with networks
✅ Support the campaign

https://passbill86.ca/

Legislative change requires grassroots pressure.

#PassBill86 #WorkersRights #Ontario`,
      bluesky: `Ontario labour policy: Pass Bill 86 🎯

Workplace injury compensation reform.

Read proposals.
Share with networks.
Support campaign.

🔗 passbill86.ca

#PassBill86`,
      discord: `**🎯 Pass Bill 86 - Policy Update**

Ontario workplace injury compensation reform campaign.

Legislative change requires grassroots pressure.

**Learn more**: https://passbill86.ca/`
    },
    // Variation 9
    {
      mastodon: `📣 Advocacy alert: Pass Bill 86 campaign

Supporting legislative reforms to improve WSIB for Ontario injured workers.

Campaign focus:
• Fair claim processes
• Adequate compensation
• Worker protections

Get involved: https://passbill86.ca/

Every voice strengthens the push for change.

#PassBill86 #WSIB #InjuredWorkers`,
      bluesky: `Advocacy alert: Pass Bill 86 📣

WSIB reforms for Ontario injured workers.

Fair processes.
Adequate compensation.

🔗 passbill86.ca

#PassBill86`,
      discord: `**📣 Pass Bill 86 - Advocacy Alert**

Legislative reforms to improve WSIB for Ontario workers.

Focus: fair processes, adequate compensation, protections

**Get involved**: https://passbill86.ca/`
    },
    // Variation 10
    {
      mastodon: `💼 Workplace injury? Bill 86 addresses WSIB gaps.

Pass Bill 86 campaign: Grassroots support for Ontario workplace injury compensation reform.

Why it matters:
• Current system fails workers
• Bill proposes improvements
• Your support helps push for change

https://passbill86.ca/

#PassBill86 #WorkersRights #WSIB`,
      bluesky: `Workplace injury? Bill 86 addresses WSIB gaps 💼

Current system fails workers.
Bill proposes improvements.

🔗 passbill86.ca

Your support matters.

#PassBill86`,
      discord: `**💼 Pass Bill 86**

Workplace injury compensation reform for Ontario.

Current system fails workers → Bill 86 proposes improvements.

**Support the campaign**: https://passbill86.ca/`
    },
    // Variation 11
    {
      mastodon: `🔥 Pass Bill 86: Fight for fairer WSIB

Ontario injured workers face systemic barriers. Bill 86 proposes solutions.

Campaign goals:
• Legislative pressure
• Worker advocacy
• Policy reform

Learn more + support: https://passbill86.ca/

Grassroots campaigns create change.

#PassBill86 #WSIB #OntarioLabour`,
      bluesky: `Pass Bill 86: Fairer WSIB 🔥

Injured workers face barriers.
Bill 86 proposes solutions.

🔗 passbill86.ca

Grassroots campaigns = change

#PassBill86`,
      discord: `**🔥 Pass Bill 86 Campaign**

Fight for fairer WSIB in Ontario.

Systemic barriers → Bill 86 solutions

**Support**: https://passbill86.ca/`
    },
    // Variation 12
    {
      mastodon: `📘 Join the Pass Bill 86 campaign

Support workplace injury compensation reform in Ontario.

What you can do:
• Read the bill at passbill86.ca
• Share with workers' advocates
• Contact your MPP about Bill 86

https://passbill86.ca/

Your advocacy matters for injured workers across Ontario.

#PassBill86 #WorkersRights #InjuredWorkers`,
      bluesky: `Join Pass Bill 86 campaign 📘

WSIB reform for Ontario.

Read the bill.
Share with advocates.
Contact your MPP.

🔗 passbill86.ca

#PassBill86`,
      discord: `**📘 Pass Bill 86 - Take Action**

Support workplace injury compensation reform.

1. Read: passbill86.ca
2. Share with advocates
3. Contact your MPP

**Your advocacy matters**: https://passbill86.ca/`
    }
  ],
  'flywheels': [
    // Flywheels post 1 - Evidence Flywheel (CONCEPT)
    {
      mastodon: `🔄 What if every worker's victory made the next one easier?

Imagine: When someone wins their WSIB appeal, their evidence becomes a template for others fighting the same battle.

Instead of starting from zero every time, workers build on each other's wins.

That's the Evidence Flywheel - a core part of the 3 Flywheels framework we're developing.

From isolated struggles to collective knowledge.

Learn more about the concept: https://3mpwrapp.pages.dev/blog/

#3Flywheels #CollectivePower #WorkersRights`,
      bluesky: `🔄 The Evidence Flywheel concept:

What if every worker's win became a template for the next?

Instead of reinventing the wheel 156 times, build on each other's victories.

That's what we're working on.

#3Flywheels #WorkersRights`,
      discord: `**🔄 Introducing: The Evidence Flywheel**

A concept we're developing for collective worker support:

**The idea**: When one worker wins their case, their evidence and strategy get shared with everyone facing similar challenges.

**Why it matters**: Right now, 156 workers fight the same battle in isolation. Each starts from zero.

**The vision**: Build on each other's wins. Accelerate justice.

Stay tuned as we develop this with injured worker communities.`
    },
    // Flywheels post 2 - Pattern Detection (CONCEPT)
    {
      mastodon: `📊 What patterns hide in tribunal decisions?

15 years of WSIAT appeals sit in public databases. Thousands of cases. Some win, some lose.

What if we could analyze them to find:
• What evidence leads to success?
• Which conditions get denied most?
• What strategies work?

That's the Pattern Detection Flywheel - turning scattered decisions into actionable insights.

We're exploring this with Thunder Bay's injured worker community.

#3Flywheels #PatternDetection #WorkersRights`,
      bluesky: `📊 Pattern Detection concept:

15 years of tribunal decisions exist publicly. What patterns hide in that data?

What if we could find proven strategies automatically?

#3Flywheels #WorkersRights`,
      discord: `**📊 The Pattern Detection Flywheel (In Development)**

**The challenge**: Thousands of tribunal decisions exist publicly, but workers have no way to analyze them for patterns.

**The vision**: Automatically detect what evidence leads to wins, which conditions face barriers, what strategies work.

**Example use case**: Instead of researching alone for 40 hours, search "fibromyalgia WSIAT" and instantly find patterns from past cases.

**Status**: We're exploring this concept with Thunder Bay's injured worker community.`
    },
    // Flywheels post 3 - Collective Action (CONCEPT)
    {
      mastodon: `💪 What if workers could organize automatically?

Right now: Hundreds face the same denial. No one knows. System picks them off one by one.

The vision: When patterns emerge (many workers facing same barrier), suggest collective action:
• Joint submissions
• Coordinated advocacy
• Media campaigns

From invisible struggles to visible movements.

That's the Collective Action Flywheel - a framework we're developing.

#3Flywheels #CollectiveAction #WorkersRights`,
      bluesky: `💪 Collective Action Flywheel concept:

When many workers face the same barrier but don't know it, they lose alone.

What if the system detected patterns and suggested collective organizing?

#3Flywheels #WorkersRights`,
      discord: `**💪 The Collective Action Flywheel (Concept)**

**The problem**: Workers fighting the same battle don't know about each other. They lose in isolation.

**The vision**: When the system detects a pattern (many facing same barrier), it suggests collective organizing.

**How it could work**:
• Pattern detected: Many workers denied for same reason
• Campaign auto-suggested
• Workers connect
• Joint advocacy
• Policy pressure

From isolated to organized. That's the goal we're working toward.`
    },
    // Flywheels post 4 - Thunder Bay Partnership (CONCEPT)
    {
      mastodon: `🌲 Excited to partner with Thunder Bay's injured worker community!

We're exploring the 3 Flywheels framework together:
• Evidence sharing between workers
• Pattern detection from tribunal decisions
• Collective organizing when barriers emerge

The vision: Turn 15 years of public tribunal data into actionable insights for workers.

From concept to community-tested reality.

Learn about the framework: https://3mpwrapp.pages.dev/blog/

#ThunderBay #3Flywheels #WorkersRights`,
      bluesky: `🌲 Thunder Bay partnership:

Testing the 3 Flywheels concept with injured workers:

Turn tribunal data → patterns → collective action

Community-driven development.

#ThunderBay #3Flywheels #WorkersRights`,
      discord: `**🌲 Thunder Bay Partnership: Testing the Flywheels**

We're partnering with Thunder Bay's injured worker community to develop and test the 3 Flywheels framework.

**What we're exploring**:
• Analyzing public tribunal decisions for patterns
• Evidence sharing between workers
• Collective organizing strategies

**Status**: Early concept development with community input.

Follow along as we build this together.`
    }
  ]
};

// State file path
const STATE_FILE = path.join(__dirname, '..', 'public', 'campaign-promo-state.json');

// Load or initialize state
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return {
    'rights-dont-retire': { currentIndex: 0, lastPosted: null },
    'pass-bill-86': { currentIndex: 0, lastPosted: null }
  };
}

// Save state
function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Determine which campaign to promote based on day of week
function getCampaignForToday() {
  // Allow forcing a specific campaign via environment variable
  const forceCampaign = process.env.FORCE_CAMPAIGN;
  if (forceCampaign === 'rights-dont-retire' || forceCampaign === 'pass-bill-86' || forceCampaign === 'flywheels') {
    return forceCampaign;
  }
  
  const day = new Date().getDay();
  const state = loadState();
  
  // Initialize flywheels state if not exists
  if (!state.flywheels) {
    state.flywheels = { currentIndex: 0, lastPosted: null, postCount: 0 };
  }
  
  // Count total posts across all campaigns
  const totalPosts = (state['rights-dont-retire'].postCount || 0) + 
                     (state['pass-bill-86'].postCount || 0) + 
                     (state.flywheels.postCount || 0);
  
  // Every 3rd post should be a flywheel (33% of posts mention flywheels)
  const shouldPostFlywheels = totalPosts % 3 === 0;
  
  if (shouldPostFlywheels) {
    return 'flywheels';
  }
  
  // 2 = Tuesday → Rights Don't Retire
  // 5 = Friday → Pass Bill 86
  if (day === 2) return 'rights-dont-retire';
  if (day === 5) return 'pass-bill-86';
  
  // Fallback for manual runs - alternate based on state
  const lastRights = state['rights-dont-retire'].lastPosted;
  const lastBill = state['pass-bill-86'].lastPosted;
  
  if (!lastRights) return 'rights-dont-retire';
  if (!lastBill) return 'pass-bill-86';
  
  return new Date(lastRights) < new Date(lastBill) ? 'rights-dont-retire' : 'pass-bill-86';
}

// Get next post for a campaign
function getNextPost(campaignId, state) {
  const posts = POSTS[campaignId];
  const currentIndex = state[campaignId].currentIndex;
  const post = posts[currentIndex];
  
  // Update state for next time
  state[campaignId].currentIndex = (currentIndex + 1) % posts.length;
  state[campaignId].lastPosted = new Date().toISOString();
  state[campaignId].postCount = (state[campaignId].postCount || 0) + 1;
  
  return post;
}

// Post to Mastodon
async function postToMastodon(text) {
  const { MASTO_TOKEN, MASTO_INSTANCE } = process.env;
  if (!MASTO_TOKEN || !MASTO_INSTANCE) {
    console.log('⚠️ Mastodon credentials not configured');
    return false;
  }

  try {
    const response = await fetch(`https://${MASTO_INSTANCE}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MASTO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: text, visibility: 'public' }),
    });

    if (response.ok) {
      console.log('✅ Posted to Mastodon');
      return true;
    } else {
      console.log('❌ Mastodon post failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Mastodon error:', error.message);
    return false;
  }
}

// Post to Bluesky
async function postToBluesky(text) {
  const { BLUESKY_HANDLE, BLUESKY_PASSWORD, BLUESKY_PDS } = process.env;
  if (!BLUESKY_HANDLE || !BLUESKY_PASSWORD) {
    console.log('⚠️ Bluesky credentials not configured');
    return false;
  }

  try {
    // Login
    const loginResponse = await fetch(`${BLUESKY_PDS || 'https://bsky.social'}/xrpc/com.atproto.server.createSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: BLUESKY_HANDLE,
        password: BLUESKY_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Bluesky login failed');
      return false;
    }

    const { accessJwt, did } = await loginResponse.json();

    // Create post
    const postResponse = await fetch(`${BLUESKY_PDS || 'https://bsky.social'}/xrpc/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: did,
        collection: 'app.bsky.feed.post',
        record: {
          text: text,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    if (postResponse.ok) {
      console.log('✅ Posted to Bluesky');
      return true;
    } else {
      console.log('❌ Bluesky post failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Bluesky error:', error.message);
    return false;
  }
}

// Post to Discord
async function postToDiscord(text) {
  const { DISCORD_WEBHOOK_URL } = process.env;
  if (!DISCORD_WEBHOOK_URL) {
    console.log('⚠️ Discord webhook not configured');
    return false;
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    });

    if (response.ok) {
      console.log('✅ Posted to Discord');
      return true;
    } else {
      console.log('❌ Discord post failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Discord error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('📣 Campaign Promotion Script');
  console.log('============================');

  const testMode = process.env.TEST_MODE === 'true';
  if (testMode) {
    console.log('🧪 TEST MODE - No actual posting');
  }

  // Determine campaign
  const campaignId = getCampaignForToday();
  const campaign = CAMPAIGNS[campaignId];
  
  console.log(`\n📢 Promoting: ${campaign.title}`);
  console.log(`🔗 URL: ${campaign.url}`);

  // Load state and get next post
  const state = loadState();
  const post = getNextPost(campaignId, state);

  console.log(`\n📝 Post variation #${state[campaignId].currentIndex} of ${POSTS[campaignId].length}`);

  // Display posts
  console.log('\n--- MASTODON ---');
  console.log(post.mastodon);
  
  console.log('\n--- BLUESKY ---');
  console.log(post.bluesky);
  
  console.log('\n--- DISCORD ---');
  console.log(post.discord);

  if (!testMode) {
    // Post to platforms
    console.log('\n📤 Posting to platforms...');
    await Promise.all([
      postToMastodon(post.mastodon),
      postToBluesky(post.bluesky),
      postToDiscord(post.discord),
    ]);

    // Save state
    saveState(state);
    console.log('\n💾 State saved');
  }

  console.log('\n✅ Campaign promotion complete!');
  console.log(`Next ${campaign.title} promotion will use variation #${state[campaignId].currentIndex + 1}`);
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
