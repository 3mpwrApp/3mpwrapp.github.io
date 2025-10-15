import { fetchJSON, getErrorMessage } from '../utils/network';

export type WorldItem = { id: string; title: string; kind: 'law'|'protest'|'update'; lat: number; lng: number; country?: string; city?: string };

export async function fetchWorldItems(): Promise<WorldItem[]> {
  const url = process.env.EXPO_PUBLIC_WORLD_MAP_URL;
  if (!url) return [];
  
  try {
    const data = await fetchJSON<any>(url, {
      timeout: 10000,
      retries: 2,
    });
    
    if (Array.isArray(data)) return data as WorldItem[];
    if (Array.isArray((data as any).items)) return (data as any).items as WorldItem[];
    
    return [];
  } catch (error) {
    if (__DEV__) {
      console.warn('World map data error:', getErrorMessage(error));
    }
    return [];
  }
}

