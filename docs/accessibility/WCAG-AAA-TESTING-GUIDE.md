# WCAG 2.2 AAA Testing Guide
## 3mpwrApp Website - Comprehensive Accessibility Testing Procedures

---

## Table of Contents
1. [Pre-Testing Setup](#pre-testing-setup)
2. [Automated Testing](#automated-testing)
3. [Manual Testing](#manual-testing)
4. [Screen Reader Testing](#screen-reader-testing)
5. [Keyboard Navigation Testing](#keyboard-navigation-testing)
6. [Color & Contrast Testing](#color--contrast-testing)
7. [Form Testing](#form-testing)
8. [Reporting Issues](#reporting-issues)

---

## Pre-Testing Setup

### Required Tools

#### Free Tools (Essential)
- **Web Browser**: Latest Chrome, Firefox, or Edge
- **NVDA Screen Reader** (Windows): https://www.nvaccess.org/
- **Browser Extensions**:
  - WAVE Evaluation Tool: https://wave.webaim.org/extension/
  - axe DevTools: https://www.deque.com/axe/devtools/
  - Accessibility Insights: https://accessibilityinsights.io/

#### Online Tools
- W3C HTML Validator: https://validator.w3.org/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color Contrast Analyzer: https://www.tpgi.com/color-contrast-checker/

#### Built-in Tools
- **VoiceOver** (Mac): Cmd+F5
- **Narrator** (Windows): Win+Ctrl+Enter
- **Browser DevTools**: F12 → Lighthouse → Accessibility Audit

---

## Automated Testing

### 1. W3C HTML Validation

**Purpose**: Ensure valid HTML5 markup

**Steps**:
1. Go to https://validator.w3.org/
2. Enter URL: `https://3mpwrapp.pages.dev/`
3. Click "Check"
4. Review errors and warnings
5. Repeat for each major page

**Pages to Test**:
- [ ] Homepage (/)
- [ ] About (/about)
- [ ] Features (/features)
- [ ] User Guide (/user-guide)
- [ ] Accessibility (/accessibility)
- [ ] Contact (/contact)
- [ ] Privacy (/privacy)
- [ ] Terms (/terms)
- [ ] 404 Page (/404.html)
- [ ] Offline Page (/offline.html)

**Expected Results**:
- ✅ No errors
- ⚠️ Warnings are acceptable if justified

---

### 2. Lighthouse Accessibility Audit

**Purpose**: Quick automated accessibility check

**Steps**:
1. Open page in Chrome
2. Press F12 to open DevTools
3. Click "Lighthouse" tab
4. Select:
   - ☑️ Accessibility
   - ☑️ Best Practices
   - ☑️ SEO
5. Click "Analyze page load"
6. Review results

**Target Scores**:
- Accessibility: 100/100
- Best Practices: 95+/100
- SEO: 95+/100

**Common Issues to Check**:
- [ ] Color contrast
- [ ] ARIA attributes
- [ ] Alt text on images
- [ ] Form labels
- [ ] Heading order
- [ ] Link names

---

### 3. WAVE Browser Extension

**Purpose**: Visual accessibility evaluation

**Steps**:
1. Install WAVE extension
2. Navigate to page to test
3. Click WAVE icon in toolbar
4. Review results in sidebar

**Check For**:
- 🔴 **Errors** (must fix): 0 errors
- 🟡 **Alerts** (review carefully)
- ✅ **Features** (good accessibility features detected)
- 🔧 **Structural Elements** (headings, landmarks, etc.)
- ⚖️ **Contrast** (all elements pass AAA)

---

### 4. axe DevTools

**Purpose**: Detailed accessibility issue detection

**Steps**:
1. Install axe DevTools extension
2. Open DevTools (F12)
3. Click "axe DevTools" tab
4. Click "Scan ALL of my page"
5. Review issues by severity

**Issue Priorities**:
1. **Critical**: Must fix immediately
2. **Serious**: Fix as soon as possible
3. **Moderate**: Important to fix
4. **Minor**: Nice to fix

**Test Categories**:
- [ ] WCAG 2.0 Level A
- [ ] WCAG 2.0 Level AA
- [ ] WCAG 2.1 Level A
- [ ] WCAG 2.1 Level AA
- [ ] WCAG 2.2 Level A
- [ ] WCAG 2.2 Level AA
- [ ] Best Practices

---

## Manual Testing

### 1. Heading Structure

**Purpose**: Ensure logical heading hierarchy

**Steps**:
1. Use WAVE or HeadingsMap extension
2. Check heading order: H1 → H2 → H3 (no skips)
3. Verify only ONE H1 per page
4. Ensure headings describe content

**Checklist**:
- [ ] One H1 (page title)
- [ ] H2s for main sections
- [ ] H3s for subsections
- [ ] No skipped levels (H1 → H3)
- [ ] Headings are descriptive

---

### 2. Landmark Regions

**Purpose**: Ensure proper page structure for screen readers

**Required Landmarks**:
- [ ] `<header role="banner">` - Site header
- [ ] `<nav aria-label="Primary">` - Main navigation
- [ ] `<main role="main">` - Main content
- [ ] `<footer role="contentinfo">` - Site footer

**Optional Landmarks**:
- [ ] `<aside>` - Complementary content
- [ ] `<section>` - Thematic grouping
- [ ] `<nav aria-label="Breadcrumb">` - Breadcrumbs

**Testing**:
- Use WAVE to visualize landmarks
- Navigate with screen reader landmarks (NVDA: D key)

---

### 3. Link Purpose

**Purpose**: Ensure all links have clear purpose (WCAG 2.4.9 AAA)

**Check**:
- [ ] No "click here" or "read more" without context
- [ ] Links describe destination
- [ ] External links indicated (visually and programmatically)
- [ ] Multiple links with same text go to same place

**Bad Example**:
```html
<a href="/features">Click here</a> to learn about features.
```

**Good Example**:
```html
<a href="/features">Learn about our features</a>
```

---

### 4. Images & Alternative Text

**Purpose**: Ensure all images have appropriate alt text

**Test Each Image**:
1. Turn off images in browser
2. Or use WAVE to view alt text
3. Or use screen reader to hear alt text

**Rules**:
- **Informative images**: Descriptive alt text
- **Decorative images**: `alt=""` (empty)
- **Complex images**: Long description via `aria-describedby`
- **Linked images**: Alt describes link destination

**Examples**:
```html
<!-- Informative -->
<img src="chart.png" alt="Bar chart showing 50% increase in user signups">

<!-- Decorative -->
<img src="divider.png" alt="" aria-hidden="true">

<!-- Linked -->
<a href="/features">
  <img src="icon.png" alt="View features page">
</a>
```

---

## Screen Reader Testing

### NVDA Setup (Windows)

**Installation**:
1. Download: https://www.nvaccess.org/download/
2. Install with default settings
3. Start: Ctrl+Alt+N

**Basic Commands**:
- **Toggle on/off**: Ctrl+Alt+N
- **Stop reading**: Ctrl
- **Read next**: Down Arrow
- **Read previous**: Up Arrow
- **Next heading**: H
- **Next landmark**: D
- **Next link**: K
- **Next form field**: F
- **List links**: Insert+F7
- **List headings**: Insert+F7, then Arrow

### VoiceOver Setup (Mac)

**Activation**:
- Enable: Cmd+F5 (or Settings → Accessibility → VoiceOver)
- Rotor: Ctrl+Option+U

**Basic Commands**:
- **Next item**: Ctrl+Option+Right Arrow
- **Previous item**: Ctrl+Option+Left Arrow
- **Next heading**: Ctrl+Option+Cmd+H
- **Click element**: Ctrl+Option+Space
- **Navigate Web Rotor**: Ctrl+Option+U

### Testing Procedure

1. **Start at top of page**
2. **Listen to page title** - Should make sense
3. **Navigate headings** (H key in NVDA)
   - Check logical structure
   - Verify all headings make sense
4. **Navigate landmarks** (D key in NVDA)
   - Banner, navigation, main, footer
5. **Navigate links** (K key in NVDA)
   - All links have clear purpose
   - No "click here" without context
6. **Navigate forms** (F key in NVDA)
   - All fields have labels
   - Required fields announced
   - Error messages read correctly
7. **Read page content**
   - All text makes sense
   - Alt text on images appropriate
   - Tables have proper structure

**Test All Key Pages**:
- [ ] Homepage
- [ ] About page
- [ ] Features page
- [ ] User guide
- [ ] Contact form
- [ ] Accessibility settings

---

## Keyboard Navigation Testing

### Purpose
Ensure all functionality is available via keyboard (WCAG 2.1.1, 2.1.3)

### Basic Keyboard Commands

| Key | Action |
|-----|--------|
| **Tab** | Move to next focusable element |
| **Shift+Tab** | Move to previous focusable element |
| **Enter** | Activate link or button |
| **Space** | Activate button, toggle checkbox |
| **Arrow Keys** | Navigate within components (menus, radio groups) |
| **Esc** | Close dialog/modal |
| **Home/End** | Jump to start/end (in some components) |

### Testing Procedure

#### 1. Tab Through Entire Page
**Steps**:
1. Click in address bar
2. Press Tab repeatedly
3. Watch focus indicator move
4. Tab through ENTIRE page

**Check**:
- [ ] Focus indicator always visible (3px yellow outline)
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] No keyboard traps (can tab forwards and backwards)
- [ ] All interactive elements reachable
- [ ] Focus never disappears

#### 2. Skip Links
**Test**:
1. Refresh page
2. Press Tab once
3. Should see "Skip to content" link
4. Press Enter
5. Focus moves to main content

**Expected**:
- [ ] Skip link appears on first Tab
- [ ] Skip link is keyboard accessible
- [ ] Activating skip link moves focus
- [ ] Multiple skip links available

#### 3. Navigation Menu
**Desktop**:
- [ ] Tab to each menu item
- [ ] Enter activates link
- [ ] Focus indicator visible

**Mobile**:
- [ ] Tab to menu button
- [ ] Enter/Space opens menu
- [ ] Tab through menu items
- [ ] Esc closes menu
- [ ] Focus returns to menu button

#### 4. Buttons & Interactive Elements
**Test Each Button**:
- [ ] Reachable by Tab
- [ ] Focus indicator visible
- [ ] Enter or Space activates
- [ ] Action occurs
- [ ] No mouse required

**Interactive Elements to Test**:
- [ ] Theme toggle
- [ ] Contrast toggle
- [ ] Language switcher
- [ ] Newsletter subscribe
- [ ] Cookie consent
- [ ] Accessibility toolbar buttons
- [ ] Back to top button

#### 5. Forms
**Test Each Form**:
1. Tab to first field
2. Enter data
3. Tab to next field
4. Submit with Enter (on button)

**Check**:
- [ ] All fields reachable
- [ ] Labels visible and announced
- [ ] Required fields indicated
- [ ] Error messages keyboard accessible
- [ ] Submit button keyboard accessible

#### 6. Modals/Dialogs
**Test Each Modal**:
1. Open modal (keyboard)
2. Try to Tab outside modal
3. Press Esc

**Expected**:
- [ ] Focus trapped in modal (can't tab outside)
- [ ] Tab cycles through modal elements
- [ ] Esc closes modal
- [ ] Focus returns to trigger element
- [ ] Close button keyboard accessible

**Modals to Test**:
- [ ] Newsletter signup
- [ ] Cookie preferences

#### 7. Custom Interactive Components
**Test Accessibility Toolbar**:
- [ ] Tab to toolbar toggle
- [ ] Enter/Space opens toolbar
- [ ] Tab through all buttons
- [ ] Enter/Space activates features
- [ ] Settings controls keyboard accessible

**Test Features**:
- [ ] Need a break button
- [ ] Pain flare mode
- [ ] Overwhelmed mode
- [ ] Freeze animations
- [ ] All dropdowns
- [ ] All checkboxes
- [ ] Spoon counter reset

---

## Color & Contrast Testing

### Purpose
Ensure all text meets 7:1 contrast ratio (AAA) or 4.5:1 for large text

### Tools

#### WebAIM Contrast Checker
1. Go to: https://webaim.org/resources/contrastchecker/
2. Enter foreground color (text)
3. Enter background color
4. Check ratios

**AAA Requirements**:
- **Normal text** (< 18pt): 7:1 contrast
- **Large text** (≥ 18pt or ≥ 14pt bold): 4.5:1 contrast

#### Color Contrast Analyzer (Desktop App)
1. Download: https://www.tpgi.com/color-contrast-checker/
2. Use eyedropper to select colors
3. View real-time contrast results

### Elements to Test

#### Text Elements
- [ ] Body text on white background
- [ ] Body text on colored backgrounds
- [ ] Link text (default state)
- [ ] Link text (hover state)
- [ ] Link text (visited state)
- [ ] Headings
- [ ] Button text
- [ ] Navigation links

#### Background Gradients
**Gradient Banners**:
- [ ] `.gradient-banner` - Purple gradient with white text
- [ ] `.gradient-banner-pink` - Pink gradient with white text
- [ ] `.status-banner` - Green gradient with white text
- [ ] `.beta-cta` - Purple gradient with white text

**Test At**:
- Lightest point of gradient
- Darkest point of gradient
- Midpoint of gradient

#### Dark Mode
**Test All Colors In**:
- [ ] Dark theme
- [ ] High contrast mode
- [ ] Windows High Contrast

#### Non-Text Contrast
**UI Components** (3:1 minimum):
- [ ] Form input borders
- [ ] Button borders
- [ ] Focus indicators
- [ ] Icons
- [ ] Graph/chart elements

### Color Independence

**Test**: Remove all color
- Use browser extension to force grayscale
- Or: Developer Tools → Rendering → Emulate vision deficiencies

**Check**:
- [ ] Information not conveyed by color alone
- [ ] Required fields marked with asterisk (*) not just red
- [ ] Error messages have icons not just red text
- [ ] Links distinguishable (underlined)
- [ ] Graph/chart data labeled, not just colored

### Color Vision Deficiency Testing

**Test With**:
- Chrome DevTools → Rendering → Emulate vision deficiencies
  - Protanopia (red-blind)
  - Deuteranopia (green-blind)
  - Tritanopia (blue-blind)
  - Achromatopsia (no color)

**Check**:
- [ ] Content still understandable
- [ ] Important information still visible
- [ ] Warnings/errors still noticeable
- [ ] Links still identifiable

---

## Form Testing

### Purpose
Ensure all forms are accessible (WCAG 3.3.1, 3.3.2, 3.3.3, 3.3.5, 3.3.6)

### Forms to Test
- [ ] Newsletter signup
- [ ] Contact form
- [ ] Search
- [ ] Cookie preferences
- [ ] Accessibility settings
- [ ] Beta signup form (external)

### Checklist for Each Form

#### Labels & Instructions
- [ ] All inputs have visible labels
- [ ] Labels programmatically associated (`<label for="id">`)
- [ ] Instructions provided before form
- [ ] Required fields clearly marked
- [ ] Format requirements explained (e.g., "MM/DD/YYYY")

#### Error Handling
**Test**: Submit form with errors
- [ ] Error message displayed
- [ ] Error message programmatically associated (`aria-describedby`)
- [ ] Focus moved to first error
- [ ] Errors listed at top of form
- [ ] Each error has link to field
- [ ] Error describes problem clearly
- [ ] Error suggests how to fix

**Example Good Error**:
```html
<label for="email">Email Address</label>
<input 
  id="email" 
  type="email" 
  aria-describedby="email-error" 
  aria-invalid="true"
>
<span id="email-error" role="alert">
  Please enter a valid email address (e.g., name@example.com)
</span>
```

#### Success Messages
- [ ] Success message displayed
- [ ] Success announced to screen readers (`role="status"` or `role="alert"`)
- [ ] Success message visible and clear

#### Help Text (WCAG 3.3.5 AAA)
- [ ] Context-sensitive help available
- [ ] Help accessible before filling field
- [ ] Help explains expected input

#### Confirmation (WCAG 3.3.6 AAA)
For actions that are:
- Legal commitments
- Financial transactions
- Test responses
- Data deletion

**Required** (choose one):
- [ ] Reversible (can undo)
- [ ] Checked (review before submit)
- [ ] Confirmed (confirmation step)

### Keyboard Testing
- [ ] All fields keyboard accessible
- [ ] Tab order logical
- [ ] Can submit with keyboard (Enter on button)
- [ ] Radio buttons navigate with arrows
- [ ] Checkboxes toggle with Space
- [ ] Dropdowns navigate with arrows

### Screen Reader Testing
- [ ] All labels read correctly
- [ ] Required fields announced
- [ ] Error messages announced
- [ ] Help text announced
- [ ] Form purpose clear

---

## Reporting Issues

### Issue Documentation Template

```markdown
## Issue: [Brief Description]

**WCAG Criterion**: [e.g., 1.4.6 Contrast (Enhanced) - Level AAA]

**Page/Component**: [e.g., Homepage - Gradient Banner]

**Description**:
[Detailed description of the issue]

**Current Behavior**:
[What currently happens]

**Expected Behavior**:
[What should happen]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Impact**:
- [ ] Blocker (prevents access)
- [ ] Major (significantly impacts UX)
- [ ] Minor (small inconvenience)

**Affected Users**:
- [ ] Blind users
- [ ] Low vision users
- [ ] Motor disability users
- [ ] Cognitive disability users
- [ ] Deaf/hard-of-hearing users

**Screenshot/Recording**:
[Attach if applicable]

**Suggested Fix**:
[How to fix the issue]

**Priority**:
- [ ] Critical (fix immediately)
- [ ] High (fix within 1 week)
- [ ] Medium (fix within 2 weeks)
- [ ] Low (fix when possible)
```

### Where to Report

**Internal Team**:
- Create issue in project management system
- Tag with "accessibility" label
- Assign to appropriate team member

**External Feedback**:
- **Email**: empowrapp08162025@gmail.com
- **Subject**: "Accessibility Issue - [Page Name]"
- Include all details from template

---

## Testing Schedule

### Initial Audit
- [ ] Week 1: Automated testing (all tools)
- [ ] Week 2: Manual testing (keyboard, screen reader)
- [ ] Week 3: Color contrast verification
- [ ] Week 4: Form testing and documentation

### Ongoing Testing
- **After every major update**: Full accessibility audit
- **Monthly**: Spot checks on key pages
- **Quarterly**: Comprehensive audit
- **Annually**: Third-party accessibility audit

### New Content/Features
Before publishing:
- [ ] Run automated tests
- [ ] Keyboard navigation test
- [ ] Screen reader spot check
- [ ] Color contrast verification

---

## Success Criteria

### Ready to Publish Checklist

A page/feature is ready when:
- [ ] No errors in W3C Validator
- [ ] Lighthouse accessibility score: 100/100
- [ ] WAVE shows 0 errors
- [ ] axe DevTools shows 0 critical/serious issues
- [ ] All text meets 7:1 contrast (AAA)
- [ ] Fully keyboard accessible
- [ ] Screen reader announces correctly
- [ ] Focus indicators always visible
- [ ] All forms have labels and error handling
- [ ] All images have appropriate alt text

### WCAG 2.2 AAA Conformance

**Target**: Meet ALL Level A, AA, and AAA success criteria

**Current Status**: ~77% AAA compliance  
**Goal**: 100% AAA compliance

**Exceptions**: Document any legitimate exceptions with justification

---

## Training Resources

### Learn WCAG
- [W3C WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM WCAG 2.2 Checklist](https://webaim.org/standards/wcag/checklist)
- [Deque University](https://dequeuniversity.com/) (paid courses)

### Screen Reader Tutorials
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [WebAIM Screen Reader Guide](https://webaim.org/articles/screenreader_testing/)

### Videos
- [A11ycasts by Google](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g)
- [WebAIM YouTube Channel](https://www.youtube.com/user/WebAIMorg)

---

## Contact

**Accessibility Team**: empowrapp08162025@gmail.com  
**Response Time**: 2 business days  
**Accessibility Statement**: https://3mpwrapp.pages.dev/accessibility

---

*Last Updated: November 5, 2025*  
*Version: 1.0*
