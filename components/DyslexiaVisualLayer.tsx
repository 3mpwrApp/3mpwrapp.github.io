/**
 * DyslexiaVisualLayer
 * 
 * Renders visual dyslexia aids:
 * - Colored overlay (tint over entire screen for Irlen syndrome)
 * - Reading ruler (highlight bar that follows user's reading position)
 * 
 * Positioned absolutely to cover the app without blocking interactions.
 */

import { StyleSheet, View } from 'react-native';

import { COLORED_OVERLAYS, READING_RULER } from '../constants/dyslexia';
import { useDyslexiaOptional } from '../context/DyslexiaContext';

export function DyslexiaVisualLayer() {
  const dyslexia = useDyslexiaOptional();
  
  // If dyslexia context not available or no visual features enabled, render nothing
  if (!dyslexia) return null;
  
  const { preferences } = dyslexia;
  const overlay = COLORED_OVERLAYS[preferences.coloredOverlay];
  const ruler = READING_RULER[preferences.readingRuler];
  
  // Skip rendering if no overlay and no ruler
  if (!overlay.color && !ruler.enabled) {
    return null;
  }
  
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Colored Overlay */}
      {overlay.color && (
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: overlay.color,
              opacity: overlay.opacity,
            },
          ]}
        />
      )}
      
      {/* Reading Ruler - Placeholder for future implementation */}
      {ruler.enabled && (
        <View
          style={[
            styles.ruler,
            {
              backgroundColor: ruler.color || 'rgba(255, 255, 0, 0.2)',
              height: typeof ruler.height === 'number' ? ruler.height * 24 : 36, // em to pixels (rough)
            },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // Ensure overlay is on top
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ruler: {
    position: 'absolute',
    top: '40%', // Placeholder: center of screen; real impl would track scroll + focus
    left: 0,
    right: 0,
  },
});

export default DyslexiaVisualLayer;
