/**
 * Smoke tests for collective evidence anonymization.
 */

import { anonymizeEvidence, MINIMUM_USER_THRESHOLD, type AnonymousContribution } from '../collectiveEvidence';
import type { EvidenceLocalNote } from '../evidenceCrypto';

function createMockEvidence(text: string, daysAgo = 0): EvidenceLocalNote {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: `test-${Math.random().toString(36).slice(2)}`,
    date: date.toISOString(),
    text,
    tags: [],
  };
}

describe('collectiveEvidence', () => {
  it('returns anonymized contribution with region mapping', () => {
    const evidence = createMockEvidence('Claim denied for insufficient evidence', 5);
    const result: AnonymousContribution = anonymizeEvidence(evidence, 'Seattle');

    expect(result.id).toBe(evidence.id);
    expect(result.contributedAt).toBeGreaterThan(0);
    expect(result.daysAgo).toBeGreaterThan(0);
    expect(result.region).toBe('US West');
  });

  it('exposes minimum user threshold constant', () => {
    expect(MINIMUM_USER_THRESHOLD).toBe(50);
  });

  it('extracts themes array', () => {
    const evidence = createMockEvidence('Denied for insufficient medical evidence.');
    const result = anonymizeEvidence(evidence);

    expect(Array.isArray(result.themes)).toBe(true);
  });
});
