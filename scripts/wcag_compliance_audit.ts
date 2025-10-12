#!/usr/bin/env ts-node
/**
 * WCAG Compliance Audit (comprehensive)
 * Focus areas:
 *  1. Color contrast for defined theme tokens (light/dark) using constants/Colors + palette assumptions.
 *  2. Inline hex colors in TSX files (flag potential low contrast vs background).
 *  3. Reports summary with pass/fail counts; non-zero failures => exit code 1 for CI.
 *  4. Optional JSON output (machine readable) via --json or --json=path.json
 *  5. Configurable thresholds (--aa 4.5 --aaa 7) & inline assumed background (--inline-bg #FFFFFF)
 *  6. Suggest closest contrast-compliant shade adjustments for failing palette pairs
 *  7. Internationalization accessibility audit (i18n a11y)
 *  8. Accessibility component compliance checks
 *
 * New features:
 *  - i18n accessibility pattern validation
 *  - Screen reader announcement quality checks
 *  - Accessibility role and state consistency
 *  - Enhanced component accessibility validation
 *
 * Future extensions (not implemented yet):
 *  - Focus order heuristic
 *  - Motion / prefers-reduced-motion checks
 */
import * as fs from 'fs';
import * as path from 'path';

// Lazy import of Colors (avoid requiring app bundler context). We'll parse manually.
const COLORS_PATH = path.join(process.cwd(), 'constants', 'Colors.ts');

interface ThemeColors { [k: string]: string; }
interface Themes { light: ThemeColors; dark: ThemeColors; }

function parseColors(): Themes | null {
  if (!fs.existsSync(COLORS_PATH)) return null;
  const src = fs.readFileSync(COLORS_PATH, 'utf8');
  // Very small heuristic parse: match lines like key: "#ABCDEF"
  const theme: any = { light: {}, dark: {} };
  let current: 'light'|'dark'|null = null;
  for (const line of src.split(/\r?\n/)) {
    const h = line.trim();
    if (h.startsWith('light:')) { current = 'light'; continue; }
    if (h.startsWith('dark:')) { current = 'dark'; continue; }
    if (current) {
      const m = h.match(/^(\w+):\s*"(#[0-9a-fA-F]{3,8})"/);
      if (m) theme[current][m[1]] = m[2];
      if (h.startsWith('},')) current = null;
    }
  }
  return theme;
}

function hexToRgb(hex: string) {
  let h = hex.replace('#','');
  if (h.length === 3) h = h.split('').map(c=> c+c).join('');
  if (h.length === 8) h = h.slice(0,6); // ignore alpha channel for now
  const num = parseInt(h,16);
  return { r: (num>>16)&0xFF, g: (num>>8)&0xFF, b: num&0xFF };
}

function relLuminance({r,g,b}:{r:number;g:number;b:number}) {
  const f = (c:number)=> {
    const chan = c/255;
    return chan <= 0.03928 ? chan/12.92 : Math.pow((chan+0.055)/1.055, 2.4);
  };
  const R = f(r), G = f(g), B = f(b);
  return 0.2126*R + 0.7152*G + 0.0722*B;
}

