export type Faq = { id: string; q: string; a: string };

// TODO(deprecate): After confirming Firestore seeding (`scripts/seed-faqs.js`) in production environments,
// migrate consumers to rely solely on remote collection + local user additions, then remove this file.
export const faqs: Faq[] = [
  {
    id: "f1",
    q: "What is Empowr?",
    a: "Empowr is a hub for injured workers, the disability community, advocates, and allies. It brings together resources, podcasts, events, wellness tools, and simple letter templates in one app.",
  },
  {
    id: "f2",
    q: "How do I navigate the app?",
    a: "Use the tabs at the bottom: What's New, Resources, Podcasts, Events, Wellness, FAQs, About, Saved, and Settings. Tap a card to open details.",
  },
  {
    id: "f3",
    q: "How do I change text size and contrast?",
    a: "Open Settings and choose Text Size (Normal, Large, X‑Large). Toggle High Contrast to boost readability. Quick contrast buttons are available on most screens.",
  },
  {
    id: "f4",
    q: "How do I filter Resources by province?",
    a: "Set your province in Settings. The Resources tab shows a Canada section and provincial sections; you can also filter using the chips at the top.",
  },
  {
    id: "f5",
    q: "Can I save items for later?",
    a: "Yes. On detail screens, tap ‘Save to Favorites’. Find everything in the Saved tab.",
  },
  {
    id: "f6",
    q: "Where do podcasts come from?",
    a: "Podcasts may include curated YouTube videos on WSIB/WCB and injured worker topics. We link out to YouTube for playback to respect their terms.",
  },
  {
    id: "f7",
    q: "How does the Events calendar work?",
    a: "The Events tab shows a monthly grid. Select a day to filter the list. Open an event to see details and add a reminder.",
  },
  {
    id: "f8",
    q: "What are the letter templates?",
    a: "Under Resources, you can generate Accommodation and Appeal letters. Fill in fields, preview, and Share or Export as PDF (requires expo‑print in a dev build).",
  },
  {
    id: "f9",
    q: "What’s New vs Archive?",
    a: "What's New shows updates from the last 30 days. Older items automatically move to Archive.",
  },
  {
    id: "f10",
    q: "What data is stored?",
    a: "Favorites and some content (What’s New, FAQs you add) are stored locally on your device for convenience. You can clear app data from your device settings.",
  },
  {
    id: "f11",
    q: "How can I contact you?",
    a: "Use the About tab to send an email to empowrapp08162025@gmail.com with suggestions, requests, or questions.",
  },
  {
    id: "f12",
    q: "Where is the Emergency Wallet Card?",
    a: "It now lives under Settings → Emergency Wallet Card. You can also open it from Resources → Support & Directories → Emergency Info Wallet Card, which jumps to the Settings section.",
  },
];
