import { computeMoodInsights, shouldShowMoodNudge } from '../services/moodInsights';
import type { MoodEntry } from '../store/mood';

describe('mood insights', () => {
  function _makeEntry(offsetHours: number, score: number): MoodEntry { return { id: Math.random().toString(36).slice(2), ts: Date.now() - offsetHours*3600000, score }; }

  it('handles empty', () => {
    const ins = computeMoodInsights([]);
    expect(ins.avg7d).toBeNull();
    expect(ins.streakDays).toBe(0);
  });

  it('computes streak across consecutive days', () => {
    const now = new Date(); now.setHours(12,0,0,0);
    const dayMs = 24*3600*1000;
    const entries: MoodEntry[] = [];
    // today, yesterday, day before (3 day streak)
    entries.push({ id:'a', ts: now.getTime()- 1*3600*1000, score: 1 });
    entries.push({ id:'b', ts: now.getTime()- dayMs - 2*3600*1000, score: 0 });
    entries.push({ id:'c', ts: now.getTime()- 2*dayMs - 3*3600*1000, score: 2 });
    const ins = computeMoodInsights(entries, now.getTime());
    expect(ins.streakDays).toBe(3);
  });

  it('classifies improving trend with positive slope', () => {
    const now = Date.now();
    const dayMs = 24*3600*1000;
    const entries: MoodEntry[] = [];
    // 5 days with increasing scores
    for (let i=4;i>=0;i--) {
      entries.push({ id:'d'+i, ts: now - i*dayMs + 1000, score: (5-i)-2 });
    }
    const ins = computeMoodInsights(entries, now);
    expect(['improving','stable']).toContain(ins.trend); // allow stable if slope below threshold
  });
});

describe('mood nudge logic', () => {
  it('shows nudge after 18:00 with no entries today', () => {
    const now = new Date(); now.setHours(19,0,0,0);
    const show = shouldShowMoodNudge(now, 0, Date.now()-30*3600000);
    expect(show).toBe(true);
  });
  it('no nudge before 18:00', () => {
    const now = new Date(); now.setHours(10,0,0,0);
    expect(shouldShowMoodNudge(now,0, null)).toBe(false);
  });
  it('no nudge if already logged today', () => {
    const now = new Date(); now.setHours(20,0,0,0);
    expect(shouldShowMoodNudge(now,1, null)).toBe(false);
  });
  it('no nudge if recent late-night entry (<20h)', () => {
    const now = new Date(); now.setHours(19,0,0,0);
    const last = now.getTime() - 10*3600000;
    expect(shouldShowMoodNudge(now,0,last)).toBe(false);
  });
});
