import { forecastPain } from '../services/wellness/painForecast';

jest.mock('../services/cache', () => ({
  __esModule: true,
  getCachedJSON: jest.fn(),
}));

const { getCachedJSON } = jest.requireMock('../services/cache');

function mk(d: string, pain: number, tags?: string){
  return { id: d, date: d, pain: String(pain), tags };
}

describe('painForecast', () => {
  it('computes improving trend when recent avg lower than previous', async () => {
    const data = [
      mk('2025-09-01', 7), mk('2025-09-02', 7), mk('2025-09-03', 6), mk('2025-09-04', 6), mk('2025-09-05', 6), mk('2025-09-06', 5), mk('2025-09-07', 6),
      mk('2025-09-08', 5), mk('2025-09-09', 5), mk('2025-09-10', 5), mk('2025-09-11', 4), mk('2025-09-12', 4), mk('2025-09-13', 4), mk('2025-09-14', 4),
    ];
    getCachedJSON.mockResolvedValueOnce(data);
    const r = await forecastPain();
    expect(r.trend).toBe('improving');
    expect(r.next3d.length).toBe(3);
  });

  it('adds tag-based tips', async () => {
    const data = [
      mk('2025-09-10', 7, 'stress'), mk('2025-09-11', 7, 'stress'), mk('2025-09-12', 7, 'stress'), mk('2025-09-13', 7, 'stress'),
      mk('2025-09-14', 7, 'sleep'), mk('2025-09-15', 7, 'sleep'), mk('2025-09-16', 7, 'med-change'),
    ];
    getCachedJSON.mockResolvedValueOnce(data);
    const r = await forecastPain();
    expect(r.tips.join(' ')).toMatch(/Stress|sleep|med change/i);
  });
});
