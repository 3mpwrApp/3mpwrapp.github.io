import { colors } from '../theme/colors';
import { checkPaletteContrast, getContrastRatio, suggestContrastFix } from '../utils/contrastChecker';

// High contrast palettes from usePalette.ts
const highContrastLight = {
  primary: "#000000", // Pure black for maximum contrast
  background: "#FFFFFF",
  text: "#000000",
  muted: "#000000", // Pure black for maximum contrast
  onPrimary: "#FFFFFF",
  surface: "#FFFFFF",
  card: "#F0F0F0",
  error: "#8B0000", // Very dark red for maximum contrast
  success: "#004D00", // Very dark green for maximum contrast
  warning: "#8B4513", // Dark brown for warning
};

const highContrastDark = {
  primary: "#FFFFFF", // Pure white for maximum contrast
  background: "#000000",
  text: "#FFFFFF",
  muted: "#FFFFFF", // Pure white for maximum contrast
  onPrimary: "#000000",
  surface: "#0A0A0A",
  card: "#1A1A1A",
  error: "#FF0000", // Bright red for dark theme
  success: "#00FF00", // Bright green for dark theme
  warning: "#FFFF00", // Bright yellow for dark theme
};

describe('Color Contrast Testing - WCAG 2.1 AAA Compliance', () => {
  it('should test light theme contrast ratios', () => {
    console.log('\n=== LIGHT THEME CONTRAST ANALYSIS ===');
    const result = checkPaletteContrast(colors.light);
    
    console.log(`\nSummary for Light Theme:`);
    console.log(`Total combinations tested: ${result.summary.totalCombinations}`);
    console.log(`AAA compliant: ${result.summary.aaaCompliant}`);
    console.log(`AA compliant: ${result.summary.aaCompliant}`);
    console.log(`Failing: ${result.summary.failing}`);
    
    console.log('\nDetailed Results:');
    result.combinations.forEach(combo => {
      console.log(`${combo.foreground} on ${combo.background}`);
      console.log(`  Ratio: ${combo.ratio}:1`);
      console.log(`  Normal text: ${combo.normalText.level}`);
      console.log(`  Large text: ${combo.largeText.level}`);
      
      if (!combo.normalText.wcagAAA) {
        const suggestion = suggestContrastFix(
          combo.foreground.split(' ')[1].replace(/[()]/g, ''),
          combo.background.split(' ')[1].replace(/[()]/g, ''),
          'AAA',
          'normal'
        );
        console.log(`  Suggestion: ${suggestion.suggestion}`);
      }
      console.log('');
    });
    
    // For accessibility-first approach, we want 100% AAA compliance for normal text
    expect(result.summary.failing).toBe(0);
  });

  it('should test dark theme contrast ratios', () => {
    console.log('\n=== DARK THEME CONTRAST ANALYSIS ===');
    const result = checkPaletteContrast(colors.dark);
    
    console.log(`\nSummary for Dark Theme:`);
    console.log(`Total combinations tested: ${result.summary.totalCombinations}`);
    console.log(`AAA compliant: ${result.summary.aaaCompliant}`);
    console.log(`AA compliant: ${result.summary.aaCompliant}`);
    console.log(`Failing: ${result.summary.failing}`);
    
    console.log('\nDetailed Results:');
    result.combinations.forEach(combo => {
      console.log(`${combo.foreground} on ${combo.background}`);
      console.log(`  Ratio: ${combo.ratio}:1`);
      console.log(`  Normal text: ${combo.normalText.level}`);
      console.log(`  Large text: ${combo.largeText.level}`);
      
      if (!combo.normalText.wcagAAA) {
        const suggestion = suggestContrastFix(
          combo.foreground.split(' ')[1].replace(/[()]/g, ''),
          combo.background.split(' ')[1].replace(/[()]/g, ''),
          'AAA',
          'normal'
        );
        console.log(`  Suggestion: ${suggestion.suggestion}`);
      }
      console.log('');
    });
    
    expect(result.summary.failing).toBe(0);
  });

  it('should test high contrast light theme', () => {
    console.log('\n=== HIGH CONTRAST LIGHT THEME ANALYSIS ===');
    const result = checkPaletteContrast(highContrastLight);
    
    console.log(`\nSummary for High Contrast Light Theme:`);
    console.log(`Total combinations tested: ${result.summary.totalCombinations}`);
    console.log(`AAA compliant: ${result.summary.aaaCompliant}`);
    console.log(`AA compliant: ${result.summary.aaCompliant}`);
    console.log(`Failing: ${result.summary.failing}`);
    
    // High contrast themes should have 100% AAA compliance
    expect(result.summary.failing).toBe(0);
    expect(result.summary.aaaCompliant).toBeGreaterThan(0);
  });

  it('should test high contrast dark theme', () => {
    console.log('\n=== HIGH CONTRAST DARK THEME ANALYSIS ===');
    const result = checkPaletteContrast(highContrastDark);
    
    console.log(`\nSummary for High Contrast Dark Theme:`);
    console.log(`Total combinations tested: ${result.summary.totalCombinations}`);
    console.log(`AAA compliant: ${result.summary.aaaCompliant}`);
    console.log(`AA compliant: ${result.summary.aaCompliant}`);
    console.log(`Failing: ${result.summary.failing}`);
    
    expect(result.summary.failing).toBe(0);
    expect(result.summary.aaaCompliant).toBeGreaterThan(0);
  });

  it('should provide specific contrast ratio calculations', () => {
    // Test some key combinations that must meet AAA standards
    const keyTests = [
      { fg: colors.light.text, bg: colors.light.background, name: 'Light theme text/background' },
      { fg: colors.light.onPrimary, bg: colors.light.primary, name: 'Light theme primary button' },
      { fg: colors.dark.text, bg: colors.dark.background, name: 'Dark theme text/background' },
      { fg: colors.dark.onPrimary, bg: colors.dark.primary, name: 'Dark theme primary button' },
    ];
    
    console.log('\n=== KEY CONTRAST RATIOS ===');
    keyTests.forEach(test => {
      const ratio = getContrastRatio(test.fg, test.bg);
      console.log(`${test.name}: ${ratio.toFixed(2)}:1`);
      
      // All key combinations must meet AAA standard (7:1 for normal text)
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });
  });

  it('should suggest fixes for failing combinations', () => {
    // Test the suggestion system with a known failing combination
    const testColor1 = '#777777'; // Medium gray
    const testColor2 = '#888888'; // Slightly different gray
    
    const suggestion = suggestContrastFix(testColor1, testColor2, 'AAA', 'normal');
    
    console.log('\n=== CONTRAST FIX SUGGESTIONS ===');
    console.log(`Test combination: ${testColor1} on ${testColor2}`);
    console.log(`Current ratio: ${suggestion.currentRatio}:1`);
    console.log(`Target ratio: ${suggestion.targetRatio}:1`);
    console.log(`Suggestion: ${suggestion.suggestion}`);
    
    expect(suggestion.currentRatio).toBeLessThan(7.0);
    expect(suggestion.suggestion).toContain('Consider');
  });
});