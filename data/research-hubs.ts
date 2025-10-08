export type ResearchHub = {
  id: string;
  region: 'canada' | 'world';
  name: string;
  description: string;
  links: { label: string; url: string }[];
  tags?: string[];
};

// Loaded from JSON to keep TS source size small
import hubs from './research-hubs.json';

export const researchHubs: ResearchHub[] = hubs as ResearchHub[];
