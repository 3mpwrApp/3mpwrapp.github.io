/**
 * Dyslexia Support Constants
 * 
 * Configurations for users with dyslexia, reading disabilities,
 * and visual processing differences.
 * 
 * Based on:
 * - British Dyslexia Association Style Guide
 * - Dyslexia Action guidelines
 * - OpenDyslexic font research
 * - W3C Cognitive Accessibility Guidelines
 * 
 * Estimated Impact: 10-20% of population (dyslexia), 15% adoption rate
 */

// ============================================================================
// Dyslexia Fonts
// ============================================================================

export const DYSLEXIA_FONTS = {
  openDyslexic: {
    name: 'OpenDyslexic',
    family: 'OpenDyslexic',
    description: 'Weighted bottoms prevent letter flipping',
    url: 'https://opendyslexic.org/',
    recommended: true,
  },
  lexend: {
    name: 'Lexend',
    family: 'Lexend',
    description: 'Google font optimized for readability',
    url: 'https://www.lexend.com/',
    recommended: true,
  },
  comicSans: {
    name: 'Comic Sans',
    family: 'Comic Sans MS',
    description: 'Sans-serif with distinct letters',
    url: null,
    recommended: false,
  },
  arial: {
    name: 'Arial',
    family: 'Arial',
    description: 'Clean sans-serif font',
    url: null,
    recommended: false,
  },
  system: {
    name: 'System Default',
    family: 'System',
    description: 'Your device\'s default font',
    url: null,
    recommended: false,
  },
} as const;

export type DyslexiaFontKey = keyof typeof DYSLEXIA_FONTS;

// ============================================================================
// Letter Spacing
// ============================================================================

export const LETTER_SPACING = {
  normal: {
    name: 'Normal',
    value: 0,
    description: 'Standard letter spacing',
  },
  comfortable: {
    name: 'Comfortable',
    value: 0.05, // em
    description: 'Slightly increased spacing (recommended)',
    recommended: true,
  },
  wide: {
    name: 'Wide',
    value: 0.12, // em
    description: 'Wide letter spacing for easier reading',
  },
  extraWide: {
    name: 'Extra Wide',
    value: 0.2, // em
    description: 'Maximum letter spacing',
  },
} as const;

export type LetterSpacingKey = keyof typeof LETTER_SPACING;

// ============================================================================
// Line Height
// ============================================================================

export const LINE_HEIGHT = {
  normal: {
    name: 'Normal',
    value: 1.2,
    description: 'Standard line height',
  },
  comfortable: {
    name: 'Comfortable',
    value: 1.5,
    description: 'Recommended line height for dyslexia',
    recommended: true,
  },
  spacious: {
    name: 'Spacious',
    value: 1.8,
    description: 'Extra line spacing',
  },
  verySpacious: {
    name: 'Very Spacious',
    value: 2.0,
    description: 'Maximum line spacing',
  },
} as const;

export type LineHeightKey = keyof typeof LINE_HEIGHT;

// ============================================================================
// Word Spacing
// ============================================================================

export const WORD_SPACING = {
  normal: {
    name: 'Normal',
    value: 0,
    description: 'Standard word spacing',
  },
  comfortable: {
    name: 'Comfortable',
    value: 0.16, // em
    description: 'Slightly increased word spacing',
    recommended: true,
  },
  wide: {
    name: 'Wide',
    value: 0.32, // em
    description: 'Wide word spacing',
  },
} as const;

export type WordSpacingKey = keyof typeof WORD_SPACING;

// ============================================================================
// Colored Overlays (Irlen Syndrome)
// ============================================================================

export const COLORED_OVERLAYS = {
  none: {
    name: 'None',
    color: null,
    opacity: 0,
    description: 'No colored overlay',
  },
  cream: {
    name: 'Cream',
    color: '#FFF8DC',
    opacity: 0.5,
    description: 'Soft cream tint reduces glare',
  },
  aqua: {
    name: 'Aqua',
    color: '#00CED1',
    opacity: 0.2,
    description: 'Light aqua reduces visual stress',
  },
  rose: {
    name: 'Rose',
    color: '#FFB6C1',
    opacity: 0.3,
    description: 'Rose tint for visual comfort',
  },
  peach: {
    name: 'Peach',
    color: '#FFDAB9',
    opacity: 0.4,
    description: 'Warm peach overlay',
  },
  yellow: {
    name: 'Yellow',
    color: '#FFFF99',
    opacity: 0.3,
    description: 'Soft yellow reduces glare',
  },
  blue: {
    name: 'Blue',
    color: '#87CEEB',
    opacity: 0.25,
    description: 'Sky blue calming overlay',
  },
  green: {
    name: 'Green',
    color: '#90EE90',
    opacity: 0.3,
    description: 'Light green reduces eye strain',
  },
} as const;

export type ColoredOverlayKey = keyof typeof COLORED_OVERLAYS;

// ============================================================================
// Text Color Contrast
// ============================================================================

export const TEXT_CONTRAST = {
  blackOnWhite: {
    name: 'Black on White',
    text: '#000000',
    background: '#FFFFFF',
    description: 'Standard high contrast',
  },
  darkGrayOnCream: {
    name: 'Dark Gray on Cream',
    text: '#333333',
    background: '#FFFEF0',
    description: 'Softer contrast, reduces glare (recommended)',
    recommended: true,
  },
  blackOnYellow: {
    name: 'Black on Yellow',
    text: '#000000',
    background: '#FFFF99',
    description: 'High visibility for dyslexia',
  },
  whiteOnDarkGray: {
    name: 'White on Dark Gray',
    text: '#FFFFFF',
    background: '#2C2C2C',
    description: 'Dark mode for light sensitivity',
  },
  creamOnBlack: {
    name: 'Cream on Black',
    text: '#FFF8DC',
    background: '#000000',
    description: 'Soft dark mode',
  },
} as const;

