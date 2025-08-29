// Minimal fetch wrappers with graceful fallback for local mock data.
export type Fetcher<T> = () => Promise<T>;

export async function retry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 400): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastErr;
}

export function withFallback<T>(remote: Fetcher<T>, fallback: () => T | Promise<T>): Fetcher<T> {
  return async () => {
    try {
      return await remote();
    } catch {
      return await fallback();
    }
  };
}
