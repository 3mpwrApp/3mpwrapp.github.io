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
    return Array.isArray(items) ? (items as WhatsNewItem[]) : [];
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
