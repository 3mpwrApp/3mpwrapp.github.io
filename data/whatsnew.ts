export type WhatsNewItem = {
  id: string;
  title: string;
  summary: string;
  date: string; // ISO date
  archived?: boolean; // auto-marked when older than 30 days
};

export const whatsnew: WhatsNewItem[] = [
  {
    id: "wn-2025-09-01-a",
    title: "Header Menu & Settings",
    summary: "Added header menu with backdrop and moved Settings into header.",
    date: new Date().toISOString(),
  },
  {
    id: "wn-2025-09-01-b",
    title: "YouTube Videos",
    summary:
      "Consolidated Podcasts & Stories into a single YouTube list with thumbnails and app/browser open options.",
    date: new Date().toISOString(),
  },
  {
    id: "wn-2025-09-01-c",
    title: "Events Automation",
    summary:
      "Auto-generated Canadian holidays and disability observances; month-only view and filters.",
    date: new Date().toISOString(),
  },
  {
    id: "wn-2025-09-01-d",
    title: "Research & Icons",
    summary: "Added Research tab with icon and increased tab icon sizes.",
    date: new Date().toISOString(),
  },
  {
    id: "wn-2025-09-01-e",
    title: "Resources Letters",
    summary:
      "Accommodation and Appeal letters live under Resources; not shown as tabs.",
    date: new Date().toISOString(),
  },
];
