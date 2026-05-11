#!/usr/bin/env node

/**
 * Pre-Commit Accessibility Checks
 * Runs before git commit to catch accessibility issues early
 * 
 * Checks:
 * 1. HTML validation (HTML5 syntax)
 * 2. Image alt text (no missing alt attributes)
 * 3. Heading hierarchy (no skipped levels)
 * 4. ARIA validation (no invalid ARIA attributes)
 * 5. Color contrast (basic CSS checks)
 * 
 * Usage: Automatically runs on `git commit` via Husky
 * Manual test: node .husky/pre-commit-checks.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const errors = [];
const warnings = [];

/**
 * Get staged files
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8'
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

/**
 * Check 1: HTML Validation
 */
function validateHTML(file) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for common HTML5 errors
  const checks = [
    {
      pattern: /<img[^>]+(?<!alt=")[^>]*>/gi,
      message: 'Image missing alt attribute',
      severity: 'error'
    },
    {
      pattern: /<(div|span)[^>]*role="(button|link)"[^>]*(?!tabindex)/gi,
      message: 'Interactive role without tabindex',
      severity: 'error'
    },
    {
      pattern: /<(button|a)[^>]*>\s*<\/\1>/gi,
      message: 'Empty interactive element (button/link)',
      severity: 'error'
    },
    {
      pattern: /<label[^>]*(?!for=)[^>]*>/gi,
      message: 'Label without for attribute',
      severity: 'warning'
    },
    {
      pattern: /<input[^>]*type="text"[^>]*(?!aria-label|aria-labelledby|id)/gi,
      message: 'Input without label association',
      severity: 'error'
    }
  ];
  
  checks.forEach(check => {
    const matches = content.match(check.pattern);
    if (matches) {
      const issue = {
        file: file,
        message: check.message,
        count: matches.length
      };
      
      if (check.severity === 'error') {
        errors.push(issue);
      } else {
        warnings.push(issue);
      }
    }
  });
}

/**
 * Check 2: Heading Hierarchy
 */
function validateHeadings(file) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Extract heading levels
  const headingRegex = /<h([1-6])[^>]*>/gi;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(parseInt(match[1]));
  }
  
  // Check for skipped levels
  let previousLevel = 0;
  headings.forEach((level, index) => {
    if (previousLevel === 0) {
      if (level !== 1) {
        errors.push({
          file: file,
          message: `First heading should be H1, found H${level}`,
          count: 1
        });
      }
    } else if (level > previousLevel + 1) {
      errors.push({
        file: file,
        message: `Heading skip: H${previousLevel} to H${level} (should increment by 1)`,
        count: 1
      });
    }
    previousLevel = level;
  });
  
  // Check for multiple H1s
  const h1Count = headings.filter(h => h === 1).length;
  if (h1Count > 1) {
    errors.push({
      file: file,
      message: `Multiple H1 headings found (${h1Count}). Page should have only one H1.`,
      count: h1Count
    });
  }
}

/**
 * Check 3: ARIA Validation
 */
function validateARIA(file) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Valid ARIA attributes
  const validARIA = [
    'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy',
    'aria-checked', 'aria-controls', 'aria-current', 'aria-describedby',
    'aria-details', 'aria-disabled', 'aria-dropeffect', 'aria-errormessage',
    'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup',
    'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label',
    'aria-labelledby', 'aria-level', 'aria-live', 'aria-modal',
    'aria-multiline', 'aria-multiselectable', 'aria-orientation',
    'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed',
    'aria-readonly', 'aria-relevant', 'aria-required', 'aria-roledescription',
    'aria-rowcount', 'aria-rowindex', 'aria-rowspan', 'aria-selected',
    'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin',
    'aria-valuenow', 'aria-valuetext', 'role'
  ];
  
  // Extract all aria-* attributes
  const ariaRegex = /(aria-[\w-]+|role)="[^"]*"/gi;
  let match;
  
  while ((match = ariaRegex.exec(content)) !== null) {
    const attr = match[1];
    if (!validARIA.includes(attr)) {
      errors.push({
        file: file,
        message: `Invalid or deprecated ARIA attribute: ${attr}`,
        count: 1
      });
    }
  }
  
  // Check for aria-labelledby without matching ID
  const labelledbyRegex = /aria-labelledby="([^"]+)"/gi;
  while ((match = labelledbyRegex.exec(content)) !== null) {
    const ids = match[1].split(' ');
    ids.forEach(id => {
      if (!content.includes(`id="${id}"`)) {
        warnings.push({
          file: file,
          message: `aria-labelledby references non-existent ID: ${id}`,
          count: 1
        });
      }
    });
  }
}

/**
 * Check 4: Color Contrast in CSS
 */