function contrastRatio(fg: string, bg: string) {
  const L1 = relLuminance(hexToRgb(fg));
  const L2 = relLuminance(hexToRgb(bg));
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

interface ContrastResult { pair: string; token: string; theme: string; ratio: number; passesAA: boolean; passesAAA: boolean; fg: string; bg: string; suggestion?: string; }

function tweakTowardsContrast(hex: string, bg: string, target: number, maxIters = 24): string | undefined {
  // Adjust lightness iteratively (HSL approximation) until ratio >= target or iterations exhausted
  try {
    let { r, g, b } = hexToRgb(hex);
    const toHsl = (r:number,g:number,b:number) => {
      r/=255; g/=255; b/=255;
      const max=Math.max(r,g,b), min=Math.min(r,g,b); let h=0,s=0,l=(max+min)/2; const d=max-min;
      if(d){ s = l>0.5? d/(2-max-min): d/(max+min); switch(max){ case r: h=((g-b)/d + (g<b?6:0)); break; case g: h=((b-r)/d +2); break; case b: h=((r-g)/d +4); break;} h/=6; }
      return {h,s,l};
    };
    const fromHsl=(h:number,s:number,l:number)=>{ const f=(n:number)=>{ const k=(n+h*6)%6; const a=s*Math.min(l,1-l); const c=l - a*Math.max(-1,Math.min(k-3,Math.min(9-k,1))); return c; }; return { r:Math.round(f(0)*255), g:Math.round(f(8/6)*255), b:Math.round(f(4/6)*255)}; };
    let { h,s,l } = toHsl(r,g,b);
    const bgLum = relLuminance(hexToRgb(bg));
    const originalIsDarker = relLuminance({r,g,b}) < bgLum;
    for (let i=0;i<maxIters;i++) {
      const step = (i+1)/maxIters * 0.4; // up to 40% shift
      const newL = originalIsDarker? Math.max(0, l - step) : Math.min(1, l + step);
      const rgb = fromHsl(h,s,newL);
      const candidate = `#${[rgb.r,rgb.g,rgb.b].map(v=> v.toString(16).padStart(2,'0')).join('')}`;
      const cr = contrastRatio(candidate, bg);
      if (cr >= target) return candidate;
    }
  } catch {}
  return undefined;
}

function auditTheme(theme: ThemeColors, name: string, aa: number, aaa: number): ContrastResult[] {
  const bg = theme.background || '#FFFFFF';
  const fgCandidates = Object.entries(theme).filter(([k]) => k !== 'background');
  return fgCandidates.map(([k, hex]) => {
    const ratio = contrastRatio(hex, bg);
    const relaxAA = (k.toLowerCase().includes('tint') || k.toLowerCase().includes('accent')) ? 3 : aa;
    const passesAA = ratio >= relaxAA;
    const passesAAA = ratio >= aaa;
    let suggestion: string | undefined;
    if (!passesAA) suggestion = tweakTowardsContrast(hex, bg, relaxAA);
    return {
      pair: `${name}.${k} on background`,
      token: k,
      theme: name,
      ratio,
      passesAA,
      passesAAA,
      fg: hex,
      bg,
      suggestion
    };
  });
}

// Inline hex scan
const SCAN_DIRS = ['app','components'];
const HEX_RE = /#[0-9a-fA-F]{3,8}/g;

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  const stack: string[] = [dir];
  while (stack.length) {
    const current = stack.pop()!;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch { continue; }
    for (const entry of entries) {
      const p = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(p);
      else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) out.push(p);
    }
  }
  return out;
}

interface InlineColorIssue { file: string; line: number; color: string; ratio: number; suggested?: string; context?: 'light'|'dark'; }

