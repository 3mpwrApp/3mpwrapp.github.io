export type WhatsNewItem = {
  id: string;
  title: string;
  summary: string;
  date: string; // ISO date
  archived?: boolean; // auto-marked when older than 30 days
};

export const whatsnew: WhatsNewItem[] = [
  // December 2025 - Latest Updates
  {
    id: "wn-2025-12-22-analytics-dashboard",
    title: "📊 Analytics Platform Dashboard in Admin Panel",
    summary: "New analytics overview in Admin Panel shows real-time status of Firebase Analytics, Sentry Performance Monitoring, and Vexo Analytics. See all platform benefits, configuration details, and direct dashboard links in one place.",
    date: "2025-12-22T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-22-sentry-performance",
    title: "⚡ Sentry Performance Monitoring Active",
    summary: "Comprehensive performance tracking now monitors auth operations, evidence uploads, campaign fetching, and resource loading. Automatic error categorization by feature and severity helps us fix issues faster.",
    date: "2025-12-22T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-22-vexo-integration",
    title: "🔍 Vexo Analytics Integrated",
    summary: "Device-level analytics now active for cross-platform tracking, user journey mapping, and engagement metrics. Privacy-first approach with opt-in consent and no personal data collection.",
    date: "2025-12-22T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-20-cognitive-comfort-fix",
    title: "🧠 'Where Was I' Feature Fix",
    summary: "Fixed an issue where the 'Where Was I' navigation memory button would show even when turned off in settings. The feature now properly respects your cognitive comfort preferences.",
    date: "2025-12-20T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-20-navigation-stability",
    title: "🔧 Navigation Stability Improvements",
    summary: "Resolved React Navigation module compatibility issues that could cause app loading problems. Enhanced module loading for better reliability across all platforms.",
    date: "2025-12-20T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-13-usa-expanded",
    title: "🇺🇸 USA Lite - 13 Jurisdictions Fully Built!",
    summary: "Complete US legal framework now available! Federal + 12 states (CA, NY, TX, FL, IL, MI, WA, OH, PA, TN, GA, MS) with workers' comp, civil rights, disability programs, enforcement agencies, and procedural safeguards for each.",
    date: "2025-12-13T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-13-usa-components",
    title: "📋 6-Component Legal Framework",
    summary: "Each US jurisdiction now includes: workers' comp system, disability programs, civil rights framework, legislative authority, enforcement oversight, and procedural safeguards. Most comprehensive US disability rights data available.",
    date: "2025-12-13T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-12-a",
    title: "Production Ready Release",
    summary: "We completed our final stress test with 721 tests passing. All security, accessibility, and offline features verified and ready for beta.",
    date: "2025-12-12T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-12-b",
    title: "Documentation Updated",
    summary: "All guides and documentation updated for December 2025. Check out our refreshed tester guide and release notes.",
    date: "2025-12-12T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-07-a",
    title: "Comprehensive Stress Testing",
    summary: "52 new tests added covering authentication, security, offline mode, and all major features. Zero issues found.",
    date: "2025-12-07T00:00:00.000Z",
  },
  {
    id: "wn-2025-12-07-b",
    title: "Discord Integration Ready",
    summary: "Webhook notification system now available for team communications and automated updates.",
    date: "2025-12-07T00:00:00.000Z",
  },

  // November 2025 - Major Updates
  {
    id: "wn-2025-11-30-a",
    title: "Community Safety Tools",
    summary: "We keep the community safe by blocking spam, hate speech, and scams. We also limit messages to 5 per minute to prevent flooding.",
    date: "2025-11-30T00:00:00.000Z",
  },
  {
    id: "wn-2025-11-30-b",
    title: "Choose Where Your Data Goes",
    summary: "Pick your backup option: save to cloud, save to your own server, or keep everything on your device only. You're in control.",
    date: "2025-11-30T00:00:00.000Z",
  },
  {
    id: "wn-2025-11-25-a",
    title: "More Ways to Describe Yourself",
    summary: "We added lots more options to choose from when setting up your profile. Pick what describes you best so we can give you better suggestions.",
    date: "2025-11-25T00:00:00.000Z",
  },
  {
    id: "wn-2025-11-17-a",
    title: "Tell Us About Your Needs",
    summary: "Choose what you're dealing with - pain, fatigue, mood, mobility - so the app can help you better. The more we know, the more helpful we can be.",
    date: "2025-11-17T00:00:00.000Z",
  },
  {
    id: "wn-2025-11-12-a",
    title: "8 New Helpful Features",
    summary: "We added tools to celebrate your wins, track your impact, get support, spot when you're being gaslit, use voice commands, and more.",
    date: "2025-11-12T00:00:00.000Z",
  },
  {
    id: "wn-2025-11-10-a",
    title: "Research Library Added",
    summary: "Over 100 studies and articles about disability topics. Search by what you're interested in to learn more.",
    date: "2025-11-10T00:00:00.000Z",
  },
  {
    id: "wn-2025-11-08-a",
    title: "Events Show Up Instantly",
    summary: "When you add an event in the app, it shows up on the website right away. You can also subscribe to the events calendar.",
    date: "2025-11-08T00:00:00.000Z",
  },
  {
    id: "wn-2025-11-06-a",
    title: "Better Event Sync & Sign-In",
    summary: "Events stay in sync between your phone and the web. Google sign-in now works smoothly every time.",
    date: "2025-11-06T00:00:00.000Z",
  },
  {
    id: "wn-2025-11-04-a",
    title: "Smarter Wellness Tools",
    summary: "Mood tracker now spots patterns in how you're feeling. Energy tracker predicts when you'll need rest. Tools work together better.",
    date: "2025-11-04T00:00:00.000Z",
  },
  
  // October 2025 - Major Features
  {
    id: "wn-2025-10-31-a",
    title: "Add Events to Your Calendar",
    summary: "Subscribe to get all our events in Apple Calendar, Google Calendar, or Outlook. Events update automatically.",
    date: "2025-10-31T00:00:00.000Z",
  },
  {
    id: "wn-2025-10-24-a",
    title: "Better Safety & Legal Info",
    summary: "Clear terms of use and safety features. Panic button for emergencies. Safety warnings on medical and legal screens.",
    date: "2025-10-24T00:00:00.000Z",
  },
  {
    id: "wn-2025-10-22-a",
    title: "Almost Ready for Google Play",
    summary: "We're getting ready to launch on Android. Set up support email and screenshots.",
    date: "2025-10-22T00:00:00.000Z",
  },
  {
    id: "wn-2025-10-21-a",
    title: "You Control Your Privacy",
    summary: "Turn off search history, analytics, and error reports if you want. Privacy is off by default. We don't share your data with anyone.",
    date: "2025-10-21T00:00:00.000Z",
  },
  {
    id: "wn-2025-10-17-a",
    title: "App Learns Your Preferences",
    summary: "The app learns what you need and shows you better suggestions over time. It predicts your energy levels to help you plan your day.",
    date: "2025-10-17T00:00:00.000Z",
  },
  {
    id: "wn-2025-10-13-a",
    title: "More Accessibility Options",
    summary: "Special fonts for dyslexia, bigger touch targets, color overlays to reduce eye strain, and hover-to-click options.",
    date: "2025-10-13T00:00:00.000Z",
  },
  {
    id: "wn-2025-10-13-b",
    title: "Daily Feature Suggestions",
    summary: "Every day, we suggest different tools you might find helpful. Each tool gets featured regularly so you discover everything.",
    date: "2025-10-13T00:00:00.000Z",
  },
  {
    id: "wn-2025-10-13-c",
    title: "Important Awareness Days",
    summary: "Calendar includes disability awareness days, Indigenous observances, and mental health days so you don't miss what matters.",
    date: "2025-10-13T00:00:00.000Z",
  },
  
  // September 2025 - Foundation
  {
    id: "wn-2025-09-01-a",
    title: "New Menu at Top of Screen",
    summary: "Moved settings to a menu button at the top. Easier to find what you need.",
    date: "2025-09-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-09-01-b",
    title: "Videos & Podcasts in One Place",
    summary: "All our YouTube content is now in one list with pictures. Choose to watch in app or in your browser.",
    date: "2025-09-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-09-01-c",
    title: "Automatic Event Calendar",
    summary: "Canadian holidays and important disability awareness days are added automatically. Filter by month to see what's coming.",
    date: "2025-09-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-09-01-d",
    title: "Research Tab Added",
    summary: "Find studies and articles in the new Research tab. Icons are bigger and easier to tap.",
    date: "2025-09-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-09-01-e",
    title: "Letters Easier to Find",
    summary: "Accommodation and appeal letters are now in the Resources section. Simpler navigation.",
    date: "2025-09-01T00:00:00.000Z",
  },
  
  // August 2025 - More Features
  {
    id: "wn-2025-08-15-a",
    title: "Pick Your Role",
    summary: "Tell us if you have a disability, support someone who does, or want to be an ally. We'll show you what's most helpful for you.",
    date: "2025-08-15T00:00:00.000Z",
  },
  {
    id: "wn-2025-08-15-b",
    title: "Save Important Documents",
    summary: "Keep your medical records, letters, and forms in one secure place. Everything is encrypted so only you can see it.",
    date: "2025-08-15T00:00:00.000Z",
  },
  {
    id: "wn-2025-08-15-c",
    title: "Help Writing Letters",
    summary: "Over 30 letter templates for work accommodations, benefit appeals, housing requests, and more. Just fill in the blanks.",
    date: "2025-08-15T00:00:00.000Z",
  },
  
  // July 2025 - Wellness Tools
  {
    id: "wn-2025-07-01-a",
    title: "Coping Skills Library",
    summary: "Learn helpful coping skills for managing stress, emotions, and tough situations. Organized by topic.",
    date: "2025-07-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-07-01-b",
    title: "Plan Your Day by Energy",
    summary: "Schedule tasks when you have energy for them. Color-coded planner shows low, medium, and high energy times.",
    date: "2025-07-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-07-01-c",
    title: "Track Your Symptoms",
    summary: "Keep notes on your symptoms - when they happen, how bad they are, what makes them worse. Look for patterns over time.",
    date: "2025-07-01T00:00:00.000Z",
  },
  
  // June 2025 - Community
  {
    id: "wn-2025-06-01-a",
    title: "Connect With Others",
    summary: "Chat with other people who get it. Join support groups based on what you're dealing with. Safe and moderated.",
    date: "2025-06-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-06-01-b",
    title: "Find a Peer Support Buddy",
    summary: "Match with someone who has similar experiences. Get support from people who truly understand.",
    date: "2025-06-01T00:00:00.000Z",
  },
  
  // May 2025 - Advocacy Help
  {
    id: "wn-2025-05-01-a",
    title: "AI Helper for Common Tasks",
    summary: "Get help translating medical jargon, understanding policies, and writing letters. Quick prompts for tasks you do often.",
    date: "2025-05-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-05-01-b",
    title: "Accountability Coach",
    summary: "Learn your rights and make a plan. Track what people promised you and when to follow up.",
    date: "2025-05-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-05-01-c",
    title: "Find a Lawyer or Advocate",
    summary: "Search for professionals who can help. Filter by what you need, where you are, and see ratings from others.",
    date: "2025-05-01T00:00:00.000Z",
  },
  
  // April 2025 - App Launch
  {
    id: "wn-2025-04-01-a",
    title: "Welcome to 3mpwr App!",
    summary: "A safe, private app for people with disabilities. Your data stays on your device and belongs to you only.",
    date: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-04-01-b",
    title: "Made for Canada",
    summary: "Legal info customized for your province or territory. Covers federal, provincial, and Indigenous laws.",
    date: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "wn-2025-04-01-c",
    title: "Designed to Be Accessible",
    summary: "Works with screen readers, has high contrast mode, text gets bigger, and all buttons are easy to tap.",
    date: "2025-04-01T00:00:00.000Z",
  },
];
