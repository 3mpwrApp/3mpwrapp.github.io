# Accessibility Color System - Implementation Guide

## 🚀 Quick Start

### 1. Replace Old Color System

**Remove these files** (they conflict with the new system):
```bash
# Old, conflicting files:
- assets/css/theme-modes.css (old system)
- src/styles/design-tokens.css (old system)
```

**Add the new file** to your site layout:
```html
<!-- In _layouts/default.html or <head> section -->
<link rel="stylesheet" href="{{ '/assets/css/accessibility-tokens.css' | relative_url }}">
```

---

## 🎨 Using the New Token System

### Basic Usage

All color tokens now follow this pattern:

```css
/* Light mode tokens: --light-* */
/* Dark mode tokens: --dark-* */
/* Generic tokens (automatically switch): --* */
```

### Example: Styling a Button

**OLD WAY** (causes mode-switching issues):
```css
button {
  background: #0056b3; /* Hard-coded */
  color: white; /* Hard-coded */
}

body[data-theme="dark"] button {
  background: #4a7dba; /* Easy to forget! */
  color: white;
}
```

**NEW WAY** (automatically switches):
```css
button {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
}

button:hover {
  background: var(--btn-primary-hover);
}
```

---

## 📦 Available Token Categories

### 1. Background Colors
```css
--bg-primary      /* Main page background */
--bg-secondary    /* Cards, panels */
--bg-tertiary     /* Subtle sections */
--bg-overlay      /* Semi-transparent overlays */
```

**Example:**
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
}
```

### 2. Text Colors
```css
--text-primary    /* Main body text */
--text-secondary  /* Less important text */
--text-tertiary   /* Captions, hints */
--text-muted      /* Disabled or placeholder */
--text-disabled   /* Truly disabled state */
```

**Example:**
```css
h1 {
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
}

.caption {
  color: var(--text-tertiary);
}
```

### 3. Link Colors
```css
--link-default    /* Normal link */
--link-hover      /* Hover state */
--link-visited    /* Visited link */
--link-active     /* Being clicked */
```

**Example:**
```css
a {
  color: var(--link-default);
  text-decoration: none;
}

a:hover {
  color: var(--link-hover);
  text-decoration: underline;
}

a:visited {
  color: var(--link-visited);
}

a:active {
  color: var(--link-active);
}
```

### 4. Border Colors
```css
--border-default  /* Standard borders */
--border-focus    /* Focus indicators */
--border-error    /* Error states */
```

**Example:**
```css
input {
  border: 1px solid var(--border-default);
}

input:focus {
  border-color: var(--border-focus);
  outline: 2px solid var(--focus-outline);
}

input.error {
  border-color: var(--border-error);
}
```

### 5. Button Colors
```css
/* Primary buttons */
--btn-primary-bg
--btn-primary-text
--btn-primary-hover

/* Secondary buttons */
--btn-secondary-bg
--btn-secondary-text
--btn-secondary-hover

/* Outline buttons */
--btn-outline-bg
--btn-outline-border
--btn-outline-text
```

**Example:**
```css
.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
}

.btn-primary:hover {
  background: var(--btn-primary-hover);
}

.btn-secondary {
  background: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
}

.btn-outline {
  background: var(--btn-outline-bg);
  color: var(--btn-outline-text);
  border: 2px solid var(--btn-outline-border);
}
```

### 6. Status Colors (Success, Warning, Error, Info)
```css
/* Success (green) */
--success-bg
--success-text
--success-border

/* Warning (yellow) */
--warning-bg
--warning-text
--warning-border

/* Error (red) */
--error-bg
--error-text
--error-border

/* Info (blue) */
--info-bg
--info-text
--info-border
```

**Example:**
```css
.alert-success {
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.alert-warning {
  background: var(--warning-bg);
  color: var(--warning-text);
  border: 1px solid var(--warning-border);
}

.alert-error {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
}

.alert-info {
  background: var(--info-bg);
  color: var(--info-text);
  border: 1px solid var(--info-border);
}
```

### 7. Form Colors
```css
--input-bg
--input-border
--input-text
--input-placeholder
--input-focus-border
--input-disabled-bg
--input-disabled-text
```

**Example:**
```css
input,
textarea,
select {
  background: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--input-border);
}

input::placeholder {
  color: var(--input-placeholder);
}

input:focus {
  border-color: var(--input-focus-border);
  outline: 2px solid var(--focus-outline);
  outline-offset: 2px;
}

input:disabled {
  background: var(--input-disabled-bg);
  color: var(--input-disabled-text);
  cursor: not-allowed;
}
```

### 8. Focus & Interaction
```css
--focus-outline   /* Focus outline color */
--focus-shadow    /* Focus box-shadow value */
--hover-bg        /* Hover background */
--active-bg       /* Active/pressed background */
```

**Example:**
```css
button:focus-visible {
  outline: 3px solid var(--focus-outline);
  outline-offset: 2px;
  box-shadow: var(--focus-shadow);
}

.nav-item:hover {
  background: var(--hover-bg);
}

.nav-item:active {
  background: var(--active-bg);
}
```

---

## 🔄 Migration Examples

### Example 1: Converting Navigation

**OLD CODE:**
```css
.nav {
  background: #ffffff;
  color: #222;
}