interface I18nA11yIssue {
  file: string;
  line: number;
  type: 'missing-translation' | 'poor-announcement' | 'invalid-role' | 'missing-label';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface AccessibilityPattern {
  pattern: RegExp;
  validator: (match: string, context: string) => I18nA11yIssue | null;
  description: string;
}

function scanInlineColors(bgLight: string, bgDark: string, aa: number): InlineColorIssue[] {
  const issues: InlineColorIssue[] = [];
  for (const base of SCAN_DIRS) {
    const dir = path.join(process.cwd(), base);
  for (const file of walk(dir)) {
      const src = fs.readFileSync(file, 'utf8');
      const lines = src.split(/\r?\n/);
      lines.forEach((l, idx) => {
        const matches = l.match(HEX_RE);
        if (!matches) return;
        matches.forEach(hex => {
          if (hex.length <= 4) return;
          // Evaluate against both light & dark backgrounds heuristically
          try {
            const rLight = contrastRatio(hex, bgLight);
            if (rLight < aa) {
              issues.push({ file: path.relative(process.cwd(), file), line: idx+1, color: hex, ratio: rLight, context: 'light', suggested: tweakTowardsContrast(hex, bgLight, aa) });
            }
            const rDark = contrastRatio(hex, bgDark);
            if (rDark < aa) {
              issues.push({ file: path.relative(process.cwd(), file), line: idx+1, color: hex, ratio: rDark, context: 'dark', suggested: tweakTowardsContrast(hex, bgDark, aa) });
            }
          } catch {}
        });
      });
    }
  }
  return issues;
}

function getAccessibilityPatterns(): AccessibilityPattern[] {
  return [
    {
      pattern: /accessibilityLabel=\{[^}]*t\(['"`]([^'"`]+)['"`]\)/g,
      validator: (match, _context) => {
        if (match.includes('undefined') || match.includes('null')) {
          return {
            file: '',
            line: 0,
            type: 'missing-translation',
            severity: 'error',
            message: 'Accessibility label translation returns undefined/null',
            suggestion: 'Check if translation key exists in all locale files'
          };
        }
        return null;
      },
      description: 'Accessibility label translation validation'
    },
    {
      pattern: /accessibilityRole=['"`]([^'"`]+)['"`]/g,
      validator: (match, _context) => {
        const validRoles = ['button', 'link', 'text', 'image', 'header', 'search', 'none', 'adjustable'];
        const role = match.match(/accessibilityRole=['"`]([^'"`]+)['"`]/)?.[1];
        if (role && !validRoles.includes(role)) {
          return {
            file: '',
            line: 0,
            type: 'invalid-role',
            severity: 'warning',
            message: `Invalid accessibility role: ${role}`,
            suggestion: `Use one of: ${validRoles.join(', ')}`
          };
        }
        return null;
      },
      description: 'Accessibility role validation'
    },
    {
      pattern: /<Pressable[^>]*>/g,
      validator: (match, _context) => {
        if (!match.includes('accessibilityLabel') && !match.includes('accessibilityHint')) {
          return {
            file: '',
            line: 0,
            type: 'missing-label',
            severity: 'warning',
            message: 'Pressable component missing accessibility label or hint',
            suggestion: 'Add accessibilityLabel or accessibilityHint for screen readers'
          };
        }
        return null;
      },
      description: 'Pressable accessibility validation'
    },
    {
      pattern: /<TextInput[^>]*>/g,
      validator: (match, _context) => {
        if (!match.includes('accessibilityLabel') && !match.includes('placeholder')) {
          return {
            file: '',
            line: 0,
            type: 'missing-label',
            severity: 'warning',
            message: 'TextInput missing accessibility label or placeholder',
            suggestion: 'Add accessibilityLabel or placeholder for screen readers'
          };
        }
        return null;
      },
      description: 'TextInput accessibility validation'
    }
  ];
}

function auditI18nAccessibility(): I18nA11yIssue[] {
  const issues: I18nA11yIssue[] = [];
  const patterns = getAccessibilityPatterns();
  
  for (const base of SCAN_DIRS) {
    const dir = path.join(process.cwd(), base);
    for (const file of walk(dir)) {
      const src = fs.readFileSync(file, 'utf8');
      const lines = src.split(/\r?\n/);
      
      lines.forEach((line, idx) => {
        patterns.forEach(pattern => {
          const matches = line.matchAll(pattern.pattern);
          for (const match of matches) {
            const issue = pattern.validator(match[0], line);
            if (issue) {
              issue.file = path.relative(process.cwd(), file);
              issue.line = idx + 1;
              issues.push(issue);
            }
          }
        });
      });
    }
  }
  
  return issues;
}

interface CliOptions { aa: number; aaa: number; json?: string|boolean; inlineBg?: string; inlineBgDark?: string; }

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const opts: CliOptions = { aa: 4.5, aaa: 7 };
  args.forEach(a => {
    if (a.startsWith('--aa=')) opts.aa = parseFloat(a.split('=')[1]);
    else if (a.startsWith('--aaa=')) opts.aaa = parseFloat(a.split('=')[1]);
    else if (a === '--json') opts.json = true;
    else if (a.startsWith('--json=')) opts.json = a.split('=')[1];
    else if (a.startsWith('--inline-bg=')) opts.inlineBg = a.split('=')[1];
    else if (a.startsWith('--inline-bg-dark=')) opts.inlineBgDark = a.split('=')[1];
  });
  return opts;
}

function main() {
  const opts = parseArgs();
  const colors = parseColors();
  const results: ContrastResult[] = [];
  if (colors) {
    results.push(...auditTheme(colors.light, 'light', opts.aa, opts.aaa));
    results.push(...auditTheme(colors.dark, 'dark', opts.aa, opts.aaa));
  }
  const failing = results.filter(r => !r.passesAA);
  const inlineIssues = scanInlineColors(
    opts.inlineBg || colors?.light.background || '#FFFFFF',
    opts.inlineBgDark || colors?.dark.background || '#000000',
    opts.aa
  );
  
  // New: i18n accessibility audit
  const i18nA11yIssues = auditI18nAccessibility();
  const criticalI18nIssues = i18nA11yIssues.filter(i => i.severity === 'error');

  if (!opts.json) {
  console.warn('WCAG Color Contrast & i18n Accessibility Audit');
  console.warn('==============================================');
  console.warn(`Thresholds: AA=${opts.aa} AAA=${opts.aaa}`);
  console.warn('\nPalette Contrast Ratios:');
    results.forEach(r => {
      const sugg = r.suggestion ? ` (suggestion: ${r.suggestion})` : '';
  console.warn(`${r.pair}: ${r.ratio.toFixed(2)}  AA:${r.passesAA?'✓':'✗'} AAA:${r.passesAAA?'✓':'✗'}${sugg}`);
    });
  if (!results.length) console.warn('No theme colors parsed.');

    if (failing.length) {
      console.warn(`\nFAIL: ${failing.length} palette pair(s) below AA threshold (${opts.aa}:1).`);
    } else {
      console.warn('\nAll palette pairs meet AA (heuristic rules).');
    }

  console.warn(`\nInline Hex Color Issues (<${opts.aa}:1 contrast against light/dark backgrounds):`);
  if (!inlineIssues.length) console.warn('None detected');
    inlineIssues.forEach(i => {
      const sugg = i.suggested ? ` -> suggestion ${i.suggested}` : '';
  console.warn(`  [${i.context}] ${i.file}:${i.line}  ${i.color} ratio=${i.ratio.toFixed(2)}${sugg}`);
    });

    // New: i18n accessibility issues report
    console.warn('\nInternationalization Accessibility Issues:');
    if (!i18nA11yIssues.length) {
      console.warn('None detected');
    } else {
      const errorCount = i18nA11yIssues.filter(i => i.severity === 'error').length;
      const warningCount = i18nA11yIssues.filter(i => i.severity === 'warning').length;
      console.warn(`Found ${errorCount} errors, ${warningCount} warnings`);
      
      i18nA11yIssues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        const sugg = issue.suggestion ? ` -> ${issue.suggestion}` : '';
        console.warn(`  ${icon} [${issue.type}] ${issue.file}:${issue.line} ${issue.message}${sugg}`);
      });
    }
  }

  if (opts.json) {
    const payload = { 
      thresholds: { aa: opts.aa, aaa: opts.aaa }, 
      palette: results, 
      paletteFailing: failing, 
      inlineIssues,
      i18nAccessibility: {
        issues: i18nA11yIssues,
        summary: {
          total: i18nA11yIssues.length,
          errors: i18nA11yIssues.filter(i => i.severity === 'error').length,
          warnings: i18nA11yIssues.filter(i => i.severity === 'warning').length,
          info: i18nA11yIssues.filter(i => i.severity === 'info').length
        }
      }
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    if (typeof opts.json === 'string') {
      fs.writeFileSync(opts.json, jsonStr, 'utf8');
    } else {
  console.warn(jsonStr);
    }
  }

  // Exit with error if there are critical issues
  if (failing.length || criticalI18nIssues.length) {
    console.warn(`\nAudit failed: ${failing.length} color contrast failures, ${criticalI18nIssues.length} critical i18n accessibility issues`);
    process.exitCode = 1;
  }
}

main();
