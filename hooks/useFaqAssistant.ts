import React from 'react';

import { getFaqSuggestions, getLLMEnhancedSuggestions } from '../services/faqAssistant';
import type { Faq } from '../types/faq';

interface Options { llm?: boolean; baseUrl?: string; apiKey?: string; }

export function useFaqAssistant(faqs: Faq[], query: string, opts: Options = {}) {
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const stableFaqs = React.useRef(faqs);
  stableFaqs.current = faqs;
  React.useEffect(()=> {
    let cancelled = false;
    (async () => {
      if(!query.trim()) { setSuggestions([]); return; }
      if(opts.llm) {
        const out = await getLLMEnhancedSuggestions(query, stableFaqs.current, { baseUrl: opts.baseUrl, apiKey: opts.apiKey });
        if(!cancelled) setSuggestions(out);
      } else {
        const out = getFaqSuggestions(query, stableFaqs.current, 5);
        if(!cancelled) setSuggestions(out);
      }
    })();
    return ()=> { cancelled = true; };
  }, [query, opts.llm, opts.baseUrl, opts.apiKey]);
  return suggestions;
}
