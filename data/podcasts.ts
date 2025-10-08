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
  // YouTube videos included as podcast entries
  ...(require('./youtube-ids.json') as string[]).map((id) => ({
    id: `yt:${id}`,
    title: `YouTube: ${id}`,
    description: "Watch on YouTube",
    duration: "—",
    audioUrl: `https://youtu.be/${id}`,
    thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    channel: "YouTube",
  })),
];
