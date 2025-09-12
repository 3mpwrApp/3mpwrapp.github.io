export type WorldItem = { id: string; title: string; kind: 'law'|'protest'|'update'; lat: number; lng: number; country?: string; city?: string };

export async function fetchWorldItems(): Promise<WorldItem[]> {
  const url = process.env.EXPO_PUBLIC_WORLD_MAP_URL;
  if (!url) return [];
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as WorldItem[];
    if (Array.isArray((data as any).items)) return (data as any).items as WorldItem[];
  } catch {}
  return [];
}

