/**
 * Color contrast checking utility for WCAG 2.1 AAA compliance
 * AAA requires 7:1 for normal text, 4.5:1 for large text (18pt+ or 14pt+ bold)
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error(`Invalid color format: ${color1} or ${color2}`);
  }
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function checkContrastCompliance(ratio: number, textSize: 'normal' | 'large' = 'normal'): {
  wcagAA: boolean;
  wcagAAA: boolean;
  level: 'Pass AAA' | 'Pass AA' | 'Fail';
} {
  const aaThreshold = textSize === 'large' ? 3.0 : 4.5;
  const aaaThreshold = textSize === 'large' ? 4.5 : 7.0;
  
  const wcagAA = ratio >= aaThreshold;
  const wcagAAA = ratio >= aaaThreshold;
  
  let level: 'Pass AAA' | 'Pass AA' | 'Fail';
  if (wcagAAA) {
    level = 'Pass AAA';
  } else if (wcagAA) {
    level = 'Pass AA';
  } else {
    level = 'Fail';
  }
  
  return { wcagAA, wcagAAA, level };
}

/**
 * Check all color combinations in a palette for WCAG compliance
 */
export function checkPaletteContrast(palette: Record<string, string>): {
  combinations: Array<{
    foreground: string;
    background: string;
    ratio: number;
    normalText: { wcagAA: boolean; wcagAAA: boolean; level: string };
    largeText: { wcagAA: boolean; wcagAAA: boolean; level: string };
  }>;
  summary: {
    totalCombinations: number;
    aaaCompliant: number;
    aaCompliant: number;
    failing: number;
  };
} {
  const combinations: any[] = [];
  
  // Common text/background combinations to test (realistic UI patterns)
  const testCombinations = [
    ['text', 'background'],
    ['text', 'surface'],
    ['text', 'card'],
    ['onPrimary', 'primary'], // Primary buttons
    ['muted', 'background'],
    ['muted', 'surface'],
    ['muted', 'card'],
    ['background', 'primary'], // For inverted elements like badges
    ['error', 'background'],
    ['success', 'background'],
    ['warning', 'background'],
    // Note: 'text' on 'primary' is intentionally excluded as it represents 
    // poor UX (dark text on dark background in light theme, white text on bright cyan in dark theme)
  ];
  
  for (const [fg, bg] of testCombinations) {
    if (palette[fg] && palette[bg]) {
      try {
        const ratio = getContrastRatio(palette[fg], palette[bg]);
        const normalText = checkContrastCompliance(ratio, 'normal');
        const largeText = checkContrastCompliance(ratio, 'large');
        
        combinations.push({
          foreground: `${fg} (${palette[fg]})`,
          background: `${bg} (${palette[bg]})`,
          ratio: Math.round(ratio * 100) / 100,
          normalText,
          largeText,
        });
      } catch (error) {
        logger.warn(`Failed to check contrast for ${fg}/${bg}:`, error);
      }
    }
  }
  
  // Calculate summary
  const aaaCompliant = combinations.filter(c => c.normalText.wcagAAA).length;
  const aaCompliant = combinations.filter(c => c.normalText.wcagAA && !c.normalText.wcagAAA).length;
  const failing = combinations.filter(c => !c.normalText.wcagAA).length;
  
  return {
    combinations,
    summary: {
      totalCombinations: combinations.length,
      aaaCompliant,
      aaCompliant,
      failing,
    },
  };
}

/**
 * Generate accessibility-compliant color suggestions
 */
export function suggestContrastFix(
  foreground: string,
  background: string,
  targetLevel: 'AA' | 'AAA' = 'AAA',
  textSize: 'normal' | 'large' = 'normal'
): {
  currentRatio: number;
  targetRatio: number;
  suggestion: string;
} {
  const currentRatio = getContrastRatio(foreground, background);
  const targetRatio = targetLevel === 'AAA' 
    ? (textSize === 'large' ? 4.5 : 7.0)
    : (textSize === 'large' ? 3.0 : 4.5);
  
  let suggestion = '';
  if (currentRatio < targetRatio) {
    const bgRgb = hexToRgb(background);
    const fgRgb = hexToRgb(foreground);
    
    if (!bgRgb || !fgRgb) {
      suggestion = 'Invalid color format provided';
    } else {
      const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
      const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
      
      if (fgLum > bgLum) {
        suggestion = 'Consider making the text darker or the background lighter';
      } else {
        suggestion = 'Consider making the text lighter or the background darker';
      }
    }
  } else {
    suggestion = 'Contrast ratio already meets requirements';
  }
  
  return {
    currentRatio: Math.round(currentRatio * 100) / 100,
    targetRatio,
    suggestion,
  };
}
