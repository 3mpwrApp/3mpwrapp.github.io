import { shouldShowMoodNudge } from '../services/moodInsights';

describe('nudge suppression logic (pure)', () => {
  it('no nudge if logged today', () => {
    const now = new Date(); now.setHours(19,0,0,0);
    expect(shouldShowMoodNudge(now,1, null)).toBe(false);
  });
});
