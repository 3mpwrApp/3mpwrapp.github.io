export type Petition = {
  id: string;
  title: string;
  summary: string;
  target?: string;
  goalCount?: number;
  contactEmail?: string;
  createdAt: number;
  membersCount?: number;
};

// Seed sample petitions (could later be fetched remotely similar to campaigns)
export const petitions: Petition[] = [
  {
    id: 'pt-1001',
    title: 'Accessible Transit Expansion',
    summary: 'Call for increased funding to expand accessible public transit routes.',
    target: 'City Council',
    goalCount: 5000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    membersCount: 1234,
  },
  {
    id: 'pt-1002',
    title: 'Inclusive Workplace Standards',
    summary: 'Mandate accommodations reporting and inclusive hiring transparency.',
    target: 'Labour Ministry',
    goalCount: 8000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    membersCount: 2890,
  },
];
