export type Podcast = {
  id: string;
  title: string;
  description: string;
  duration: string;
};

export const podcasts: Podcast[] = [
  { id: "pcast1", title: "Empowr Voices #1", description: "Introductions and mission.", duration: "18:32" },
  { id: "pcast2", title: "Youth Education Spotlight", description: "Mentors making impact.", duration: "24:10" },
  { id: "pcast3", title: "Wellness Habits", description: "Daily routines that work.", duration: "22:47" },
];

