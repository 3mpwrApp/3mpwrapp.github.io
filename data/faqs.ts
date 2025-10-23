export type Faq = { id: string; q: string; a: string };

// Import FAQ data directly for synchronous access
import faqData from "../assets/data/faqs.json";

// Export FAQ data for immediate use
export const faqs: Faq[] = faqData as Faq[];

// Async helpers for compatibility
export async function getFaqs(): Promise<Faq[]> {
  return faqs;
}

export async function getFaqById(id: string): Promise<Faq | undefined> {
  return faqs.find(faq => faq.id === id);
}

export async function searchFaqs(query: string): Promise<Faq[]> {
  const lowerQuery = query.toLowerCase();
  return faqs.filter(faq => 
    faq.q.toLowerCase().includes(lowerQuery) || 
    faq.a.toLowerCase().includes(lowerQuery)
  );
}
