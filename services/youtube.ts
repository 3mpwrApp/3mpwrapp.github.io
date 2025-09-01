// Lightweight YouTube Data API v3 client for fetching relevant videos
// Converts results into the local Podcast[] shape used by the app.
import type { Podcast } from "../data/podcasts";

type YTSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
      standard?: { url: string };
      maxres?: { url: string };
    };
  };
};

type YTSearchResponse = {
  items: YTSearchItem[];
  nextPageToken?: string;
};

type YTVideosItem = {
  id: string;
  contentDetails?: { duration?: string };
};

type YTVideosResponse = {
  items: YTVideosItem[];
};

const YT_BASE = "https://www.googleapis.com/youtube/v3";

// Queries focused on Canada injured worker topics, WSIB/WCB/workers' compensation
const QUERIES = [
  "injured worker Canada",
  "WSIB Canada",
  "WCB Canada",
  "workers' compensation Canada",
  "WorkSafeBC injured worker",
  "Alberta WCB injured worker",
  "Ontario WSIB injured worker",
];

// Parse ISO8601 duration (PT#H#M#S) to mm:ss or hh:mm:ss
function parseISO8601ToClock(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const hours = parseInt(m[1] || "0", 10);
  const mins = parseInt(m[2] || "0", 10);
  const secs = parseInt(m[3] || "0", 10);
  const total = hours * 3600 + mins * 60 + secs;
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60)
    .toString()
    .padStart(hh > 0 ? 2 : 1, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  return hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.EXPO_PUBLIC_YT_API_KEY;
  if (!key) throw new Error("Missing EXPO_PUBLIC_YT_API_KEY");
  const search = new URLSearchParams({ ...params, key });
  const res = await fetch(`${YT_BASE}${path}?${search.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`YouTube API error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function fetchInjuredWorkerVideos(limit = 30): Promise<Podcast[]> {
  // 1) Run several focused searches and collect video IDs
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const q of QUERIES) {
    if (ids.length >= limit) break;
    const data = await ytFetch<YTSearchResponse>("/search", {
      part: "snippet",
      type: "video",
      maxResults: "15",
      q,
      // Prefer recent content; could add regionCode but it doesn't hard-filter by country
      order: "relevance",
      // publishedAfter could be added if we want only recent videos
    });
    for (const it of data.items) {
      const vid = it.id.videoId;
      if (!vid || seen.has(vid)) continue;
      seen.add(vid);
      ids.push(vid);
      if (ids.length >= limit) break;
    }
  }

  if (ids.length === 0) return [];

  // 2) Fetch durations for the collected video IDs
  // YouTube API allows up to 50 IDs per videos.list call
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

  const durations = new Map<string, string>();
  for (const chunk of chunks) {
    const details = await ytFetch<YTVideosResponse>("/videos", {
      part: "contentDetails",
      id: chunk.join(","),
      maxResults: String(chunk.length),
    });
    for (const v of details.items) {
      const clock = parseISO8601ToClock(v.contentDetails?.duration);
      durations.set(v.id, clock);
    }
  }

  // 3) Re-run searches to collect snippets and map by ID (first available wins)
  const snippetById = new Map<string, YTSearchItem["snippet"]>();
  for (const q of QUERIES) {
    const data = await ytFetch<YTSearchResponse>("/search", {
      part: "snippet",
      type: "video",
      maxResults: "15",
      q,
      order: "relevance",
    });
    for (const it of data.items) {
      const vid = it.id.videoId;
      if (!vid || !seen.has(vid) || snippetById.has(vid)) continue;
      snippetById.set(vid, it.snippet);
    }
  }

  // 4) Map into Podcast shape (audioUrl left empty to respect YouTube TOS)
  const episodes: Podcast[] = ids.map((vid) => {
    const s = snippetById.get(vid);
    const title = s?.title ?? "YouTube Video";
    const channel = s?.channelTitle ? ` • ${s.channelTitle}` : "";
    const desc = (s?.description || "").replace(/\s+/g, " ").trim();
    const description = `${desc.slice(0, 140)}${channel}`.trim();
    const thumb = s?.thumbnails?.medium?.url || s?.thumbnails?.high?.url || s?.thumbnails?.default?.url;
    return {
      id: `yt:${vid}`,
      title,
      description,
      duration: durations.get(vid) || "",
      audioUrl: "",
      thumbnailUrl: thumb,
      channel: s?.channelTitle,
    };
  });

  return episodes;
}
