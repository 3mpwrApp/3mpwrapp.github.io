export type MasterIndexLink = { label: string; url?: string; note?: string };
export type MasterIndexSection = { id: string; title: string; description?: string; links: MasterIndexLink[]; subsections?: MasterIndexSection[] };

export interface MasterIndexRoot {
  canada: MasterIndexSection[];
  global: MasterIndexSection[];
  landmarks: MasterIndexSection[];
  themes: MasterIndexSection[];
  search: MasterIndexSection[];
  howTo: MasterIndexSection[];
}

// Load data from JSON asset to reduce TS source weight while preserving types
// Note: resolveJsonModule is enabled in tsconfig
import raw from './research-master-index.json';

export const masterIndex = raw as unknown as MasterIndexRoot;
