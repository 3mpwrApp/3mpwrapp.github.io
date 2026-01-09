import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { getFallbackAsset, loadImageFromCDN, preloadCDNImage } from '../services/cdnImage';

interface OptimizedImageProps {
  id?: string;
  source?: string | number;
  width?: number;
  height?: number;
  style?: any;
  contentFit?: 'contain' | 'cover' | 'fill' | 'scale-down';
  placeholder?: string;
  blurhash?: string;
  accessibilityLabel?: string;
  testID?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  lazy?: boolean;
  preload?: boolean;
  format?: 'webp' | 'jpg';
  quality?: number;
}

const DEFAULT_PLACEHOLDER = 'L4Fj0K~pOFRj.7t757R%0Koz_Nr5';
const PLACEHOLDER_COLOR = '#f0f0f0';

/**
 * OptimizedImage component wraps expo-image with CDN support,
 * automatic responsive sizing, lazy loading, and fallback handling
 */
export const OptimizedImage = React.memo(
  ({
    id,
    source,
    width,
    height,
    style,
    contentFit = 'cover',
    placeholder = DEFAULT_PLACEHOLDER,
    blurhash,
    accessibilityLabel,
    testID,
    onLoad,
    onError,
    lazy = true,
    preload = false,
    format,
    quality,
  }: OptimizedImageProps) => {
    const [isLoading, setIsLoading] = useState(lazy);
    const [error, setError] = useState<Error | null>(null);

    // Determine image source
    const imageSource = useMemo(() => {
      if (id) {
        return loadImageFromCDN(id, {
          width,
          height,
          format,
          quality,
        });
      }
      return source;
    }, [id, width, height, format, quality, source]);

    // Fallback source if primary fails
    const fallbackSource = useMemo(() => {
      if (id) {
        return getFallbackAsset(id);
      }
      return require('../assets/images/placeholder.png');
    }, [id]);

    // Preload image if requested
    useEffect(() => {
      if (preload && id) {
        preloadCDNImage(id, { width, height, format, quality }).catch(err => {
          console.warn('Image preload failed:', err);
        });
      }
    }, [id, preload, width, height, format, quality]);

    const handleLoad = () => {
      setIsLoading(false);
      setError(null);
      onLoad?.();
    };

    const handleError = (err: any) => {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    };

    // Calculate responsive dimensions
    const dimensions = useMemo(() => {
      return {
        width: width || 200,
        height: height || 200,
      };
    }, [width, height]);

    return (
      <View
        style={[
          styles.container,
          {
            width: dimensions.width,
            height: dimensions.height,
          },
          style,
        ]}
        testID={testID}
      >
        <ExpoImage
          source={error ? fallbackSource : imageSource}
          style={[
            styles.image,
            {
              width: dimensions.width,
              height: dimensions.height,
            },
          ]}
          contentFit={contentFit}
          placeholder={blurhash || placeholder}
          onLoad={handleLoad}
          onError={handleError}
          accessibilityLabel={accessibilityLabel}
          cachePolicy="memory-disk"
          recyclingKey={id ? `${id}-${width}-${height}` : undefined}
        />
        {isLoading && (
          <View
            style={[
              styles.loadingOverlay,
              {
                width: dimensions.width,
                height: dimensions.height,
              },
            ]}
            accessible={false}
          >
            <View style={styles.skeleton} />
          </View>
        )}
      </View>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: PLACEHOLDER_COLOR,
    overflow: 'hidden',
    borderRadius: 8,
  },
  image: {
    backgroundColor: PLACEHOLDER_COLOR,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: PLACEHOLDER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  skeleton: {
    width: '80%',
    height: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    opacity: 0.5,
  },
});
