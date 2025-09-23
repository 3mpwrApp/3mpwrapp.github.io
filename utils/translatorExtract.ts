export interface TranslatorSections {
  summary: string;
  keyTerms: string[];
  deadlines: string[];
  actions: string[];
}

export interface TranslatorHeuristicConfig {
  maxLines: number;
  maxSummaryLines: number;
  maxKeyTerms: number;
  maxDeadlines: number;
  maxActions: number;
  termPattern: RegExp;
  deadlinePattern: RegExp;
  actionPattern: RegExp;
}

export const DEFAULT_TRANSLATOR_CONFIG: TranslatorHeuristicConfig = {
  maxLines: 400,
  maxSummaryLines: 3,
  maxKeyTerms: 12,
  maxDeadlines: 10,
  maxActions: 15,
  termPattern: /\b(accessibility|accommodation|appeal|deadline|evidence|medical|benefit|claim|hearing|policy|decision|tribunal|benefits|form)\b/i,
  // Expanded: explicit dates (e.g., 12/10/2025), month names, relative windows
  deadlinePattern: /(by\s+\d{1,2}\s+\w+|within\s+\d+\s+(days?|weeks?|months?)|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}\b)/i,
  actionPattern: /\b(you must|you should|submit|file|send|appeal|provide|respond|contact|notify|complete)\b/i,
};

// Minimal additional locale configs (es, fr) - can be expanded.
export const LOCALE_TRANSLATOR_CONFIG: Record<string, TranslatorHeuristicConfig> = {
  en: DEFAULT_TRANSLATOR_CONFIG,
  es: {
    ...DEFAULT_TRANSLATOR_CONFIG,
    termPattern: /\b(accesibilidad|adaptaci[oó]n|recurso|plazo|evidencia|m[eé]dica|beneficio|reclamaci[oó]n|audiencia|pol[ií]tica|decisi[oó]n|tribunal|formulario)\b/i,
    deadlinePattern: /(antes\s+del?\s+\d{1,2}\s+de\s+\w+|dentro\s+de\s+\d+\s+(d[ií]as?|semanas?|mes(es)?))|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i,
    actionPattern: /\b(debe[s]?|deber[aá]s|presenta(r)?|env[ií]a|apela|proporciona|responde|contacta|notifica|completa)\b/i,
  },
  fr: {
    ...DEFAULT_TRANSLATOR_CONFIG,
    termPattern: /\b(accessibilit[eé]|accommodement|preuve|m[eé]dical|avantage|demande|audience|politique|d[eé]cision|tribunal|formulaire|d[ée]lai)\b/i,
    deadlinePattern: /(avant\s+le\s+\d{1,2}\s+\w+|dans\s+\d+\s+(jours?|semaines?|mois))|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i,
    actionPattern: /\b(vous devez|soumettre|d[eé]poser|envoyer|faire appel|fournir|r[eé]pondre|contacter|notifier|compl[eé]ter)\b/i,
  }
};

export function getTranslatorConfigForLocale(locale?: string) {
  if (!locale) return DEFAULT_TRANSLATOR_CONFIG;
  const base = locale.split('-')[0];
  return LOCALE_TRANSLATOR_CONFIG[locale] || LOCALE_TRANSLATOR_CONFIG[base] || DEFAULT_TRANSLATOR_CONFIG;
}

// Basic heuristic-based extraction from simplified text with configurable patterns
export function extractTranslatorSections(text: string, cfg: TranslatorHeuristicConfig = DEFAULT_TRANSLATOR_CONFIG): TranslatorSections {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean).slice(0, cfg.maxLines);
  const keyTermsSet = new Set<string>();
  const deadlines: string[] = [];
  const actions: string[] = [];
  const summaryLines: string[] = [];
  const seen = new Set<string>();

  lines.forEach(l => {
    if (!l) return;
    const dedupeKey = l.toLowerCase();
    if (seen.has(dedupeKey)) return; // dedupe identical lines
    seen.add(dedupeKey);
    const lower = dedupeKey;
    if (cfg.deadlinePattern.test(l) && deadlines.length < cfg.maxDeadlines) deadlines.push(l);
    if (cfg.actionPattern.test(lower) && actions.length < cfg.maxActions) actions.push(l);
    const terms = l.match(new RegExp(cfg.termPattern, 'ig'));
    if (terms) terms.forEach(t => { if (keyTermsSet.size < cfg.maxKeyTerms) keyTermsSet.add(t.toLowerCase()); });
    if (summaryLines.length < cfg.maxSummaryLines) summaryLines.push(l);
  });

  return {
    summary: summaryLines.join(' '),
    keyTerms: Array.from(keyTermsSet),
    deadlines,
    actions,
  };
}
