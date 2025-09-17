export type BodyAdvice = { suggestions: string[] };

export async function analyzeBodyVideo(uri: string, name = 'video.mp4'): Promise<BodyAdvice | null> {
  const base = process.env.EXPO_PUBLIC_LLM_BASE;
  if (!base) return null;
  try {
    const fd = new FormData();
    const file: any = { uri, name, type: 'video/mp4' };
    // @ts-ignore React Native FormData
    fd.append('file', file);
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

