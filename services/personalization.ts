import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import { useCoachProgress } from '../store/coachProgress';

import { usage } from './usage';

export interface SuggestibleTool {
  id: string;
  category: 'advocacy' | 'wellness' | 'community' | 'resources';
  importance: 1|2|3;
  cooldownMs?: number;
  prereq?: () => boolean;
}

const TOOLS: SuggestibleTool[] = [
  { id:'coach', category:'advocacy', importance:3 },
  { id:'translator', category:'advocacy', importance:3 },
  { id:'policy_simplifier', category:'advocacy', importance:2 },
  { id:'wellness_mood', category:'wellness', importance:2 },
  { id:'resources_search', category:'resources', importance:2 },
];

interface Suggestion { toolId: string; score: number; reason: { key: string; data?: any }[]; }

function now() { return Date.now(); }

function recencyFactor(ts: number | undefined, halfLifeMinutes: number) {
  if (!ts) return 0;
  const deltaMin = (now() - ts) / 60000;
  return Math.exp(-deltaMin / halfLifeMinutes); // 1 (just used) -> ~0 over time
}

function computeStreak(tool: string) {
  // Count consecutive prior days with at least one interaction
  const buf = usage.getBuffer().filter(e => e.tool === tool);
  if (!buf.length) return 0;
  const days = new Set(buf.map(e => new Date(e.ts).toDateString()));
  // Walk backwards from today
  let streak = 0; const today = new Date();
  for (let i=0;i<30;i++) { // cap at 30 for performance
    const d = new Date(today.getTime() - i*86400000).toDateString();
    if (days.has(d)) streak++; else break;
  }
  return streak;
}

function timeOfDayBoost(tool: SuggestibleTool) {
  const h = new Date().getHours();
  // simple heuristic windows
  const isMorning = h >=5 && h < 11;
  const isMidday = h >=11 && h < 17;
  const isEvening = h >=17 && h < 23;
  if (tool.category === 'wellness' && isMorning) return { boost:0.25, key:'tod_morning' };
  if (tool.category === 'advocacy' && isMidday) return { boost:0.2, key:'tod_midday' };
  if (tool.category === 'resources' && isEvening) return { boost:0.2, key:'tod_evening' };
  return { boost:0, key:'' };
}

function lastEvent(tool: string, types: string[]) {
  const buf = usage.getBuffer();
  for (let i = buf.length -1; i >=0; i--) {
    const e = buf[i];
    if (e.tool === tool && types.includes(e.type)) return e;
  }
  return undefined;
}

async function getLastSuggested(): Promise<{ id?: string; ts?: number }> {
  try { const raw = await AsyncStorage.getItem('personalization:lastSuggested'); if (raw) return JSON.parse(raw); } catch {}
  return {};
}

async function setLastSuggested(id: string) {
  try { await AsyncStorage.setItem('personalization:lastSuggested', JSON.stringify({ id, ts: Date.now() })); } catch {}
}

// Feedback persistence (simple aggregated counters)
interface FeedbackEntry { up: number; down: number; }
interface FeedbackMap { [toolId: string]: FeedbackEntry }
async function loadFeedback(): Promise<FeedbackMap> { try { const raw = await AsyncStorage.getItem('personalization:feedback:v1'); if (raw) return JSON.parse(raw); } catch {} return {}; }
async function saveFeedback(map: FeedbackMap) { try { await AsyncStorage.setItem('personalization:feedback:v1', JSON.stringify(map)); } catch {} }

export async function submitFeedback(toolId: string, kind: 'up'|'down') {
  const map = await loadFeedback();
  const entry = map[toolId] || { up:0, down:0 };
  if (kind === 'up') entry.up++; else entry.down++;
  map[toolId] = entry;
  await saveFeedback(map);
  return entry;
}

export async function scoreTools(extra?: { coachProgress?: number }) : Promise<Suggestion[]> {
  const { id: lastSuggested } = await getLastSuggested();
  const feedback = await loadFeedback();
  const suggestions: Suggestion[] = [];
  TOOLS.forEach(tool => {
    if (tool.prereq && !tool.prereq()) return;
    let score = tool.importance; const reason: Suggestion['reason'] = [];
    const lastComplete = lastEvent(tool.id, ['usage.complete']);
    const lastView = lastEvent(tool.id, ['usage.view','usage.start']);
    const recencyTs = lastView?.ts || lastComplete?.ts;
    const rf = recencyFactor(recencyTs, tool.id === 'coach' ? 180 : 720); // coach decays slower, others moderate
    // Instead of adding positive boost, interpret recency as a dampening factor (recently used -> lower novelty weight)
    const recencyPenalty = rf * 0.6; // max penalty 0.6 when just used
    if (recencyPenalty > 0) { score -= recencyPenalty; reason.push({ key:'recentUse', data:{ penalty: recencyPenalty.toFixed(2) }}); }
    if (!lastView && !lastComplete) { score += 0.35; reason.push({ key:'novelty' }); }
    if (tool.id === 'coach' && typeof extra?.coachProgress === 'number' && extra.coachProgress < 1) {
      const gap = 1 - extra.coachProgress; const boost = gap * 0.5; score += boost; reason.push({ key:'engagementGap', data:{ gap: gap.toFixed(2) }}); }
    if (tool.id === lastSuggested) { score -= 0.5; reason.push({ key:'rotation' }); }
    // Streak boost (small, log diminishing)
    const streak = computeStreak(tool.id);
    if (streak > 1) { const sb = Math.min(0.4, Math.log2(streak)/5); score += sb; reason.push({ key:'streak', data:{ streak, boost: sb.toFixed(2) }}); }
    // Time-of-day contextual boost
    const tod = timeOfDayBoost(tool);
    if (tod.boost) { score += tod.boost; reason.push({ key: tod.key, data:{ boost: tod.boost } }); }
    // Feedback weight (net sentiment)
    const fb = feedback[tool.id];
    if (fb) {
      const net = fb.up - fb.down;
      if (net !== 0) {
        const weight = Math.tanh(net / 5) * 0.6; // cap influence
        score += weight;
        reason.push({ key:'feedback', data:{ up: fb.up, down: fb.down, weight: weight.toFixed(2) } });
      }
    }
    suggestions.push({ toolId: tool.id, score, reason });
  });
  const sorted = suggestions.sort((a,b)=> b.score - a.score);
  if (sorted[0]) setLastSuggested(sorted[0].toolId);
  return sorted;
}

// React hook wrapper (simplified example)
export function useSuggestions() {
  const { percentComplete } = useCoachProgress();
  const fraction = percentComplete / 100;
  const [list, setList] = React.useState<Suggestion[]>([]);
  React.useEffect(()=> { scoreTools({ coachProgress: fraction }).then(setList); }, [fraction]);
  return list;
}
