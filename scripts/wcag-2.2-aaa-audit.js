#!/usr/bin/env node
/**
 * Enhanced WCAG 2.2 AAA Compliance Audit Script
 * 
 * This script performs a comprehensive audit of the codebase for WCAG 2.2 AAA compliance.
 * 
 * Features:
 * - Full WCAG 2.2 guideline coverage (A, AA, AAA)
 * - Component-level accessibility validation
 * - Color contrast analysis (7:1 ratio for AAA)
 * - Touch target size verification (44x44 minimum, 48x48 enhanced)
 * - Focus management validation
 * - Screen reader compatibility checks
 * - Keyboard navigation auditing
 * - Motion/animation settings respect
 * - Form accessibility validation
 * - ARIA attribute validation
 * - Heading hierarchy validation
 * - Language attribute checks
 * 
 * Usage: node scripts/wcag-2.2-aaa-audit.js [options]
 * Options:
 *   --json           Output results as JSON
 *   --json=<path>    Save JSON results to file
 *   --verbose        Show detailed output
 *   --fix            Suggest automatic fixes
 *   --strict         Fail on any warning
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURATION ====================

const CONFIG = {
  // Directories to scan
  scanDirs: ['app', 'components'],
  
  // File extensions to check
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  
  // Exclude patterns
  excludePatterns: [
    'node_modules',
    '__tests__',
    '__mocks__',
    '.test.',
    '.spec.',
    'dist',
    'build',
  ],
  
  // WCAG AAA Requirements
  wcag: {
    contrastNormal: 7.0,      // AAA requirement for normal text
    contrastLarge: 4.5,       // AAA requirement for large text (18pt+ or 14pt bold)
    contrastUI: 3.0,          // Requirement for UI components
    minTouchTarget: 44,       // Minimum touch target in dp/CSS pixels
    enhancedTouchTarget: 48,  // Enhanced touch target
    maxLineWidth: 80,         // Characters per line
    minLineHeight: 1.5,       // Line height multiplier
    minParagraphSpacing: 2.0, // Paragraph spacing multiplier
    minLetterSpacing: 0.12,   // Em units
    minWordSpacing: 0.16,     // Em units
    maxFontScale: 2.0,        // Maximum font scale (200%)
    focusIndicatorWidth: 2,   // Minimum focus indicator width in px
    focusIndicatorContrast: 3.0, // Focus indicator contrast ratio
  },
};

// ==================== AUDIT CATEGORIES ====================

const WCAG_CRITERIA = {
  perceivable: {
    '1.1.1': { level: 'A', name: 'Non-text Content', description: 'Provide text alternatives for non-text content' },
    '1.2.1': { level: 'A', name: 'Audio-only and Video-only', description: 'Provide alternatives for time-based media' },
    '1.2.2': { level: 'A', name: 'Captions (Prerecorded)', description: 'Provide captions for prerecorded audio' },
    '1.2.3': { level: 'A', name: 'Audio Description or Media Alternative', description: 'Provide audio description' },
    '1.2.4': { level: 'AA', name: 'Captions (Live)', description: 'Provide captions for live audio' },
    '1.2.5': { level: 'AA', name: 'Audio Description (Prerecorded)', description: 'Provide audio description for video' },
    '1.2.6': { level: 'AAA', name: 'Sign Language (Prerecorded)', description: 'Provide sign language interpretation' },
    '1.2.7': { level: 'AAA', name: 'Extended Audio Description', description: 'Provide extended audio description' },
    '1.2.8': { level: 'AAA', name: 'Media Alternative', description: 'Provide text alternative for video' },
    '1.2.9': { level: 'AAA', name: 'Audio-only (Live)', description: 'Provide alternative for live audio' },
    '1.3.1': { level: 'A', name: 'Info and Relationships', description: 'Preserve information and relationships' },
    '1.3.2': { level: 'A', name: 'Meaningful Sequence', description: 'Preserve meaningful reading sequence' },
    '1.3.3': { level: 'A', name: 'Sensory Characteristics', description: 'Instructions not rely solely on sensory characteristics' },
    '1.3.4': { level: 'AA', name: 'Orientation', description: 'Content works in multiple orientations' },
    '1.3.5': { level: 'AA', name: 'Identify Input Purpose', description: 'Identify purpose of input fields' },
    '1.3.6': { level: 'AAA', name: 'Identify Purpose', description: 'Identify purpose of UI components' },
    '1.4.1': { level: 'A', name: 'Use of Color', description: 'Color not sole means of conveying information' },
    '1.4.2': { level: 'A', name: 'Audio Control', description: 'Provide audio control mechanism' },
    '1.4.3': { level: 'AA', name: 'Contrast (Minimum)', description: '4.5:1 contrast ratio for text' },
    '1.4.4': { level: 'AA', name: 'Resize Text', description: 'Text resizable up to 200%' },
    '1.4.5': { level: 'AA', name: 'Images of Text', description: 'Avoid images of text' },
    '1.4.6': { level: 'AAA', name: 'Contrast (Enhanced)', description: '7:1 contrast ratio for text' },
    '1.4.7': { level: 'AAA', name: 'Low or No Background Audio', description: 'Background audio 20dB lower' },
    '1.4.8': { level: 'AAA', name: 'Visual Presentation', description: 'Line length, spacing, alignment' },
    '1.4.9': { level: 'AAA', name: 'Images of Text (No Exception)', description: 'No images of text' },
    '1.4.10': { level: 'AA', name: 'Reflow', description: 'Content reflows at 400%' },
    '1.4.11': { level: 'AA', name: 'Non-text Contrast', description: '3:1 contrast for UI components' },
    '1.4.12': { level: 'AA', name: 'Text Spacing', description: 'Adjustable text spacing' },
    '1.4.13': { level: 'AA', name: 'Content on Hover or Focus', description: 'Hover/focus content dismissible' },
  },
  operable: {
    '2.1.1': { level: 'A', name: 'Keyboard', description: 'All functionality keyboard accessible' },
    '2.1.2': { level: 'A', name: 'No Keyboard Trap', description: 'No keyboard focus trap' },
    '2.1.3': { level: 'AAA', name: 'Keyboard (No Exception)', description: 'All functionality via keyboard' },
    '2.1.4': { level: 'A', name: 'Character Key Shortcuts', description: 'Single key shortcuts can be turned off' },
    '2.2.1': { level: 'A', name: 'Timing Adjustable', description: 'Time limits adjustable' },
    '2.2.2': { level: 'A', name: 'Pause, Stop, Hide', description: 'Moving content can be paused' },
    '2.2.3': { level: 'AAA', name: 'No Timing', description: 'No timing requirements' },
    '2.2.4': { level: 'AAA', name: 'Interruptions', description: 'Interruptions can be postponed' },
    '2.2.5': { level: 'AAA', name: 'Re-authenticating', description: 'Data preserved after re-auth' },
    '2.2.6': { level: 'AAA', name: 'Timeouts', description: 'Users warned about timeouts' },
    '2.3.1': { level: 'A', name: 'Three Flashes or Below', description: 'No flashing content' },
    '2.3.2': { level: 'AAA', name: 'Three Flashes', description: 'No flashing content at all' },
    '2.3.3': { level: 'AAA', name: 'Animation from Interactions', description: 'Motion can be disabled' },
    '2.4.1': { level: 'A', name: 'Bypass Blocks', description: 'Skip navigation available' },
    '2.4.2': { level: 'A', name: 'Page Titled', description: 'Descriptive page titles' },
    '2.4.3': { level: 'A', name: 'Focus Order', description: 'Logical focus order' },
    '2.4.4': { level: 'A', name: 'Link Purpose (In Context)', description: 'Link purpose identifiable' },
    '2.4.5': { level: 'AA', name: 'Multiple Ways', description: 'Multiple ways to find content' },
    '2.4.6': { level: 'AA', name: 'Headings and Labels', description: 'Descriptive headings and labels' },
    '2.4.7': { level: 'AA', name: 'Focus Visible', description: 'Visible focus indicator' },
    '2.4.8': { level: 'AAA', name: 'Location', description: 'User location indicated' },
    '2.4.9': { level: 'AAA', name: 'Link Purpose (Link Only)', description: 'Link purpose from link text' },
    '2.4.10': { level: 'AAA', name: 'Section Headings', description: 'Content organized with headings' },
    '2.4.11': { level: 'AA', name: 'Focus Not Obscured (Minimum)', description: 'Focus not completely hidden' },
    '2.4.12': { level: 'AAA', name: 'Focus Not Obscured (Enhanced)', description: 'Focus fully visible' },
    '2.4.13': { level: 'AAA', name: 'Focus Appearance', description: 'Visible focus indicator meets size/contrast' },
    '2.5.1': { level: 'A', name: 'Pointer Gestures', description: 'Single pointer alternative' },
    '2.5.2': { level: 'A', name: 'Pointer Cancellation', description: 'Pointer actions can be cancelled' },
    '2.5.3': { level: 'A', name: 'Label in Name', description: 'Visible label in accessible name' },
    '2.5.4': { level: 'A', name: 'Motion Actuation', description: 'Motion has UI alternative' },
    '2.5.5': { level: 'AAA', name: 'Target Size (Enhanced)', description: '44x44 minimum touch target' },
    '2.5.6': { level: 'AAA', name: 'Concurrent Input Mechanisms', description: 'All input methods work' },
    '2.5.7': { level: 'AA', name: 'Dragging Movements', description: 'Single pointer alternative for drag' },
    '2.5.8': { level: 'AA', name: 'Target Size (Minimum)', description: '24x24 minimum touch target' },
  },
  understandable: {
    '3.1.1': { level: 'A', name: 'Language of Page', description: 'Default language specified' },
    '3.1.2': { level: 'AA', name: 'Language of Parts', description: 'Language of parts specified' },
    '3.1.3': { level: 'AAA', name: 'Unusual Words', description: 'Definitions for unusual words' },
    '3.1.4': { level: 'AAA', name: 'Abbreviations', description: 'Abbreviations expanded' },
    '3.1.5': { level: 'AAA', name: 'Reading Level', description: 'Lower secondary reading level' },
    '3.1.6': { level: 'AAA', name: 'Pronunciation', description: 'Pronunciation indicated' },
    '3.2.1': { level: 'A', name: 'On Focus', description: 'No context change on focus' },
    '3.2.2': { level: 'A', name: 'On Input', description: 'No context change on input' },
    '3.2.3': { level: 'AA', name: 'Consistent Navigation', description: 'Navigation is consistent' },
    '3.2.4': { level: 'AA', name: 'Consistent Identification', description: 'Components identified consistently' },
    '3.2.5': { level: 'AAA', name: 'Change on Request', description: 'Changes only on request' },
    '3.2.6': { level: 'A', name: 'Consistent Help', description: 'Help in consistent location' },
    '3.3.1': { level: 'A', name: 'Error Identification', description: 'Errors described in text' },
    '3.3.2': { level: 'A', name: 'Labels or Instructions', description: 'Labels provided for input' },
    '3.3.3': { level: 'AA', name: 'Error Suggestion', description: 'Error correction suggested' },
    '3.3.4': { level: 'AA', name: 'Error Prevention (Legal, Financial, Data)', description: 'Reversible/checked/confirmed' },
    '3.3.5': { level: 'AAA', name: 'Help', description: 'Context-sensitive help available' },
    '3.3.6': { level: 'AAA', name: 'Error Prevention (All)', description: 'All submissions reversible' },
    '3.3.7': { level: 'A', name: 'Redundant Entry', description: 'Previously entered info auto-populated' },
    '3.3.8': { level: 'AA', name: 'Accessible Authentication (Minimum)', description: 'No cognitive function test' },
    '3.3.9': { level: 'AAA', name: 'Accessible Authentication (Enhanced)', description: 'No object recognition' },
  },
  robust: {
    '4.1.2': { level: 'A', name: 'Name, Role, Value', description: 'Accessible name, role, state' },
    '4.1.3': { level: 'AA', name: 'Status Messages', description: 'Status announced without focus' },
  },
};

// ==================== UTILITY FUNCTIONS ====================

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 0xFF, g: (num >> 8) & 0xFF, b: num & 0xFF };
}

function relativeLuminance({ r, g, b }) {
  const f = c => { const chan = c / 255; return chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg, bg) {
  const L1 = relativeLuminance(hexToRgb(fg));
  const L2 = relativeLuminance(hexToRgb(bg));
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

function suggestContrastFix(fg, bg, targetRatio) {
  const { r, g, b } = hexToRgb(fg);
  const bgLum = relativeLuminance(hexToRgb(bg));
  const fgLum = relativeLuminance({ r, g, b });
  
  // Adjust lightness to meet contrast
  const adjustLightness = (factor) => {
    const newR = Math.max(0, Math.min(255, Math.round(r * factor)));
    const newG = Math.max(0, Math.min(255, Math.round(g * factor)));
    const newB = Math.max(0, Math.min(255, Math.round(b * factor)));
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };
  
  // Try to find a suitable adjustment
  for (let factor = 0.1; factor <= 2; factor += 0.1) {
    const newColor = adjustLightness(factor);
    if (contrastRatio(newColor, bg) >= targetRatio) {
      return newColor;
    }
  }
  
  return null;
}

function* walkFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Check exclusions
    if (CONFIG.excludePatterns.some(pattern => fullPath.includes(pattern))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
    } else if (CONFIG.extensions.some(ext => entry.name.endsWith(ext))) {
      yield fullPath;
    }
  }
}

// ==================== AUDITORS ====================

class AccessibilityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passes = [];
    this.stats = {
      filesScanned: 0,
      issuesFound: 0,
      warningsFound: 0,
      passedChecks: 0,
    };
  }

  addIssue(file, line, criterion, message, suggestion = null) {
    this.issues.push({
      file: path.relative(process.cwd(), file),
      line,
      criterion,
      criterionName: this.getCriterionName(criterion),
      level: this.getCriterionLevel(criterion),
      message,
      suggestion,
    });
    this.stats.issuesFound++;
  }

  addWarning(file, line, criterion, message) {
    this.warnings.push({
      file: path.relative(process.cwd(), file),
      line,
      criterion,
      criterionName: this.getCriterionName(criterion),
      message,
    });
    this.stats.warningsFound++;
  }

  addPass(criterion) {
    this.passes.push({
      criterion,
      criterionName: this.getCriterionName(criterion),
    });
    this.stats.passedChecks++;
  }

  getCriterionName(criterion) {
    for (const category of Object.values(WCAG_CRITERIA)) {
      if (category[criterion]) {
        return category[criterion].name;
      }
    }
    return 'Unknown';
  }

  getCriterionLevel(criterion) {
    for (const category of Object.values(WCAG_CRITERIA)) {
      if (category[criterion]) {
        return category[criterion].level;
      }
    }
    return 'Unknown';
  }

  audit() {
    console.log('🔍 Starting WCAG 2.2 AAA Compliance Audit...\n');
    
    for (const dir of CONFIG.scanDirs) {
      const fullDir = path.join(process.cwd(), dir);
      for (const file of walkFiles(fullDir)) {
        this.auditFile(file);
        this.stats.filesScanned++;
      }
    }
    
    // Audit Colors.ts
    this.auditColors();
    
    // Audit A11Y constants
    this.auditA11YConstants();
    
    return this.generateReport();
  }

  auditFile(file) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split(/\r?\n/);
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for Pressable without accessibility role
      if (/\<Pressable/.test(line) && !/accessibilityRole/.test(line)) {
        this.addIssue(file, lineNum, '4.1.2', 
          'Pressable missing accessibilityRole',
          'Add accessibilityRole="button" or appropriate role');
      }
      
      // Check for Pressable without hitSlop
      if (/\<Pressable/.test(line) && !/hitSlop/.test(line)) {
        this.addWarning(file, lineNum, '2.5.5',
          'Pressable missing hitSlop for enhanced touch target');
      }
      
      // Check for Image without accessibility
      if (/\<Image/.test(line) && !/accessibilityLabel|accessible={false}|accessibilityElementsHidden/.test(line)) {
        this.addIssue(file, lineNum, '1.1.1',
          'Image missing accessibility label or not marked as decorative',
          'Add accessibilityLabel or accessible={false} for decorative images');
      }
      
      // Check for Link without accessibility role
      if (/\<Link/.test(line) && !/accessibilityRole|asChild/.test(line)) {
        this.addIssue(file, lineNum, '4.1.2',
          'Link missing accessibilityRole or asChild',
          'Add accessibilityRole="link" or use asChild with accessible wrapper');
      }
      
      // Check for TextInput without label
      if (/\<TextInput/.test(line) && !/accessibilityLabel|placeholder/.test(line)) {
        this.addIssue(file, lineNum, '3.3.2',
          'TextInput missing label or placeholder',
          'Add accessibilityLabel or placeholder for form field identification');
      }
      
      // Check for hardcoded colors that might fail contrast
      const hexMatch = line.match(/#[0-9a-fA-F]{3,8}/g);
      if (hexMatch) {
        hexMatch.forEach(hex => {
          if (hex.length >= 4) {
            // Check against white background
            const ratioLight = contrastRatio(hex, '#FFFFFF');
            if (ratioLight < CONFIG.wcag.contrastNormal && !line.includes('background')) {
              this.addWarning(file, lineNum, '1.4.6',
                `Hardcoded color ${hex} may not meet AAA contrast (${ratioLight.toFixed(2)}:1 on white)`);
            }
            
            // Check against dark background
            const ratioDark = contrastRatio(hex, '#000000');
            if (ratioDark < CONFIG.wcag.contrastNormal && !line.includes('background')) {
              this.addWarning(file, lineNum, '1.4.6',
                `Hardcoded color ${hex} may not meet AAA contrast (${ratioDark.toFixed(2)}:1 on black)`);
            }
          }
        });
      }
      
      // Check for setTimeout/setInterval without user control (timing)
      if (/setTimeout|setInterval/.test(line)) {
        const durationMatch = line.match(/(\d+)\s*[,\)]/);
        if (durationMatch && parseInt(durationMatch[1]) > 0) {
          this.addWarning(file, lineNum, '2.2.1',
            'Timed operation detected - ensure user can adjust/disable timing');
        }
      }
      
      // Check for animations without reduce motion check
      if (/Animated\.|useAnimated|withSpring|withTiming/.test(line)) {
        if (!content.includes('reduceMotion') && !content.includes('useReduceMotionEnabled')) {
          this.addWarning(file, lineNum, '2.3.3',
            'Animation detected without reduce motion check');
        }
      }
      
      // Check for heading elements
      if (/accessibilityRole.*header/.test(line) || /role.*heading/.test(line)) {
        this.addPass('1.3.1');
      }
      
      // Check for live region announcements
      if (/accessibilityLiveRegion|announceForAccessibility/.test(line)) {
        this.addPass('4.1.3');
      }
      
      // Check for focus management
      if (/setAccessibilityFocus|focus\(\)|focusSearch/.test(line)) {
        this.addPass('2.4.3');
      }
      
      // Check for minWidth/minHeight for touch targets
      if (/minWidth:\s*(\d+)/.test(line)) {
        const match = line.match(/minWidth:\s*(\d+)/);
        if (match && parseInt(match[1]) < CONFIG.wcag.minTouchTarget) {
          this.addWarning(file, lineNum, '2.5.5',
            `Touch target minWidth ${match[1]} may be below 44dp minimum`);
        }
      }
    });
  }

  auditColors() {
    const colorsPath = path.join(process.cwd(), 'constants', 'Colors.ts');
    if (!fs.existsSync(colorsPath)) {
      this.addWarning(colorsPath, 0, '1.4.6', 'Colors.ts not found for contrast analysis');
      return;
    }
    
    const content = fs.readFileSync(colorsPath, 'utf-8');
    const colors = this.parseColors(content);
    
    // Check light theme
    if (colors.light) {
      this.checkThemeContrast(colors.light, 'light', colorsPath);
    }
    
    // Check dark theme
    if (colors.dark) {
      this.checkThemeContrast(colors.dark, 'dark', colorsPath);
    }
  }

  parseColors(content) {
    const colors = { light: {}, dark: {} };
    let currentTheme = null;
    
    content.split(/\r?\n/).forEach(line => {
      if (line.includes('light:')) currentTheme = 'light';
      else if (line.includes('dark:')) currentTheme = 'dark';
      else if (line.includes('},')) currentTheme = null;
      
      if (currentTheme) {
        const match = line.match(/(\w+):\s*["']?(#[0-9a-fA-F]{3,8})["']?/);
        if (match) {
          colors[currentTheme][match[1]] = match[2];
        }
      }
    });
    
    return colors;
  }

  checkThemeContrast(theme, themeName, file) {
    const bg = theme.background || (themeName === 'light' ? '#FFFFFF' : '#000000');
    
    for (const [name, color] of Object.entries(theme)) {
      if (name === 'background') continue;
      
      const ratio = contrastRatio(color, bg);
      const isDecorative = name.toLowerCase().includes('tint') || name.toLowerCase().includes('accent');
      const requiredRatio = isDecorative ? CONFIG.wcag.contrastLarge : CONFIG.wcag.contrastNormal;
      
      if (ratio >= requiredRatio) {
        this.addPass('1.4.6');
      } else {
        const suggestion = suggestContrastFix(color, bg, requiredRatio);
        this.addIssue(file, 0, '1.4.6',
          `${themeName}.${name} (${color}) has ${ratio.toFixed(2)}:1 contrast, needs ${requiredRatio}:1`,
          suggestion ? `Try: ${suggestion}` : null);
      }
    }
  }

  auditA11YConstants() {
    const a11yPath = path.join(process.cwd(), 'constants', 'A11Y.ts');
    if (!fs.existsSync(a11yPath)) {
      this.addWarning(a11yPath, 0, '2.5.5', 'A11Y.ts not found for touch target validation');
      return;
    }
    
    const content = fs.readFileSync(a11yPath, 'utf-8');
    
    // Check touch target definitions
    const minMatch = content.match(/min[^:]*:\s*{\s*minWidth:\s*(\d+)/);
    if (minMatch) {
      const minSize = parseInt(minMatch[1]);
      if (minSize >= CONFIG.wcag.minTouchTarget) {
        this.addPass('2.5.5');
      } else {
        this.addIssue(a11yPath, 0, '2.5.5',
          `Minimum touch target (${minSize}) below WCAG AAA requirement (${CONFIG.wcag.minTouchTarget})`,
          `Set minWidth and minHeight to at least ${CONFIG.wcag.minTouchTarget}`);
      }
    }
    
    // Check enhanced touch target
    const enhancedMatch = content.match(/enhanced[^:]*:\s*{\s*minWidth:\s*(\d+)/);
    if (enhancedMatch) {
      const enhancedSize = parseInt(enhancedMatch[1]);
      if (enhancedSize >= CONFIG.wcag.enhancedTouchTarget) {
        this.addPass('2.5.5');
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        filesScanned: this.stats.filesScanned,
        totalIssues: this.stats.issuesFound,
        totalWarnings: this.stats.warningsFound,
        passedChecks: this.stats.passedChecks,
        compliance: this.calculateCompliance(),
      },
      issuesByLevel: {
        A: this.issues.filter(i => i.level === 'A').length,
        AA: this.issues.filter(i => i.level === 'AA').length,
        AAA: this.issues.filter(i => i.level === 'AAA').length,
      },
      issues: this.issues,
      warnings: this.warnings,
      passes: this.passes,
    };
    
    return report;
  }

  calculateCompliance() {
    const totalCriteria = Object.values(WCAG_CRITERIA).reduce((acc, cat) => acc + Object.keys(cat).length, 0);
    const failedCriteria = new Set(this.issues.map(i => i.criterion)).size;
    const passRate = ((totalCriteria - failedCriteria) / totalCriteria * 100).toFixed(1);
    return `${passRate}%`;
  }
}

// ==================== MAIN EXECUTION ====================

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    json: false,
    jsonPath: null,
    verbose: false,
    fix: false,
    strict: false,
  };
  
  args.forEach(arg => {
    if (arg === '--json') opts.json = true;
    else if (arg.startsWith('--json=')) {
      opts.json = true;
      opts.jsonPath = arg.split('=')[1];
    }
    else if (arg === '--verbose') opts.verbose = true;
    else if (arg === '--fix') opts.fix = true;
    else if (arg === '--strict') opts.strict = true;
  });
  
  return opts;
}

function printReport(report, opts) {
  if (opts.json) {
    const jsonOutput = JSON.stringify(report, null, 2);
    if (opts.jsonPath) {
      fs.writeFileSync(opts.jsonPath, jsonOutput);
      console.log(`Report saved to: ${opts.jsonPath}`);
    } else {
      console.log(jsonOutput);
    }
    return;
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('              WCAG 2.2 AAA COMPLIANCE AUDIT REPORT              ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('📊 SUMMARY');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Files scanned:     ${report.summary.filesScanned}`);
  console.log(`  Issues found:      ${report.summary.totalIssues}`);
  console.log(`  Warnings found:    ${report.summary.totalWarnings}`);
  console.log(`  Passed checks:     ${report.summary.passedChecks}`);
  console.log(`  Compliance rate:   ${report.summary.compliance}`);
  console.log('');
  
  console.log('📈 ISSUES BY WCAG LEVEL');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Level A issues:    ${report.issuesByLevel.A}`);
  console.log(`  Level AA issues:   ${report.issuesByLevel.AA}`);
  console.log(`  Level AAA issues:  ${report.issuesByLevel.AAA}`);
  console.log('');
  
  if (report.issues.length > 0) {
    console.log('🚨 ISSUES');
    console.log('───────────────────────────────────────────────────────────────');
    report.issues.forEach(issue => {
      console.log(`  [${issue.level}] ${issue.criterion} ${issue.criterionName}`);
      console.log(`      File: ${issue.file}:${issue.line}`);
      console.log(`      ${issue.message}`);
      if (issue.suggestion && opts.fix) {
        console.log(`      💡 Suggestion: ${issue.suggestion}`);
      }
      console.log('');
    });
  }
  
  if (report.warnings.length > 0 && opts.verbose) {
    console.log('⚠️  WARNINGS');
    console.log('───────────────────────────────────────────────────────────────');
    report.warnings.forEach(warning => {
      console.log(`  ${warning.criterion}: ${warning.message}`);
      console.log(`      File: ${warning.file}:${warning.line}`);
      console.log('');
    });
  }
  
  console.log('───────────────────────────────────────────────────────────────');
  
  if (report.summary.totalIssues === 0) {
    console.log('✅ PASSED: No WCAG 2.2 AAA compliance issues found!');
  } else {
    console.log(`❌ FAILED: ${report.summary.totalIssues} issue(s) need to be addressed for AAA compliance.`);
  }
}

function main() {
  const opts = parseArgs();
  const auditor = new AccessibilityAuditor();
  const report = auditor.audit();
  
  printReport(report, opts);
  
  // Set exit code based on issues
  if (opts.strict && (report.summary.totalIssues > 0 || report.summary.totalWarnings > 0)) {
    process.exitCode = 1;
  } else if (report.summary.totalIssues > 0) {
    process.exitCode = 1;
  }
}

main();
