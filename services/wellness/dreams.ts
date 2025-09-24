import React from 'react';

export type DreamEntry = { id: string; ts: number; text: string };

export function interpretDream(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('falling')) return 'Theme: loss of control or instability.';
  if (lower.includes('teeth')) return 'Theme: appearance, anxiety, or vulnerability.';
  if (lower.includes('chased')) return 'Theme: avoidance or unresolved stressors.';
  if (lower.includes('flying')) return 'Theme: freedom, creativity, or escape.';
  return 'Theme: reflect on core emotion, recent stressors, and bodily sensations.';
}

export function useDreams(){
  const [entries, setEntries] = React.useState<DreamEntry[]>([]);
  const add = (text: string) => setEntries(prev => [...prev, { id: Math.random().toString(36).slice(2), ts: Date.now(), text }]);
  return { entries, add };
}
