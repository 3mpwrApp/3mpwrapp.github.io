import { describe, expect, it } from '@jest/globals';

import { listTemplates, renderTemplate } from '../services/notificationTemplates';

// Minimal fake translator returning key or default
const fakeT = (k: string, def?: string) => def || k;

describe('notification templates', () => {
  it('all templates render with provided vars without leaving unsubstituted placeholders', () => {
    const templates = listTemplates();
    // Provide a superset of variables so substitution occurs
    const vars: Record<string,string> = {
      title: 'Title', body: 'Body', petition: 'Fair Wage', resource: 'Resource X', question: 'What?',
      streak: '3', count: '2', queued: '5', case: 'Case A', days: '2'
    };
    for (const tpl of templates) {
      const { title, body } = renderTemplate(tpl.id as any, fakeT, vars);
      expect(title).not.toMatch(/\{\w+\}/);
      if (body) expect(body).not.toMatch(/\{\w+\}/);
    }
  });
});
