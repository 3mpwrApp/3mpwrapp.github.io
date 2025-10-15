/**
 * Centralized network utility with timeout, retry logic, and error handling
 * Use this instead of raw fetch() for all API calls
 */

export interface FetchOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds (default: 10000)
  retries?: number; // Number of retry attempts (default: 2)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
  retryOn?: number[]; // HTTP status codes to retry on (default: [408, 429, 500, 502, 503, 504])
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isTimeout: boolean = false,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Enhanced fetch with timeout, retry, and better error handling
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 10000,
    retries = 2,
    retryDelay = 1000,
    retryOn = [408, 429, 500, 502, 503, 504],
    ...fetchOptions
  } = options;

  let lastError: NetworkError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if we should retry based on status code
        if (!response.ok && retryOn.includes(response.status) && attempt < retries) {
          lastError = new NetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }

        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        lastError = new NetworkError('Request timeout', undefined, true);
      } else if (error.message === 'Network request failed' || error.message?.includes('fetch')) {
        lastError = new NetworkError('Network error - check your connection', undefined, false, true);
      } else {
        lastError = new NetworkError(error.message || 'Unknown error');
      }

      // Wait before retry
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  // All retries exhausted
  throw lastError || new NetworkError('Request failed after retries');
}

/**
 * Fetch JSON with automatic parsing and type safety
 */
export async function fetchJSON<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new NetworkError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new NetworkError('Invalid JSON response');
  }
}

/**
 * Helper to check if error is a network error
 */
export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError || error.name === 'NetworkError';
}

/**
 * Helper to get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    if (error.isTimeout) {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (error.isNetworkError) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          return 'Invalid request. Please try again.';
        case 401:
          return 'Authentication required. Please sign in.';
        case 403:
          return 'Access denied. You do not have permission.';
        case 404:
          return 'Resource not found.';
        case 429:
          return 'Too many requests. Please wait a moment.';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'Server error. Please try again later.';
        default:
          return `Error: ${error.message}`;
      }
    }
  }
  return error?.message || 'An unexpected error occurred';
}
