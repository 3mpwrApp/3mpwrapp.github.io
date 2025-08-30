import { Platform } from "react-native";

type ExpoResponse = {
  data?: { status: string; id?: string; message?: string } | { error: string; message?: string };
  errors?: any[];
};

export async function sendExpoPush(to: string, title: string, body: string) {
  // Can be called from device for testing; production should use a server.
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ to, sound: "default", title, body }),
    });
    const json = (await res.json()) as ExpoResponse;
    if (!res.ok || (json as any)?.errors) throw new Error(JSON.stringify(json));
    return json;
  } catch (e) {
    if (__DEV__) console.warn("sendExpoPush failed", e);
    throw e;
  }
}

