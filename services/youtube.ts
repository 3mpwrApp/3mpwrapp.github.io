export type YTVideo = { id: string; title: string; url: string; minutes?: number; audience?: string };

export async function fetchExercisePlaylist(query: string, max = 6): Promise<YTVideo[]> {
  const key = process.env.EXPO_PUBLIC_YT_API_KEY;
  if (!key) return [];
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', key);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', String(max));
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((it: any) => ({
    id: it.id.videoId,
    title: it.snippet.title,
    url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
  }));
}

export async function fetchInjuredWorkerVideos(max = 30): Promise<import('../data/podcasts').Podcast[]> {
  const key = process.env.EXPO_PUBLIC_YT_API_KEY;
  if (!key) return [] as any;
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', key);
  url.searchParams.set('part', 'snippet');
  // Broad query for injured workers / disability justice related content
  url.searchParams.set('q', 'injured workers OR disability justice podcast');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', String(Math.max(1, Math.min(50, max))));
  const res = await fetch(url.toString());
  if (!res.ok) return [] as any;
  const data = await res.json();
  const items = (data.items || []) as any[];
  return items.map((it) => ({
    id: `yt:${it.id.videoId}`,
    title: it.snippet.title as string,
    description: 'Watch on YouTube',
    duration: '—',
    audioUrl: `https://youtu.be/${it.id.videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${it.id.videoId}/hqdefault.jpg`,
    channel: it.snippet.channelTitle as string,
  }));
}
