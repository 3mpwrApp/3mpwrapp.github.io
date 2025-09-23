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

function recencyBoost(ts: number | undefined, halfLifeMinutes: number) {
  if (!ts) return 0;
  const deltaMin = (now() - ts) / 60000;
  return Math.exp(-deltaMin / halfLifeMinutes);
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

export async function scoreTools(extra?: { coachProgress?: number }) : Promise<Suggestion[]> {
  const { id: lastSuggested } = await getLastSuggested();
  const suggestions: Suggestion[] = [];
  TOOLS.forEach(tool => {
    if (tool.prereq && !tool.prereq()) return;
    let score = tool.importance; const reason: Suggestion['reason'] = [];
    const lastComplete = lastEvent(tool.id, ['usage.complete']);
    const lastView = lastEvent(tool.id, ['usage.view','usage.start']);
    const recencyTs = lastView?.ts || lastComplete?.ts;
    const rb = recencyBoost(recencyTs, tool.id === 'coach' ? 180 : 1440); // minutes
    score += rb;
    if (rb > 0) reason.push({ key:'recency', data:{ value: rb.toFixed(2) }});
    if (!lastView && !lastComplete) { score += 0.35; reason.push({ key:'novelty' }); }
    if (tool.id === 'coach' && typeof extra?.coachProgress === 'number' && extra.coachProgress < 1) {
      const gap = 1 - extra.coachProgress; const boost = gap * 0.5; score += boost; reason.push({ key:'engagementGap', data:{ gap: gap.toFixed(2) }}); }
    if (tool.id === lastSuggested) { score -= 0.5; reason.push({ key:'rotation' }); }
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
