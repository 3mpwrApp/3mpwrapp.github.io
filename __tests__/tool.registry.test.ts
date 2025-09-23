import { listToolMeta } from '../services/toolRegistry';

describe('tool registry', () => {
  it('all entries have required fields', () => {
    const list = listToolMeta();
    expect(list.length).toBeGreaterThan(0);
    for (const meta of list) {
      expect(meta.id).toBeTruthy();
      expect(meta.route).toMatch(/\//);
      expect(meta.i18nLabelKey).toMatch(/^homeGuide\.tool\./);
      expect(meta.category).toMatch(/^(advocacy|wellness|resources|system)$/);
      expect(meta.icon).toBeTruthy();
      expect(meta.a11yLabelKey).toMatch(/^a11y\.tool\./);
    }
  });
});
