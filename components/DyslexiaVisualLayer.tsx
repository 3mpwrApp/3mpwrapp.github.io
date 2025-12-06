/**
 * DyslexiaVisualLayer
 * 
 * Renders visual dyslexia aids:
 * - Colored overlay (tint over entire screen for Irlen syndrome)
 * - Reading ruler (interactive highlight bar that can be dragged to follow reading position)
 * 
 * Positioned absolutely to cover the app without blocking interactions (except ruler drag).
 */

import { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { COLORED_OVERLAYS, READING_RULER } from '../constants/Dyslexia';
import { useDyslexiaOptional } from '../context/DyslexiaContext';

export function DyslexiaVisualLayer() {
  const dyslexia = useDyslexiaOptional();
  const [rulerY, setRulerY] = useState(0.4); // Percentage (0-1) from top of screen
  
  // If dyslexia context not available or no visual features enabled, render nothing
  if (!dyslexia) return null;
  
  const { preferences } = dyslexia;
  const overlay = COLORED_OVERLAYS[preferences.coloredOverlay];
  const ruler = READING_RULER[preferences.readingRuler];
  
  // Skip rendering if no overlay and no ruler
  if (!overlay.color && !ruler.enabled) {
    return null;
  }

  const handleRulerDrag = (event: GestureResponderEvent) => {
    // Allow dragging ruler to reposition
    const { pageY } = event.nativeEvent;
    // Convert to percentage for responsive positioning
    if (pageY > 0) {
      const screenHeight = 800; // Fallback; ideally use Dimensions
      const newY = Math.max(0.1, Math.min(0.9, pageY / screenHeight));
      setRulerY(newY);
    }
  };
  
  return (
    <View style={[styles.container, { pointerEvents: 'box-none' }]} collapsable={false}>
      {/* Colored Overlay */}
      {overlay.color && (
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: overlay.color,
              opacity: overlay.opacity,
              pointerEvents: 'none',
            },
          ]}
        />
      )}
      
      {/* Reading Ruler - Interactive */}
      {ruler.enabled && (
        <Pressable
          accessibilityRole="button"
          onPress={handleRulerDrag}
          onPressIn={handleRulerDrag}
          hitSlop={HIT_SLOP_8}
          style={[
            styles.ruler,
            {
              backgroundColor: ruler.color || 'rgba(255, 255, 0, 0.2)',
              height: typeof ruler.height === 'number' ? ruler.height * 24 : 36, // em to pixels (rough)
              top: `${rulerY * 100}%`,
            },
          ]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
          accessibilityLabel="Reading ruler - drag to reposition"
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
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255, 255, 0, 0.6)',
  },
});

export default DyslexiaVisualLayer;
