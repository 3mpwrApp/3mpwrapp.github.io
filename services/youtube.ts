import type { Podcast } from "../data/podcasts";
import { logger } from '../utils/logger';
import { fetchJSON, getErrorMessage } from '../utils/network';

export type YTVideo = { id: string; title: string; url: string; minutes?: number; audience?: string };

export async function fetchExercisePlaylist(query: string, max = 6): Promise<YTVideo[]> {
  const key = process.env.EXPO_PUBLIC_YT_API_KEY;
  if (!key) return [];
  
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', key);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', String(max));
    
    const data = await fetchJSON<any>(url.toString(), {
      timeout: 10000,
      retries: 2,
    });
    
    return (data.items || []).map((it: any) => ({
      id: it.id.videoId,
      title: it.snippet.title,
      url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
    }));
  } catch (error) {
    if (__DEV__) {
      logger.warn('YouTube API error:', getErrorMessage(error));
    }
    return [];
  }
}

export async function fetchInjuredWorkerVideos(max = 30): Promise<Podcast[]> {
  const key = process.env.EXPO_PUBLIC_YT_API_KEY;
  if (!key) return [] as any;
  
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', key);
    url.searchParams.set('part', 'snippet');
    // Broad query for injured workers / disability justice related content
    url.searchParams.set('q', 'injured workers OR disability justice podcast');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', String(Math.max(1, Math.min(50, max))));
    
    const data = await fetchJSON<any>(url.toString(), {
      timeout: 15000, // Longer timeout for larger result set
      retries: 2,
    });
    
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
  } catch (error) {
    if (__DEV__) {
      logger.warn('YouTube API error:', getErrorMessage(error));
    }
    return [] as any;
  }
}
