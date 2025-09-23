import { scoreTools } from '../services/personalization';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('personalization rotation', () => {
  it('applies rotation penalty to previously top suggestion', async () => {
    // First scoring - capture top
    const first = await scoreTools({ coachProgress: 0 });
    const top1 = first[0];
    expect(top1).toBeTruthy();
    // Simulate re-run with lastSuggested persisted (mock setItem already stored)
    // Mock getItem to return lastSuggested now
    const asyncStorage = require('@react-native-async-storage/async-storage').default;
    (asyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify({ id: top1.toolId, ts: Date.now() }));
    const second = await scoreTools({ coachProgress: 0 });
    const again = second.find(s => s.toolId === top1.toolId)!;
    // Find same tool score in first list
    const prevScore = first.find(s => s.toolId === top1.toolId)!.score;
    expect(again.score).toBeLessThan(prevScore); // rotation penalty applied
    expect(again.reason.some(r => r.key === 'rotation')).toBe(true);
  });
});