function validateCSS(file) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Basic check for color declarations without explicit contrast
  // This is a simple heuristic - real contrast checking needs computed values
  
  // Warn about hardcoded light colors on light backgrounds
  const lightTextColors = /#[cdef][cdef][cdef][cdef][cdef][cdef]|#[cdef]{3}|rgba?\([2-9]\d{2}/gi;
  const lightBgPattern = /background(-color)?:\s*(#[cdef]|white|#fff)/gi;
  
  const hasLightText = lightTextColors.test(content);
  const hasLightBg = lightBgPattern.test(content);
  
  if (hasLightText && hasLightBg) {
    warnings.push({
      file: file,
      message: 'Potential low contrast: light text on light background. Verify with contrast checker.',
      count: 1
    });
  }
  
  // Check for !important on color (discourages accessible overrides)
  if (content.includes('color:') && content.includes('!important')) {
    warnings.push({
      file: file,
      message: '!important on color property prevents user stylesheet overrides',
      count: 1
    });
  }
}

/**
 * Check 5: Markdown Accessibility
 */
function validateMarkdown(file) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for images without alt text in markdown
  const imageRegex = /!\[\s*\]\([^)]+\)/g;
  const emptyAlts = content.match(imageRegex);
  if (emptyAlts) {
    errors.push({
      file: file,
      message: `Markdown images with empty alt text: ${emptyAlts.length} found`,
      count: emptyAlts.length
    });
  }
  
  // Check for "click here" links
  const clickHereRegex = /\[(click here|read more|more|here)\]\(/gi;
  const badLinks = content.match(clickHereRegex);
  if (badLinks) {
    warnings.push({
      file: file,
      message: 'Non-descriptive link text ("click here", "read more"). Use descriptive text.',
      count: badLinks.length
    });
  }
  
  // Check frontmatter for required accessibility fields
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const frontmatterMatch = content.match(frontmatterRegex);
  
  if (frontmatterMatch && file.includes('_posts')) {
    const frontmatter = frontmatterMatch[1];
    
    if (!frontmatter.includes('excerpt:')) {
      warnings.push({
        file: file,
        message: 'Blog post missing excerpt (required for SEO and screen readers)',
        count: 1
      });
    }
    
    if (frontmatter.includes('image:') && !frontmatter.includes('image_alt:')) {
      errors.push({
        file: file,
        message: 'Post has image but missing image_alt frontmatter',
        count: 1
      });
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`\n${colors.cyan}🔍 Running pre-commit accessibility checks...${colors.reset}\n`);
  
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log(`${colors.yellow}No staged files to check${colors.reset}`);
    return 0;
  }
  
  const filesToCheck = stagedFiles.filter(file =>
    file.endsWith('.html') ||
    file.endsWith('.md') ||
    file.endsWith('.css') ||
    file.includes('_includes/') ||
    file.includes('_layouts/')
  );
  
  if (filesToCheck.length === 0) {
    console.log(`${colors.green}✓ No accessibility-relevant files changed${colors.reset}\n`);
    return 0;
  }
  
  console.log(`Checking ${filesToCheck.length} files...\n`);
  
  filesToCheck.forEach(file => {
    if (!fs.existsSync(file)) return; // File might be deleted
    
    try {
      if (file.endsWith('.html')) {
        validateHTML(file);
        validateHeadings(file);
        validateARIA(file);
      } else if (file.endsWith('.md')) {
        validateMarkdown(file);
      } else if (file.endsWith('.css')) {
        validateCSS(file);
      }
    } catch (e) {
      warnings.push({
        file: file,
        message: `Error processing file: ${e.message}`,
        count: 1
      });
    }
  });
  
  // Print results
  console.log('═══════════════════════════════════════════════\n');
  
  if (errors.length > 0) {
    console.log(`${colors.red}❌ ERRORS (${errors.length}):${colors.reset}\n`);
    errors.forEach(err => {
      console.log(`  ${colors.red}✗${colors.reset} ${err.file}`);
      console.log(`    ${err.message}`);
      if (err.count > 1) console.log(`    ${colors.yellow}(${err.count} occurrences)${colors.reset}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  WARNINGS (${warnings.length}):${colors.reset}\n`);
    warnings.slice(0, 10).forEach(warn => {
      console.log(`  ${colors.yellow}!${colors.reset} ${warn.file}`);
      console.log(`    ${warn.message}`);
    });
    if (warnings.length > 10) {
      console.log(`  ... and ${warnings.length - 10} more warnings\n`);
    }
    console.log('');
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}✅ All accessibility checks passed!${colors.reset}\n`);
    return 0;
  }
  
  if (errors.length > 0) {
    console.log(`${colors.red}Commit blocked: Fix errors above before committing${colors.reset}`);
    console.log(`${colors.cyan}Hint: See docs/CONTENT_ACCESSIBILITY_GUIDE.md for guidance${colors.reset}\n`);
    return 1;
  }
  
  // Warnings don't block commit
  console.log(`${colors.yellow}Warnings found but commit allowed. Consider fixing them.${colors.reset}\n`);
  return 0;
}

// Run and exit with appropriate code
if (require.main === module) {
  process.exit(main());
}

module.exports = { validateHTML, validateHeadings, validateARIA, validateMarkdown };
