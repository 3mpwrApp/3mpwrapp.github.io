export type WhatsNewItem = {
  id: string;
  title: string;
  summary: string;
  date: string; // ISO date
};

export const whatsnew: WhatsNewItem[] = [
  { id: "wn1", title: "Settings + High Contrast", summary: "Added Settings tab with high contrast and text size.", date: new Date().toISOString() },
  { id: "wn2", title: "Events Calendar", summary: "Visual monthly calendar with day filtering.", date: new Date().toISOString() },
];

