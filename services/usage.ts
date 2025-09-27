import { logActivity } from './activity';

let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

const KEY = 'usageEvents:v1';

export interface UsageEvent {
  id: string;
  type: 'usage.view' | 'usage.start' | 'usage.complete' | 'usage.error';
  ts: number;
  tool: string;
  route?: string;
  durationMs?: number;
  meta?: Record<string, any>;
}

let buffer: UsageEvent[] = [];

(async () => {
  try { const raw = await AsyncStorage?.getItem?.(KEY); if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) buffer = parsed; } } catch {}
})();

async function persist() { try { await AsyncStorage?.setItem?.(KEY, JSON.stringify(buffer.slice(-500))); } catch {} }

function push(evt: Omit<UsageEvent,'id'|'ts'> & { ts?: number }) {
  const full: UsageEvent = { id: Math.random().toString(36).slice(2), ts: evt.ts || Date.now(), ...evt } as UsageEvent;
  buffer.push(full);
  persist();
  // Mirror into activity feed optionally (lightweight)
  logActivity({ type: 'feature.use', summaryKey: 'feature.use', payload: { usageType: full.type, tool: full.tool, route: full.route } }).catch(()=>{});
  return full;
}

export const usage = {
  view(tool: string, route?: string, meta?: Record<string,any>) { return push({ type:'usage.view', tool, route, meta }); },
  start(tool: string, route?: string, meta?: Record<string,any>) { return push({ type:'usage.start', tool, route, meta }); },
  complete(tool: string, route?: string, durationMs?: number, meta?: Record<string,any>) { return push({ type:'usage.complete', tool, route, durationMs, meta }); },
  error(tool: string, route?: string, meta?: Record<string,any>) { return push({ type:'usage.error', tool, route, meta }); },
  getBuffer() { return buffer.slice(); },
  clearRecents() {
    // Remove only items contributing to Recent Tools (view/complete), keep starts/errors for diagnostics
    buffer = buffer.filter(e => !(e.type === 'usage.view' || e.type === 'usage.complete'));
    persist();
  }
};
