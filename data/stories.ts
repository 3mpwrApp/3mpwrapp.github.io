export type Story = {
  id: string;
  title: string;
  description: string;
  author?: string;
};

export const stories: Story[] = [
  // Mirror the YouTube videos as stories for the "Podcasts & Stories" view
  ...(require('./youtube-ids.json') as string[]).map((id) => ({
    id: `yt:${id}`,
    title: `YouTube: ${id}`,
    description: "Watch on YouTube",
    author: "YouTube",
  })),
];
