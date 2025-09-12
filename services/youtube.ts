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

