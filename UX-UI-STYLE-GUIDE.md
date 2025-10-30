# UX/UI Consistency Style Guide

## Overview
This style guide ensures consistency across all pages of 3mpwrApp website. Every page should follow these standards for a professional, clean, and organized user experience.

---

## Page Structure

### Required Elements (Every Page)

1. **Front Matter** (YAML)
   ```yaml
   ---
   layout: default
   title: Page Title
   description: Clear, concise description (150-160 characters)
   ---
   ```

2. **Status Banner** (Top of content)
   ```html
   {%- include status-banner.html -%}
   ```

3. **Page Title** (H1)
   ```markdown
   # Page Title
   ```

4. **Reading Information**
   ```markdown
   📖 **X minute read** | 🔋 **Energy:** Light/Medium/Heavy
   ```

5. **Page Feedback** (Bottom of content)
   ```html
   {%- include page-feedback.html -%}
   ```

### Optional Elements

- **TL;DR Box**: For long pages (>1000 words)
- **Table of Contents**: For pages with 5+ sections
- **Alternative Formats**: PDF, print-friendly, email options
- **Crisis Resources**: For sensitive topics
- **Energy Cost Indicators**: For each major section

---

## Typography

### Heading Hierarchy

**MUST FOLLOW**: Each page has exactly ONE H1, followed by H2s, then H3s, etc.

```markdown
# Main Title (H1) - Once per page
## Section Heading (H2) - Major sections
### Subsection (H3) - Within sections
#### Minor Heading (H4) - Rare, only if needed
```

### Text Formatting

- **Paragraphs**: 1.6 line height, max 80 characters wide
- **Lists**: Use bullet points (•) or numbers, consistent spacing
- **Emphasis**: 
  - `**bold**` for important terms (first use)
  - `*italic*` for subtle emphasis (rare)
  - ~~strikethrough~~ for deprecated info (with explanation)

### Font Sizes

