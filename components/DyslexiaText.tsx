/**
 * DyslexiaText Component
 * 
 * Enhanced Text wrapper that applies dyslexia-friendly styling:
 * - OpenDyslexic or Lexend font
 * - Custom letter/word/line spacing
 * - Colored overlays
 * - Word highlighting (tap individual words to highlight them)
 * 
 * Usage:
 *   <DyslexiaText>Your text here</DyslexiaText>
 *   <DyslexiaText style={{fontSize: 16}}>Custom styled</DyslexiaText>
 */

import React, { useState } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import {
    DYSLEXIA_FONTS,
    LETTER_SPACING,
    LINE_HEIGHT,
    TEXT_CONTRAST
} from '../constants/Dyslexia';
import { useDyslexiaOptional } from '../context/DyslexiaContext';

// ============================================================================
// DyslexiaText Component
// ============================================================================

export interface DyslexiaTextProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  disableDyslexiaFont?: boolean; // Opt-out for specific text (e.g., monospace code)
}

export function DyslexiaText({
  children,
  style,
  disableDyslexiaFont = false,
  ...props
}: DyslexiaTextProps) {
  const dyslexia = useDyslexiaOptional();
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // If dyslexia context not available or disabled, render normal Text
  if (!dyslexia || !dyslexia.isEnabled || disableDyslexiaFont) {
    return <Text style={style} {...props}>{children}</Text>;
  }

  const { preferences } = dyslexia;

  // Build dyslexia-friendly style
  const dyslexiaStyle: TextStyle = {};

  // Font family
  if (preferences.font !== 'system') {
    const font = DYSLEXIA_FONTS[preferences.font];
    dyslexiaStyle.fontFamily = font.family;
  }

  // Font size
  if (preferences.fontSize !== 100) {
    // Extract base font size from style prop
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
    const baseFontSize = (flatStyle.fontSize as number) || 16;
    dyslexiaStyle.fontSize = baseFontSize * (preferences.fontSize / 100);
  }

  // Letter spacing
  if (preferences.letterSpacing !== 'normal') {
    const spacing = LETTER_SPACING[preferences.letterSpacing];
    // Convert em to pixels (approximate)
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
    const baseFontSize = (flatStyle.fontSize as number) || dyslexiaStyle.fontSize || 16;
    dyslexiaStyle.letterSpacing = spacing.value * baseFontSize;
  }

  // Line height
  if (preferences.lineHeight !== 'normal') {
    const lineHeight = LINE_HEIGHT[preferences.lineHeight];
    dyslexiaStyle.lineHeight = lineHeight.value;
  }

  // Text color (from contrast preset)
  if (preferences.textContrast !== 'blackOnWhite') {
    const contrast = TEXT_CONTRAST[preferences.textContrast];
    dyslexiaStyle.color = contrast.text;
  }

  // Word highlighting feature
  if (preferences.wordHighlighting && typeof children === 'string') {
    const words = children.split(/(\s+)/); // Split but keep whitespace
    return (
      <Text style={[style, dyslexiaStyle]} {...props}>
        {words.map((word, idx) => {
          const isWhitespace = /^\s+$/.test(word);
          if (isWhitespace) return word;
          
          const isHighlighted = highlightedIndex === idx;
          return (
            <Text
              key={idx}
              onPress={() => setHighlightedIndex(isHighlighted ? null : idx)}
              style={isHighlighted ? { backgroundColor: 'rgba(255, 255, 0, 0.4)' } : undefined}
            >
              {word}
            </Text>
          );
        })}
      </Text>
    );
  }

  // Note: Word spacing not supported in React Native Text component
  // Note: Background color handled by container overlay

  return (
    <Text style={[style, dyslexiaStyle]} {...props}>
      {children}
    </Text>
  );
}

// ============================================================================
// Utility: Get Dyslexia Container Style
// ============================================================================

/**
 * Get background style for dyslexia container
 * (colored overlay + text contrast background)
 */
export function useDyslexiaContainerStyle(): { backgroundColor?: string } {
  const dyslexia = useDyslexiaOptional();
  
  if (!dyslexia || !dyslexia.isEnabled) {
    return {};
  }

  const { preferences } = dyslexia;

  // Text contrast background takes priority
  if (preferences.textContrast !== 'blackOnWhite') {
    const contrast = TEXT_CONTRAST[preferences.textContrast];
    return { backgroundColor: contrast.background };
  }

  return {};
}

// ============================================================================
// Export
// ============================================================================

export default DyslexiaText;
