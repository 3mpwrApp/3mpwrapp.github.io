export type BodyAdvice = { suggestions: string[] };

// React Native FormData accepts a file object with uri, name, type
interface RNFormDataFile {
  uri: string;
  name: string;
  type: string;
}

export async function analyzeBodyVideo(uri: string, name = 'video.mp4'): Promise<BodyAdvice | null> {
  const base = process.env.EXPO_PUBLIC_LLM_BASE;
  if (!base) return null;
  try {
    const fd = new FormData();
    const file: RNFormDataFile = { uri, name, type: 'video/mp4' };
    // React Native FormData accepts RNFormDataFile objects
    fd.append('file', file as any);
    const res = await fetch(`${base.replace(/\/$/, '')}/analyze-body`, {
      method: 'POST',
      body: fd as any,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as BodyAdvice;
  } catch {
    return null;
  }
}