- H1: 2.5rem (40px)
- H2: 2rem (32px)
- H3: 1.5rem (24px)
- H4: 1.25rem (20px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

---

## Colors & Contrast

### Primary Palette

- **Brand Primary**: #4f8cff (blue)
- **Brand Secondary**: #1e7e34 (green)
- **Success**: #28a745 (green)
- **Warning**: #ffc107 (yellow)
- **Error**: #dc3545 (red)
- **Info**: #17a2b8 (cyan)

### Text Colors

- **Primary Text**: #FFFFFF (dark mode), #000000 (light mode)
- **Secondary Text**: #a6adbb (dark mode), #6c757d (light mode)
- **Link Color**: #66B2FF (dark mode), #0066CC (light mode)

### Contrast Requirements

- **Normal Text**: 7:1 (WCAG AAA)
- **Large Text**: 4.5:1 (WCAG AAA)
- **Interactive Elements**: 3:1 against adjacent colors
- **Focus Indicators**: 3:1 against background

---

## Components

### Buttons

**Primary Action**
```html
<a href="/link" class="btn btn-primary">Primary Action</a>
```

**Secondary Action**
```html
<a href="/link" class="btn btn-secondary">Secondary Action</a>
```

**Requirements**:
- Minimum 44×44 CSS pixels (48×48 on mobile)
- Visible focus indicator (3px solid #FFD54F)
- Hover state (transform + shadow)
- Clear, action-oriented text
- Icon + text (not icon alone)

### Cards/Panels

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>
```

**Requirements**:
- Consistent padding (1.5rem)
- Border radius (12px)
- Subtle shadow
- Background color distinct from page

### Status Banner

```html
{%- include status-banner.html -%}
```

**Standard Text**: "Phase 1 Beta - Now Accepting Signups | Website live | Daily updates"

### Page Feedback

```html
{%- include page-feedback.html -%}
```

**Placement**: End of main content, before footer

---

## Spacing

### Consistent Scale (8px base)

- **Extra Small**: 4px (0.25rem)
- **Small**: 8px (0.5rem)
- **Medium**: 16px (1rem)
- **Large**: 24px (1.5rem)
- **Extra Large**: 32px (2rem)
- **2XL**: 48px (3rem)
- **3XL**: 64px (4rem)

### Common Patterns

- **Section Margin**: 3rem bottom
- **Paragraph Margin**: 1rem bottom
- **Component Padding**: 1.5rem all sides
- **Button Padding**: 0.75rem vertical, 1.5rem horizontal

---

## Accessibility

### ARIA Labels

**Interactive Elements**
```html
<button aria-label="Close dialog">×</button>
<a href="/link" aria-label="Learn more about accessibility">More...</a>
```

### Landmarks

```html
<header>...</header>
<nav aria-label="Primary">...</nav>
<main id="main-content">...</main>
<footer role="contentinfo">...</footer>
```

### Live Regions

```html
<div role="status" aria-live="polite">Content updated...</div>
<div role="alert" aria-live="assertive">Error occurred!</div>
```

### Focus Management

- Skip links visible on focus
- Tab order logical
- Focus never trapped (unless modal)
- Focus indicator 3px solid #FFD54F

---

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1440px

### Mobile Patterns

- Single column layout
- Touch targets 48×48 minimum
- Hamburger menu for navigation
- Stacked buttons (full width)
- Font size 16px minimum (no zoom on focus)

---

## Forms

### Structure

```html
<form>
  <label for="name">Name <span aria-label="required">*</span></label>
  <input type="text" id="name" name="name" required aria-describedby="name-help">
  <small id="name-help">Enter your full name</small>
  
  <button type="submit">Submit</button>
</form>
```

### Requirements

- Every input has associated label
- Required fields marked with `*` and aria-label
- Help text with aria-describedby
- Error messages with aria-live
- Success messages with aria-live
- Validation on submit (not on blur)

---

## Content Guidelines

### Writing Style

- **Clear**: Plain language, no jargon
- **Concise**: Short sentences and paragraphs
- **Active Voice**: "We built" not "It was built"
- **Inclusive**: "they/them" for generic pronouns
- **Empathetic**: Understanding of disability experience

### Reading Level

- Target: Grade 8-10 reading level
- Short sentences (< 20 words average)
- Short paragraphs (< 5 sentences)
- Bullet points for lists
- Headings every 2-3 paragraphs

### Inclusive Language

✅ **Use**:
- Person with disability
- Injured worker
- Accessibility features
- Alternative formats

❌ **Avoid**:
- The disabled
- Handicapped
- Special needs
- Accommodations (use "features" or "options")

---

## Images & Media

### Images

- **Alt Text**: Descriptive, not decorative
- **File Size**: < 200KB (optimize with Sharp)
- **Format**: WebP with PNG/JPG fallback
- **Dimensions**: Specified in HTML (prevent CLS)
- **Lazy Loading**: All images below fold

### Icons

- **Meaningful Icons**: Have aria-label
- **Decorative Icons**: Use aria-hidden="true"
- **Size**: Minimum 24×24 pixels
- **Touch Target**: Minimum 44×44 pixels

---

## Links

### Link Text

✅ **Good**:
- "Learn about accessibility features"
- "Download user guide (PDF, 2.5MB)"
- "Contact support team"

❌ **Bad**:
- "Click here"
- "Read more"
- "Link"

### External Links

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Site Name
</a>
```

**Visual Indicator**: ↗ added automatically via CSS

---

## Testing Checklist

### Before Publishing

- [ ] Valid HTML (W3C validator)
- [ ] No accessibility errors (axe, Pa11y)
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Mobile responsive
- [ ] Color contrast verified
- [ ] Heading hierarchy correct
- [ ] All images have alt text
- [ ] All links have descriptive text
- [ ] Forms have labels and validation
- [ ] Focus indicators visible
- [ ] Page title unique and descriptive

---

## File Naming

### Convention

- **Lowercase**: all-lowercase-with-hyphens.md
- **Descriptive**: user-guide.md not guide.md
- **No Spaces**: Use hyphens, not underscores or spaces
- **Consistent**: Same pattern across site

### Examples

✅ **Good**:
- `accessibility-settings.md`
- `crisis-resources.md`
- `user-guide.md`

❌ **Bad**:
- `Accessibility_Settings.md`
- `crisis resources.md`
- `guide.md`

---

## Maintenance

### Regular Audits

- **Daily**: Automated accessibility scans
- **Weekly**: Manual page review
- **Monthly**: Full site consistency check
- **Quarterly**: WCAG compliance audit

### Version Control

- Meaningful commit messages
- Branch naming: `feature/description` or `fix/description`
- Pull requests for all changes
- Review before merge

---

## Resources

- [Design System CSS](/assets/css/design-system.css)
- [Global Consistency CSS](/assets/css/global-consistency.css)
- [WCAG Compliance Checklist](/WCAG-COMPLIANCE-CHECKLIST.md)
- [Accessibility Guide](/accessibility)

---

**Last Updated**: October 29, 2025
**Version**: 1.0
**Status**: Active