body[data-theme="dark"] .nav {
  background: #111a2b;
  color: #f2f5f9;
}

.nav a {
  color: #0056b3;
}

body[data-theme="dark"] .nav a {
  color: #a8c7ff;
}
```

**NEW CODE:**
```css
.nav {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.nav a {
  color: var(--link-default);
}

.nav a:hover {
  background: var(--hover-bg);
}
```

### Example 2: Converting Forms

**OLD CODE:**
```css
input {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

body[data-theme="dark"] input {
  background: #1a2332;
  color: #f2f5f9;
  border: 1px solid #355c7d;
}

input:focus {
  border-color: #0056b3;
}

body[data-theme="dark"] input:focus {
  border-color: #4a7dba;
}
```

**NEW CODE:**
```css
input {
  background: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--input-border);
}

input:focus {
  border-color: var(--input-focus-border);
  outline: 2px solid var(--focus-outline);
  outline-offset: 2px;
}
```

### Example 3: Converting Status Messages

**OLD CODE:**
```css
.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

body[data-theme="dark"] .success {
  background: #0d3d1f;
  color: #7dffb3;
  border: 1px solid #1a5c2e;
}
```

**NEW CODE:**
```css
.success {
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}
```

---

## ⚠️ Common Pitfalls to Avoid

### ❌ DON'T: Mix old and new tokens
```css
/* BAD */
.element {
  background: var(--bg-color); /* Old token */
  color: var(--text-primary);  /* New token */
}
```

### ✅ DO: Use only new tokens
```css
/* GOOD */
.element {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### ❌ DON'T: Hard-code colors
```css
/* BAD */
.button {
  background: #0056b3;
  color: white;
}
```

### ✅ DO: Use tokens
```css
/* GOOD */
.button {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
}
```

### ❌ DON'T: Rely on color alone
```html
<!-- BAD -->
<div class="error">Error</div>
```

### ✅ DO: Combine color with icon and text
```html
<!-- GOOD -->
<div class="error" role="alert" aria-live="assertive">
  <svg aria-hidden="true" class="icon-error">
    <use xlink:href="#icon-error"></use>
  </svg>
  <span>Error: Please correct the highlighted fields</span>
</div>
```

### ❌ DON'T: Use low-contrast fallbacks
```css
/* BAD */
color: var(--text-color, #666); /* Falls back to AA-only */
```

### ✅ DO: Use AAA-compliant fallbacks
```css
/* GOOD */
color: var(--text-secondary, #212529); /* Falls back to AAA */
```

---

## 🧪 Testing Your Changes

### Quick Test Checklist

After implementing the new tokens:

1. **Visual Check**:
   ```
   ✅ Open site in light mode
   ✅ Switch to dark mode (Ctrl+Shift+D)
   ✅ Switch to high contrast mode
   ✅ Verify all text is readable
   ```

2. **Contrast Check**:
   ```
   ✅ Use WebAIM Contrast Checker
   ✅ Check body text: Should be 7:1+
   ✅ Check links: Should be 7:1+
   ✅ Check buttons: Should be 7:1+
   ```

3. **Browser Check**:
   ```
   ✅ Test in Chrome
   ✅ Test in Firefox
   ✅ Test in Safari
   ✅ Test in Edge
   ```

4. **Device Check**:
   ```
   ✅ Test on mobile (375px)
   ✅ Test on tablet (768px)
   ✅ Test on desktop (1920px)
   ```

---

## 📚 Complete Token Reference

### All Available Tokens

```css
/* Backgrounds */
--bg-primary
--bg-secondary
--bg-tertiary
--bg-overlay

/* Text */
--text-primary
--text-secondary
--text-tertiary
--text-muted
--text-disabled

/* Links */
--link-default
--link-hover
--link-visited
--link-active

/* Borders */
--border-default
--border-focus
--border-error

/* Buttons - Primary */
--btn-primary-bg
--btn-primary-text
--btn-primary-hover

/* Buttons - Secondary */
--btn-secondary-bg
--btn-secondary-text
--btn-secondary-hover

/* Buttons - Outline */
--btn-outline-bg
--btn-outline-border
--btn-outline-text

/* Status - Success */
--success-bg
--success-text
--success-border

/* Status - Warning */
--warning-bg
--warning-text
--warning-border

/* Status - Error */
--error-bg
--error-text
--error-border

/* Status - Info */
--info-bg
--info-text
--info-border

/* Focus & Interaction */
--focus-outline
--focus-shadow
--hover-bg
--active-bg

/* Forms */
--input-bg
--input-border
--input-text
--input-placeholder
--input-focus-border
--input-disabled-bg
--input-disabled-text
```

---

## 🔗 Next Steps

1. **Read**: ACCESSIBILITY-TESTING-GUIDE.md
2. **Implement**: Replace old tokens with new ones
3. **Test**: Follow testing checklist
4. **Document**: Record any issues
5. **Deploy**: Push changes with confidence

---

**Need Help?**
- Review: ACCESSIBILITY-TESTING-GUIDE.md
- Contact: empowrapp08162025@gmail.com
- File an issue: GitHub Issues

**Last Updated**: October 26, 2025
