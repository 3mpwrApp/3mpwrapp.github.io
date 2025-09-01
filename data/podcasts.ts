export type Podcast = {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  channel?: string;
};

export const podcasts: Podcast[] = [
  { id: "pcast1", title: "Empowr Voices #1", description: "Introductions and mission.", duration: "18:32", audioUrl: "" },
  { id: "pcast2", title: "Youth Education Spotlight", description: "Mentors making impact.", duration: "24:10", audioUrl: "" },
  { id: "pcast3", title: "Wellness Habits", description: "Daily routines that work.", duration: "22:47", audioUrl: "" },
];
