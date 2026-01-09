#!/usr/bin/env node

/**
 * WCAG 2.2 Color Contrast Audit Script
 * 
 * Scans React/React Native code for color contrast issues
 * Reports violations with file locations
 * Suggests accessible color fixes
 * 
 * Usage:
 *   node scripts/wcag-contrast-audit.mjs [--fix] [--json=output.json]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color utilities
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(fg, bg) {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);

  if (!fgRgb || !bgRgb) return 0;

  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

function meetsAAA(fg, bg) {
  return calculateContrastRatio(fg, bg) >= 7;
}

function meetsAA(fg, bg) {
  return calculateContrastRatio(fg, bg) >= 4.5;
}

// Color adjustment
function lightenColor(color, percent) {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * (percent / 100)));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * (percent / 100)));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * (percent / 100)));

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function darkenColor(color, percent) {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.max(0, Math.round(rgb.r - rgb.r * (percent / 100)));
  const g = Math.max(0, Math.round(rgb.g - rgb.g * (percent / 100)));
  const b = Math.max(0, Math.round(rgb.b - rgb.b * (percent / 100)));

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function suggestAccessibleColor(text, bg) {
  let adjustment = 5;

  // Try lightening
  while (adjustment <= 100) {
    const lightened = lightenColor(text, adjustment);
    if (meetsAAA(lightened, bg)) {
      return lightened;
    }
    adjustment += 5;
  }

  // Try darkening
  adjustment = 5;
  while (adjustment <= 100) {
    const darkened = darkenColor(text, adjustment);
    if (meetsAAA(darkened, bg)) {
      return darkened;
    }
    adjustment += 5;
  }

  return text;
}

// Color patterns
const colorPatterns = [
  /color\s*:\s*(['"])?(#[0-9A-Fa-f]{6}|[a-z]+)(['"])?/gi,
  /backgroundColor\s*:\s*(['"])?(#[0-9A-Fa-f]{6}|[a-z]+)(['"])?/gi,
  /fill\s*:\s*(['"])?(#[0-9A-Fa-f]{6}|[a-z]+)(['"])?/gi,
  /stroke\s*:\s*(['"])?(#[0-9A-Fa-f]{6}|[a-z]+)(['"])?/gi,
];

// File scanning
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  const lines = content.split('\n');

  // Extract color pairs from the file
  const colorPairs = [];
  const styleObjectPattern = /(?:style\s*=\s*\{([^}]+)\}|StyleSheet\.create\s*\(\s*\{([^}]+)\})/g;

  let match;
  while ((match = styleObjectPattern.exec(content)) !== null) {
    const styleBlock = match[1] || match[2];
    const colors = {
      color: null,
      backgroundColor: null,
    };

    const colorMatch = styleBlock.match(/color\s*:\s*(['"]?)([#a-zA-Z0-9]+)\1/i);
    const bgMatch = styleBlock.match(/backgroundColor\s*:\s*(['"]?)([#a-zA-Z0-9]+)\1/i);

    if (colorMatch) colors.color = colorMatch[2];
    if (bgMatch) colors.backgroundColor = bgMatch[2];

    if (colors.color && colors.backgroundColor) {
      colorPairs.push({
        fg: colors.color,
        bg: colors.backgroundColor,
        startIndex: match.index,
      });
    }
  }

  // Check each color pair
  for (const pair of colorPairs) {
    const contrast = calculateContrastRatio(pair.fg, pair.bg);
    const lineNum =
      content.substring(0, pair.startIndex).split('\n').length;

    if (!meetsAAA(pair.fg, pair.bg)) {
      const suggestion = suggestAccessibleColor(pair.fg, pair.bg);

      violations.push({
        file: filePath,
        line: lineNum,
        fg: pair.fg,
        bg: pair.bg,
        ratio: contrast.toFixed(2),
        passes: meetsAA(pair.fg, pair.bg) ? 'AA' : 'FAIL',
        suggestion,
      });
    }
  }

  return violations;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const jsonOutput = args.find((a) => a.startsWith('--json='))?.split('=')[1];

  const rootDir = path.join(__dirname, '..');
  const sourceDir = path.join(rootDir, 'app', 'components', 'utils');

  const allViolations = [];

  function walkDir(dir) {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules') {
            walkDir(filePath);
          }
        } else if (
          file.endsWith('.tsx') ||
          file.endsWith('.ts') ||
          file.endsWith('.jsx') ||
          file.endsWith('.js')
        ) {
          const violations = scanFile(filePath);
          allViolations.push(...violations);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }

  // Scan all source directories
  for (const dir of ['app', 'components', 'utils']) {
    const scanDir = path.join(rootDir, dir);
    if (fs.existsSync(scanDir)) {
      walkDir(scanDir);
    }
  }

  if (allViolations.length === 0) {
    console.log('✅ All colors meet WCAG AAA contrast requirements!');
    process.exit(0);
  }

  // Report violations
  console.log(`\n⚠️  Found ${allViolations.length} contrast violations\n`);
  console.log('═'.repeat(80));

  const groupedByFile = {};
  for (const violation of allViolations) {
    if (!groupedByFile[violation.file]) {
      groupedByFile[violation.file] = [];
    }
    groupedByFile[violation.file].push(violation);
  }

  for (const [file, violations] of Object.entries(groupedByFile)) {
    console.log(`\n📄 ${file}`);
    for (const v of violations) {
      console.log(`   Line ${v.line}:`);
      console.log(`   • FG: ${v.fg}`);
      console.log(`   • BG: ${v.bg}`);
      console.log(`   • Ratio: ${v.ratio}:1 (${v.passes})`);
      console.log(`   • Fix: Use ${v.suggestion} instead of ${v.fg}`);
      console.log('');
    }
  }

  if (jsonOutput) {
    fs.writeFileSync(
      path.join(rootDir, jsonOutput),
      JSON.stringify(allViolations, null, 2)
    );
    console.log(`\n📊 Report saved to ${jsonOutput}`);
  }

  console.log('═'.repeat(80));
  console.log(
    `\n❌ ${allViolations.length} violations found. Run with --fix to generate suggestions.`
  );

  process.exit(1);
}

main();
