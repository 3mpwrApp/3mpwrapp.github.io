// Minimal fetch wrappers with graceful fallback for local mock data.
export type Fetcher<T> = () => Promise<T>;

export function withFallback<T>(remote: Fetcher<T>, fallback: () => T | Promise<T>): Fetcher<T> {
  return async () => {
    try {
      return await remote();
    } catch {
      return await fallback();
    }
  };
}
