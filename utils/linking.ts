import { Linking } from "react-native";

const ALLOWED_SCHEMES = ["http:", "https:", "mailto:", "tel:"] as const;
const ALLOWED_HOSTS = new Set([
  "www.facebook.com",
  "facebook.com",
  "www.instagram.com",
  "instagram.com",
  "x.com",
  "twitter.com",
]);

export async function openExternalUrl(url: string) {
  try {
    const u = new URL(url);
    if (!ALLOWED_SCHEMES.includes(u.protocol as any)) {
      throw new Error("Blocked unsupported scheme");
    }
    if (u.protocol === "http:" || u.protocol === "https:") {
      if (!ALLOWED_HOSTS.has(u.hostname)) {
        throw new Error("Blocked unsupported host");
      }
    }
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error("Cannot open URL");
    await Linking.openURL(url);
  } catch (e) {
    console.warn("openExternalUrl blocked:", url);
  }
}

