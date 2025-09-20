import AsyncStorage from '@react-native-async-storage/async-storage';

import { advocates as local } from '../data/lawyers';

export type AdvocateFilter = { query?: string; issue?: string; province?: string; proBono?: boolean };

export async function fetchAdvocates(page = 1, pageSize = 20, filters: AdvocateFilter = {}) {
  const base = process.env.EXPO_PUBLIC_ADVOCATE_API;
  const cacheKey = `advocates:v1:${page}:${pageSize}:${JSON.stringify(filters)}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  if (!base) {
    const start = (page - 1) * pageSize;
    const q = (filters.query || '').toLowerCase();
    const filtered = local.filter((a) => {
      const text = `${a.name} ${a.org ?? ''} ${a.city ?? ''} ${a.province ?? ''} ${(a.issues||[]).join(' ')}`.toLowerCase();
      return (!q || text.includes(q)) && (!filters.issue || a.issues.includes(filters.issue)) && (!filters.province || a.province === filters.province) && (!filters.proBono || a.proBono === true);
    });
    const slice = filtered.slice(start, start + pageSize);
    return { items: slice, total: filtered.length };
  }

  const url = new URL(`${base.replace(/\/$/, '')}/advocates`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  if (filters.query) url.searchParams.set('q', filters.query);
  if (filters.issue) url.searchParams.set('issue', filters.issue);
  if (filters.province) url.searchParams.set('province', filters.province);
  if (filters.proBono) url.searchParams.set('proBono', 'true');
  const res = await fetch(url.toString());
  if (!res.ok) return { items: [], total: 0 };
  const data = await res.json();
  try { await AsyncStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
  return data;
}

