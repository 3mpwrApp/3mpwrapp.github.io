let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

import type { WhatsNewItem } from "../data/whatsnew";
import type { Faq } from "../data/faqs";

const KEY_WHATS_NEW = "local:whatsnew:v1";
const KEY_FAQS = "local:faqs:v1";

export async function getLocalWhatsNew(): Promise<WhatsNewItem[]> {
  if (!AsyncStorage) return [];
  try {
    const raw = await AsyncStorage.getItem(KEY_WHATS_NEW);
    return raw ? (JSON.parse(raw) as WhatsNewItem[]) : [];
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

