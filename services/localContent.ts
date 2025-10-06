import type { Faq } from "../data/faqs";
import type { Research } from "../data/research";
import type { WhatsNewItem } from "../data/whatsnew";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

const KEY_WHATS_NEW = "local:whatsnew:v2"; // v2 adds archived flag support
const KEY_WHATS_NEW_V1 = "local:whatsnew:v1";
const KEY_FAQS = "local:faqs:v1";
const KEY_RESEARCH = "local:research:v1";

export async function getLocalWhatsNew(): Promise<WhatsNewItem[]> {
  if (!AsyncStorage) return [];
  try {
    let raw = await AsyncStorage.getItem(KEY_WHATS_NEW);
    if (!raw) {
      // Migrate from v1 if present
      const legacy = await AsyncStorage.getItem(KEY_WHATS_NEW_V1);
      if (legacy) {
        await AsyncStorage.setItem(KEY_WHATS_NEW, legacy);
        try { await AsyncStorage.removeItem(KEY_WHATS_NEW_V1); } catch {}
        raw = legacy;
      }
    }
    const items: any[] = raw ? JSON.parse(raw) : [];
    let parsed: WhatsNewItem[] = Array.isArray(items) ? (items as WhatsNewItem[]) : [];
    // Auto-archive items older than 30 days (idempotent)
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    let changed = false;
    parsed = parsed.map((i) => {
      try {
        const age = now - new Date(i.date).getTime();
        if (age > THIRTY_DAYS && !i.archived) {
          changed = true;
          return { ...i, archived: true };
        }
      } catch {}
      return i as WhatsNewItem;
    });
    if (changed) {
      try { await AsyncStorage.setItem(KEY_WHATS_NEW, JSON.stringify(parsed)); } catch {}
    }
    return parsed;
  } catch {
    return [];
  }
}

export async function addLocalWhatsNew(item: WhatsNewItem): Promise<void> {
  if (!AsyncStorage) return;
  const cur = await getLocalWhatsNew();
  const next = [item, ...cur];
  await AsyncStorage.setItem(KEY_WHATS_NEW, JSON.stringify(next));
}

export async function setLocalWhatsNew(items: WhatsNewItem[]): Promise<void> {
  if (!AsyncStorage) return;
  await AsyncStorage.setItem(KEY_WHATS_NEW, JSON.stringify(items));
}

export async function getWhatsNewSplit(): Promise<{ current: WhatsNewItem[]; archived: WhatsNewItem[] }>{
  const local = await getLocalWhatsNew();
  // Combine with defaults and re-apply age archival at read time
  let defaults: WhatsNewItem[] = [];
  let autos: WhatsNewItem[] = [];
  try {
    const mod = await import('../data/whatsnew');
    defaults = mod.whatsnew || [];
  } catch {}
  try {
    // Optional auto-generated items from CHANGELOG via script
    const mod2 = await import('../data/whatsnew.auto.json');
    autos = Array.isArray(mod2?.default) ? (mod2.default as WhatsNewItem[]) : [];
  } catch {}
  const all = [...local, ...defaults, ...autos];
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const withArchive = all.map((i) => {
    const age = now - new Date(i.date).getTime();
    return age > THIRTY_DAYS ? { ...i, archived: true } : { ...i, archived: i.archived || false };
  });
  const current = withArchive.filter((i) => !i.archived);
  const archived = withArchive.filter((i) => i.archived);
  return { current, archived };
}

export async function getLocalFaqs(): Promise<Faq[]> {
  if (!AsyncStorage) return [];
  try {
    const raw = await AsyncStorage.getItem(KEY_FAQS);
    return raw ? (JSON.parse(raw) as Faq[]) : [];
  } catch {
    return [];
  }
}

export async function addLocalFaq(item: Faq): Promise<void> {
  if (!AsyncStorage) return;
  const cur = await getLocalFaqs();
  const next = [item, ...cur];
  await AsyncStorage.setItem(KEY_FAQS, JSON.stringify(next));
}

export async function getLocalResearch(): Promise<Research[]> {
  if (!AsyncStorage) return [];
  try {
    const raw = await AsyncStorage.getItem(KEY_RESEARCH);
    return raw ? (JSON.parse(raw) as Research[]) : [];
  } catch {
    return [];
  }
}

export async function addLocalResearch(item: Research): Promise<void> {
  if (!AsyncStorage) return;
  const cur = await getLocalResearch();
  const next = [item, ...cur];
  await AsyncStorage.setItem(KEY_RESEARCH, JSON.stringify(next));
}
