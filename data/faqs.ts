export type Faq = { id: string; q: string; a: string };

// TODO(deprecate): After confirming Firestore seeding (`scripts/seed-faqs.js`) in production environments,
// migrate consumers to rely solely on remote collection + local user additions, then remove this file.

let cachedFaqs: Faq[] | null = null;

async function loadFaqs(): Promise<Faq[]> {
  if (cachedFaqs) return cachedFaqs;
  
  const data = await import("../assets/data/faqs.json");
  cachedFaqs = data.default as Faq[];
  return cachedFaqs;
}

export async function getFaqs(): Promise<Faq[]> {
  return loadFaqs();
}

export async function getFaqById(id: string): Promise<Faq | undefined> {
  const all = await loadFaqs();
  return all.find(faq => faq.id === id);
}

export async function searchFaqs(query: string): Promise<Faq[]> {
  const all = await loadFaqs();
  const lowerQuery = query.toLowerCase();
  return all.filter(faq => 
    faq.q.toLowerCase().includes(lowerQuery) || 
    faq.a.toLowerCase().includes(lowerQuery)
  );
}

// Backwards compatibility: export empty array for synchronous imports
export const faqs: Faq[] = [];
