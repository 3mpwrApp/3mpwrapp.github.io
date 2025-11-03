import type { MoodEntry } from '../store/mood';

export interface MoodInsights {
  avg7d: number | null;
  delta24h: number | null; // latest vs previous day avg
  trend: 'improving' | 'declining' | 'stable' | 'none';
  streakDays: number; // consecutive days with at least one entry
  lastEntryAgeHours: number | null;
}

function dayKey(ts: number) { const d = new Date(ts); d.setHours(0,0,0,0); return d.getTime(); }

export function computeMoodInsights(entries: MoodEntry[] | undefined | null, now: number = Date.now()): MoodInsights {
  if (!entries || !entries.length) {
    return { avg7d: null, delta24h: null, trend: 'none', streakDays: 0, lastEntryAgeHours: null };
  }
  const sorted = [...entries].sort((a,b)=> b.ts - a.ts);
  const lastEntryAgeHours = (now - sorted[0].ts)/3600000;
  // 7d avg
  const cutoff7 = now - 7*24*3600*1000;
  const last7 = sorted.filter(e=> e.ts >= cutoff7);
  const avg7d = last7.length ? last7.reduce((s,e)=> s+e.score,0)/last7.length : null;
  // Group by day
  const byDay = new Map<number, MoodEntry[]>();
  for (const e of sorted) {
    const k = dayKey(e.ts); if (!byDay.has(k)) byDay.set(k,[]); byDay.get(k)!.push(e);
  }
  const dayKeys = [...byDay.keys()].sort((a,b)=> b - a); // recent first
  const todayKey = dayKey(now);
  // streak: consecutive days back from today (or from most recent day if no today entries)
  let streak = 0;
  let cursor = byDay.has(todayKey)? todayKey : (dayKeys.length > 0 ? dayKeys[0] : todayKey);
  if (dayKeys.length === 0) {
    return { avg7d, delta24h, trend, streakDays: streak, lastEntryAgeHours };
  }
  // Count streak: each day going backwards
  while (cursor) {
    if (!byDay.has(cursor)) break;
    streak++;
    // Move to previous day by creating a new Date and subtracting 1 day
    const prevDate = new Date(cursor);
    prevDate.setDate(prevDate.getDate() - 1);
    cursor = dayKey(prevDate.getTime());
    // Safety: if we've gone too far back, stop
    if (streak > 365) break;
  }
  // delta24h: compare today's avg (or most recent day) vs previous day
  let delta24h: number | null = null;
  if (dayKeys.length >= 2) {
    const firstDay = dayKeys[0];
    const secondDay = dayKeys[1];
    const avg1 = byDay.get(firstDay)!.reduce((s,e)=> s+e.score,0)/byDay.get(firstDay)!.length;
    const avg2 = byDay.get(secondDay)!.reduce((s,e)=> s+e.score,0)/byDay.get(secondDay)!.length;
    delta24h = avg1 - avg2;
  }
  // trend: compute regression-ish simple slope over last up to 7 days (daily averages)
  const recentDayKeys = dayKeys.slice(0,7).reverse(); // oldest -> newest
  let trend: MoodInsights['trend'] = 'none';
  if (recentDayKeys.length >= 3) {
    const avgs = recentDayKeys.map(k=> byDay.get(k)!.reduce((s,e)=> s+e.score,0)/byDay.get(k)!.length);
    const n = avgs.length;
    const xs = avgs.map((_,i)=> i);
    const xMean = xs.reduce((s,x)=> s+x,0)/n;
    const yMean = avgs.reduce((s,y)=> s+y,0)/n;
    let num=0, den=0;
    for (let i=0;i<n;i++){ num += (xs[i]-xMean)*(avgs[i]-yMean); den += (xs[i]-xMean)**2; }
    const slope = den===0? 0 : num/den; // slope per day
    const threshold = 0.15; // small scale since scores -2..2
    if (slope > threshold) trend = 'improving'; else if (slope < -threshold) trend = 'declining'; else trend = 'stable';
  }
  return { avg7d, delta24h, trend, streakDays: streak, lastEntryAgeHours };
}

export function shouldShowMoodNudge(now: Date, entriesToday: number, lastEntryAt: number | null): boolean {
  const hour = now.getHours();
  if (hour < 18) return false; // evening reminder only
  if (entriesToday > 0) return false;
  // If user logged within last 20 hours, skip (recent activity late last night)
  if (lastEntryAt && (now.getTime() - lastEntryAt) < 20*3600*1000) return false;
  return true;
}