export type TextContrastKey = keyof typeof TEXT_CONTRAST;

// ============================================================================
// Reading Ruler Settings
// ============================================================================

export const READING_RULER = {
  none: {
    name: 'Off',
    enabled: false,
    height: 0,
    color: null,
  },
  singleLine: {
    name: 'Single Line',
    enabled: true,
    height: 1.5, // em
    color: 'rgba(255, 255, 0, 0.2)', // Light yellow highlight
    description: 'Highlights current line',
  },
  tripleLine: {
    name: 'Triple Line',
    enabled: true,
    height: 4.5, // em (3 lines)
    color: 'rgba(135, 206, 250, 0.15)', // Light blue
    description: 'Highlights current + adjacent lines',
  },
} as const;

export type ReadingRulerKey = keyof typeof READING_RULER;

// ============================================================================
// Dyslexia Preferences Interface
// ============================================================================

export interface DyslexiaPreferences {
  // Font
  font: DyslexiaFontKey;
  fontSize: number; // percentage (100 = normal, 150 = 150%)
  
  // Spacing
  letterSpacing: LetterSpacingKey;
  wordSpacing: WordSpacingKey;
  lineHeight: LineHeightKey;
  
  // Visual
  coloredOverlay: ColoredOverlayKey;
  textContrast: TextContrastKey;
  readingRuler: ReadingRulerKey;
  
  // Advanced
  syllableBreaks: boolean; // Show hyphenation
  wordHighlighting: boolean; // Tap to highlight words
  autoScrolling: boolean; // Slow auto-scroll mode
  autoScrollSpeed: number; // words per minute
}

// ============================================================================
// Default Preferences
// ============================================================================

export const DEFAULT_DYSLEXIA_PREFERENCES: DyslexiaPreferences = {
  font: 'system',
  fontSize: 100,
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  lineHeight: 'normal',
  coloredOverlay: 'none',
  textContrast: 'blackOnWhite',
  readingRuler: 'none',
  syllableBreaks: false,
  wordHighlighting: false,
  autoScrolling: false,
  autoScrollSpeed: 200, // wpm
};

// ============================================================================
// Preset Configurations
// ============================================================================

export const DYSLEXIA_PRESETS = {
  standard: {
    name: 'Standard',
    description: 'No dyslexia-specific adjustments',
    preferences: DEFAULT_DYSLEXIA_PREFERENCES,
  },
  recommended: {
    name: 'Recommended for Dyslexia',
    description: 'British Dyslexia Association guidelines',
    preferences: {
      font: 'openDyslexic',
      fontSize: 120,
      letterSpacing: 'comfortable',
      wordSpacing: 'comfortable',
      lineHeight: 'comfortable',
      coloredOverlay: 'cream',
      textContrast: 'darkGrayOnCream',
      readingRuler: 'singleLine',
      syllableBreaks: false,
      wordHighlighting: true,
      autoScrolling: false,
      autoScrollSpeed: 200,
    } as DyslexiaPreferences,
  },
  highContrast: {
    name: 'High Contrast',
    description: 'Maximum visibility for severe dyslexia',
    preferences: {
      font: 'openDyslexic',
      fontSize: 140,
      letterSpacing: 'wide',
      wordSpacing: 'wide',
      lineHeight: 'spacious',
      coloredOverlay: 'yellow',
      textContrast: 'blackOnYellow',
      readingRuler: 'tripleLine',
      syllableBreaks: true,
      wordHighlighting: true,
      autoScrolling: false,
      autoScrollSpeed: 150,
    } as DyslexiaPreferences,
  },
  darkMode: {
    name: 'Dark Mode Dyslexia',
    description: 'For light-sensitive readers',
    preferences: {
      font: 'lexend',
      fontSize: 120,
      letterSpacing: 'comfortable',
      wordSpacing: 'comfortable',
      lineHeight: 'comfortable',
      coloredOverlay: 'none',
      textContrast: 'creamOnBlack',
      readingRuler: 'singleLine',
      syllableBreaks: false,
      wordHighlighting: true,
      autoScrolling: false,
      autoScrollSpeed: 200,
    } as DyslexiaPreferences,
  },
} as const;

export type DyslexiaPresetKey = keyof typeof DYSLEXIA_PRESETS;

// ============================================================================
// Feature Flags
// ============================================================================

export const DYSLEXIA_FEATURES = {
  OPEN_DYSLEXIC_FONT: true, // Download and use OpenDyslexic
  LEXEND_FONT: true, // Use Google Lexend font
  SYLLABLE_BREAKS: false, // Experimental: hyphenation
  AUTO_SCROLLING: false, // Experimental: auto-scroll text
  WORD_HIGHLIGHTING: true, // Tap to highlight individual words
  READING_RULER: true, // Highlight current line
  COLORED_OVERLAYS: true, // Irlen syndrome support
};

// ============================================================================
// Storage Keys
// ============================================================================

export const DYSLEXIA_STORAGE_KEYS = {
  PREFERENCES: 'dyslexia:preferences:v1',
  PRESET: 'dyslexia:preset:v1',
  FIRST_TIME: 'dyslexia:firstTime:v1',
} as const;
