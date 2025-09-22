import { getFaqSuggestions } from '../services/faqAssistant';

describe('faqAssistant getFaqSuggestions', () => {
  const faqs = [
    { id: 'a', q: 'How to reset password', a: 'Use settings account section.' },
    { id: 'b', q: 'How to change display name', a: 'Update in account settings.' },
    { id: 'c', q: 'Password requirements', a: 'Must be 8 chars.' },
    { id: 'd', q: 'Delete account process', a: 'Go to account danger zone.' },
    { id: 'e', q: 'Account email change', a: 'Contact support.' },
  ];

  it('returns empty array for empty query', () => {
    expect(getFaqSuggestions('', faqs)).toEqual([]);
  });

  it('prioritizes exact match > startsWith > includes > answer match', () => {
    const res = getFaqSuggestions('password', faqs, 10);
    // Expect ordering: exact phrase (if any), startsWith, includes, then answer-only.
    // In dataset: 'Password requirements' (starts with) vs 'How to reset password' (includes) so startsWith should beat includes.
    expect(res[0].id).toBe('c');
    // Ensure both contain password
    expect(res.map(r => r.id)).toEqual(expect.arrayContaining(['a','c']));
  });

  it('boosts token overlap', () => {
    const res = getFaqSuggestions('change display name', faqs, 5);
    // Should surface display name question first
    expect(res[0].id).toBe('b');
  });

  it('limits results to provided limit', () => {
    const res = getFaqSuggestions('account', faqs, 2);
    expect(res.length).toBe(2);
  });
});
