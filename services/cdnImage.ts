import { Platform } from 'react-native';

interface CDNImageOptions {
  width?: number;
  height?: number;
  format?: 'webp' | 'jpg';
  quality?: number;
}

interface CDNCacheEntry {
  url: string;
  timestamp: number;
  ttl: number;
}

const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE || 'https://cdn.empowrapp.com';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const cache: Map<string, CDNCacheEntry> = new Map();

/**
 * Generates an optimized CDN URL with caching and fallback support
 */
export function loadImageFromCDN(
  id: string,
  options?: CDNImageOptions
): string {
  const cacheKey = `cdn:${id}:${JSON.stringify(options || {})}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.url;
  }

  const url = buildCDNUrl(id, options);

  // Cache the URL
  cache.set(cacheKey, {
    url,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  });

  return url;
}

/**
 * Builds optimized CDN URL with query parameters
 */
function buildCDNUrl(id: string, options?: CDNImageOptions): string {
  const params = new URLSearchParams();

  if (options?.width) {
    params.append('w', options.width.toString());
  }

  if (options?.height) {
    params.append('h', options.height.toString());
  }

  // Default to webp for web, jpg for native for smaller size
  const format = options?.format || (Platform.OS === 'web' ? 'webp' : 'jpg');
  params.append('f', format);

  // Quality setting
  const quality = options?.quality || 80;
  params.append('q', quality.toString());

  // Add auto optimization
  params.append('auto', 'format');

  const queryString = params.toString();
  return `${CDN_BASE_URL}/images/${id}${queryString ? '?' + queryString : ''}`;
}

/**
 * Generates srcset for responsive images (web only)
 */
export function generateSrcSet(id: string, baseWidth: number): string {
  if (Platform.OS !== 'web') {
    return loadImageFromCDN(id, { width: baseWidth });
  }

  const sizes = [baseWidth, baseWidth * 1.5, baseWidth * 2];
  return sizes
    .map(
      size =>
        `${loadImageFromCDN(id, { width: Math.round(size) })} ${Math.round(size)}w`
    )
    .join(', ');
}

/**
 * Preload image from CDN for faster display
 */
export async function preloadCDNImage(id: string, options?: CDNImageOptions): Promise<void> {
  const url = loadImageFromCDN(id, options);

  try {
    if (Platform.OS === 'web') {
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Image load timeout')), 5000);
      });
    } else {
      // React Native: use Image module
      const { Image: RNImage } = await import('react-native');
      await new Promise((resolve, reject) => {
        RNImage.getSize(
          url,
          () => resolve(undefined),
          () => reject(new Error('Image load failed'))
        );
      });
    }
  } catch (error) {
    console.warn(`Failed to preload image ${id}:`, error);
  }
}

/**
 * Get fallback local asset URL
 */
export function getFallbackAsset(id: string): string {
  // Map known IDs to local assets
  const localAssetMap: Record<string, any> = {
    logo: require('../assets/images/logo.png'),
    icon: require('../assets/images/icon.png'),
    // Add more mappings as needed
  };

  return localAssetMap[id] || require('../assets/images/placeholder.png');
}

/**
 * Clear cache for specific image or all images
 */
export function clearCDNCache(id?: string): void {
  if (id) {
    const keysToDelete: string[] = [];
    for (const key of cache.keys()) {
      if (key.includes(id)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  } else {
    cache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: number } {
  return {
    size: cache.size,
    entries: cache.size,
  };
}
