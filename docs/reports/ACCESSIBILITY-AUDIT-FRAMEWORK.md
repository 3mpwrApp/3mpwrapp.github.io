# Accessibility Audit Framework: WCAG 2.1 AA & 2.2 Compliance

**Document Date:** October 17, 2025  
**Standards:** WCAG 2.1 Level AA, WCAG 2.2 Level AA (with AAA recommendations)  
**Scope:** All public pages of 3mpowr App website  

---

## Executive Summary

This framework provides a systematic approach to testing, documenting, and remediating accessibility issues on the 3mpowr App website. It maps each WCAG success criterion to specific test procedures, tools, and remediation strategies.

**Key Metrics:**
- **Target:** WCAG 2.1 AA 100% compliance
- **Baseline (Current):** B+ grade per Oct 13 audit
- **Critical Gaps:** Focus appearance (2.4.11), target size (2.5.8), focus not obscured (2.4.12)
- **Timeline:** 2 weeks to remediate + 1 week verification

---

## WCAG 2.1 Success Criteria Coverage

### Perceivable

#### 1.1 Text Alternatives

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **1.1.1 Non-text Content** | A | Inspect all images/icons. Verify alt text provided & meaningful. | ✅ PASS | - |
| | | • Use axe-core: `image-alt` rule | | |
| | | • Manual: Screenshot images & verify alt text | | |
| | | • Check decorative images have empty alt="" | | |

**Test Steps:**
1. Open site in axe-core DevTools
2. Check for `image-alt` violations
3. Manually verify alt text is descriptive (not "image.png" or "button-icon")
4. Ensure decorative images have `alt=""` or `aria-hidden="true"`

**Expected Result:** Zero alt text violations

---

#### 1.2 Time-based Media

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **1.2.1 Audio-only and Video-only (Prerecorded)** | A | Check any embedded videos for captions/transcripts. | ✅ N/A (no video) | - |
| **1.2.2 Captions (Prerecorded)** | A | If embedded: verify captions present. | ✅ N/A | - |
| **1.2.3 Audio Description or Media Alternative (Prerecorded)** | A | If embedded: verify audio description. | ✅ N/A | - |

**Current Status:** N/A – No embedded audio/video on site

---

#### 1.3 Adaptable

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **1.3.1 Info and Relationships** | A | Inspect page structure in DevTools. Verify semantic HTML (headings, lists, tables). | ✅ PASS (mostly) | Add aria-describedby to modals; verify list semantics |
| | | • Check heading hierarchy (no skips: h1→h3) | | |
| | | • Run HTML validator: https://validator.w3.org/ | | |
| | | • Test with screen reader: NVDA on Windows | | |

**Test Steps:**
1. Open page source, search for `<table>`, `<h1>`, `<h2>`, etc.
2. Verify no heading skips (e.g., h1 → h3 should be h1 → h2 → h3)
3. Verify table cells use `<th>` for headers, `<td>` for data
4. Run HTML validator
5. Test with NVDA: Tab through, verify structure announced

**Issues Found & Fixes:**
- Newsletter modal should have `aria-describedby="newsletter-description"` with hidden description
- Search results should have `role="status" aria-live="polite"` for dynamic updates
- Form fields should have explicit `<label>` elements

---

#### 1.3.2 Meaningful Sequence

| **Criterion** | **Level** | **A** | Disable CSS via DevTools → verify content in reading order makes sense. | ✅ PASS | - |
|---|---|---|---|---|
| | | • Browser: DevTools → disable all styles (View Source order) | | |

**Test Steps:**
1. Open page in Chrome DevTools
2. Disable all CSS: Settings → Disable JavaScript → Reload → View Source
3. Verify reading order is logical (header → nav → main → footer)
4. Content should be understandable without visual layout

**Expected Result:** Content readable in source order

---

#### 1.3.3 Sensory Characteristics

| **Criterion** | **Level** | **A** | Instructions should not rely on shape, color, size alone. | ✅ PASS | - |
|---|---|---|---|---|
| | | • Audit: Search for instructions like "click red button" or "shape indicates error" | | |

**Test Steps:**
1. Review page content for color-only instructions
2. Check error messages include text, not just color
3. Verify form validation messages are clear

**Current Status:** ✅ All instructions include text + visual cues

---

#### 1.4 Distinguishable

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **1.4.1 Use of Color** | A | Verify information conveyed by color alone is also provided by text/icon. | ✅ PASS | - |
| **1.4.2 Audio Control** | A | If background audio: verify user can pause/stop. | ✅ N/A (no audio) | - |
| **1.4.3 Contrast (Minimum)** | AA | Text ≥4.5:1 (normal text), ≥3:1 (large text). | ⚠️ PARTIAL | Update footer & link colors (see details below) |
| | | • Use Contrast Analyzer or WebAIM Color Contrast Checker | | |
| | | • Test all text: normal, large, headings, links | | |
| **1.4.4 Resize Text** | AA | No loss of content/functionality when text zoomed 200%. | ✅ PASS | - |
| | | • Zoom page to 200% → verify no horizontal scroll, all readable | | |
| **1.4.5 Images of Text** | AA | Use actual text, not images of text (except logos/decorative). | ✅ PASS | - |
| **1.4.10 Reflow** | AA | Content reflows in single column at 320px (no horizontal scroll). | ✅ PASS | - |
| **1.4.11 Non-text Contrast** | AA | Visual components (icons, buttons) have 3:1 contrast minimum. | ⚠️ CHECK | Verify icon colors meet 3:1 ratio |
| **1.4.12 Text Spacing** | AA | No loss when spacing adjusted (line-height 1.5, letter-spacing 0.12em, etc.). | ✅ PASS | - |
| **1.4.13 Content on Hover or Focus** | AA | Hoverable/focusable content doesn't obscure other content. | ✅ PASS | - |

**1.4.3 Contrast (Minimum) – ACTION REQUIRED:**

**Current Issues:**
- Footer text: `#4a5568` on `#fafbfd` = 4.3:1 ratio (AA for text, but low)
- Some links: need verification

**Remediation:**
```css
/* Update footer text color for better contrast */
footer {
  color: #2D3748;  /* Darker gray: 8.5:1 contrast */
}

/* Ensure link colors have sufficient contrast */
a {
  color: #0066CC;  /* Better blue: 4.5:1 on white */
}

a:visited {
  color: #551A8B;  /* Purple for visited: 4.5:1 on white */
}

/* High contrast mode for accessibility users */
@media (prefers-contrast: more) {
  body {
    --text-color: #000000;
    --link-color: #0000EE;
  }
}
```

**Test Procedure:**
1. Use WebAIM Color Contrast Checker: https://webaim.org/resources/contrastchecker/
2. Enter background color and text color
3. Verify ratio ≥4.5:1 (AA) or 7:1 (AAA)

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Contrast Analyzer: https://www.tpgi.com/color-contrast-checker/
- axe-core DevTools: `color-contrast` rule

---

### Operable

#### 2.1 Keyboard Accessible

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **2.1.1 Keyboard** | A | All functionality accessible via keyboard (Tab, Enter, ESC, Arrow keys). | ✅ PASS | - |
| | | • Test: Disable mouse → navigate entire page with Tab key | | |
| | | • Verify all buttons, links, form inputs reachable | | |
| | | • Check modals can be closed with ESC key | | |
| **2.1.2 No Keyboard Trap** | A | User can navigate away from any element with Tab. | ✅ PASS | - |
| | | • Tab through page → verify no elements trap focus | | |
| **2.1.3 Keyboard (No Exception)** | AAA | All content keyboard accessible (AAA requirement). | ✅ PASS | - |

**Keyboard Testing Procedure:**
1. Open page in browser
2. Disconnect mouse or use `Tab` key only
3. Navigate from top of page:
   - `Tab` = move to next focusable element
   - `Shift+Tab` = move to previous
   - `Enter` = activate link/button
   - `Space` = activate button/checkbox
   - `Arrow keys` = navigate within tabs, menus
4. Verify logical tab order (left-to-right, top-to-bottom)
5. Check focus indicators visible on each element
6. Close modals with `ESC` key

**Current Status:** ✅ Excellent – site fully keyboard accessible

---

#### 2.2 Enough Time

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **2.2.1 Timing Adjustable** | A | If content auto-updates: allow user to extend/disable timeout. | ✅ PASS | - |
| | | • Check: Do any elements auto-refresh or timeout? | | |
| **2.2.2 Pause, Stop, Hide** | A | Moving/blinking content (>5 sec) can be paused. | ✅ PASS (no autoplay) | - |

**Current Status:** ✅ No auto-refreshing or moving content

---

#### 2.3 Seizures and Physical Reactions

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **2.3.1 Three Flashes or Below Threshold** | A | No content flashes >3 times/second (risk of photosensitive seizures). | ✅ PASS | - |
| | | • Audit: Any CSS animations, GIFs, videos with flashing? | | |

**Current Status:** ✅ No flashing content

---

#### 2.4 Navigable

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **2.4.1 Bypass Blocks** | A | Skip links available to bypass navigation to main content. | ✅ PASS | - |
| | | • Verify: Page has "Skip to main content" or similar link | | |
| | | • Check: Skip links functional on all pages | | |
| **2.4.2 Page Titled** | A | Page has meaningful `<title>` tag. | ✅ PASS | - |
| | | • Inspect: View page source → check `<title>` | | |
| **2.4.3 Focus Order** | A | Focus order is logical and meaningful. | ✅ PASS | - |
| | | • Test: Tab through page → verify order makes sense | | |
| **2.4.4 Link Purpose (In Context)** | A | Link text (or title) describes link purpose. | ✅ PASS (mostly) | Audit all "click here" / "read more" patterns |
| | | • Audit: Search for vague link text: "click here", "read more", "here", "link" | | |
| **2.4.5 Multiple Ways** | AA | Multiple ways to find content (search, sitemap, navigation, related links). | ✅ PASS | - |
| | | • Check: Site has search, sitemap (/site-map), navigation | | |
| **2.4.6 Headings and Labels** | AA | Headings and labels are descriptive. | ✅ PASS | - |
| | | • Test: Headings accurately describe section content | | |
| **2.4.7 Focus Visible** | AA | Focus indicator visible on all interactive elements. | ⚠️ PARTIAL | Update focus styling for WCAG 2.2 (2.4.11) compliance |
| | | • Test: Tab through page → verify focus outline visible | | |
| | | • Check: Outline ≥3px, adequate contrast (3:1) | | |
| **2.4.11 Focus Appearance (WCAG 2.2 AA - NEW)** | AA (2.2) | Focus outline ≥3px thick, 3:1 contrast against background. | ⚠️ FAIL | Update focus styles (see details below) |
| | | • Test: Tab through page → verify focus indicators meet requirements | | |
| **2.4.12 Focus Not Obscured (Minimum) (WCAG 2.2 AA - NEW)** | AA (2.2) | Sticky header doesn't obscure focused element (≥minimum of element is visible). | ⚠️ CHECK | Verify header height & add scroll-margin |
| | | • Test: Scroll to focused element hidden by sticky header → should scroll into view | | |

**2.4.7 & 2.4.11 Focus Visible – ACTION REQUIRED:**

**Current Issue:**
```css
a:focus-visible,
button:focus-visible {
  outline: 3px solid #06b6d4;  /* Cyan: may not have 3:1 contrast on all backgrounds */
  outline-offset: 2px;
}
```

**Remediation for WCAG 2.2 Compliance:**
```css
/* Enhanced focus styling for WCAG 2.2 (2.4.11) */
:focus-visible {
  /* Use darker blue with better contrast */
  outline: 3px solid #0066CC;
  outline-offset: 2px;
  border-radius: 4px;
  /* Add box-shadow for additional visibility on all backgrounds */
  box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 6px #0066CC;
}

/* Dark mode variant */
body[data-theme="dark"] :focus-visible {
  outline-color: #66B3FF;
  box-shadow: 0 0 0 3px #000000, 0 0 0 6px #66B3FF;
}

/* High contrast mode */
@media (prefers-contrast: more) {
  :focus-visible {
    outline: 4px solid #000000 !important;
    outline-offset: 4px !important;
    box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 6px #000000 !important;
  }
}

/* Ensure all interactive elements get focus styling */
a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[role="button"]:focus-visible,
[role="tab"]:focus-visible,
[role="menuitem"]:focus-visible {
  outline: 3px solid #0066CC;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 6px #0066CC;
}
```

**Testing Procedure:**
1. Tab through page using keyboard
2. Verify focus outline is visible on every focusable element
3. Check outline is ≥3px thick
4. Verify outline color has ≥3:1 contrast with adjacent colors
5. Test on different backgrounds (light, dark, colored)
6. Verify focus outline doesn't disappear when element receives focus

**Tools:**
- Contrast Analyzer (for focus outline color contrast)
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe-core DevTools: `focus-appearance` rule

---

**2.4.12 Focus Not Obscured – ACTION REQUIRED:**

**Current Setup:**
```css
header {
  position: sticky;
  top: 0;
  z-index: 1000;
  /* No scroll-margin defined on page content */
}
```

**Issue:** When user tabs to focused element and header is sticky, the header may cover the focused element.

**Remediation:**
```css
/* Add scroll margin to push focused elements below sticky header */
:focus {
  scroll-margin-top: calc(var(--header-height) + 1rem);
}

/* Define header height as CSS variable */
header {
  --header-height: 80px;  /* Adjust based on actual header height */
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Alternative: Use :focus-within on main content area */
main:focus-within {
  scroll-margin-top: 100px;
}
```

**JavaScript Fallback (for better cross-browser support):**
```javascript
// Ensure focused element is visible below sticky header
document.addEventListener('focus', (e) => {
  if (e.target.matches('a, button, input, select, textarea')) {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Get header height and add margin
    const header = document.querySelector('header');
    if (header) {
      const headerHeight = header.getBoundingClientRect().height;
      e.target.style.scrollMarginTop = (headerHeight + 16) + 'px';
    }
  }
}, true);
```

---

### Understandable

#### 3.1 Readable

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **3.1.1 Language of Page** | A | Page language specified in `<html lang="en">`. | ✅ PASS | - |
| | | • Inspect: View source → check `<html lang="...">`  | | |
| **3.1.2 Language of Parts** | AA | Language changes marked with `lang` attribute. | ✅ PASS (multilingual site) | Verify FR, ES, AR, ZH pages have correct lang attribute |
| | | • For multilingual: each language page should have `lang="fr"`, `lang="es"`, etc. | | |

**Current Status:** ✅ Language attributes configured

---

#### 3.2 Predictable

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **3.2.1 On Focus** | A | No unexpected change when element receives focus. | ✅ PASS | - |
| | | • Test: Tab through page → verify no unexpected navigation/changes | | |
| **3.2.2 On Input** | A | No unexpected change when user modifies form input. | ✅ PASS | - |
| | | • Test: Fill form fields → verify no auto-submit or unexpected behavior | | |
| **3.2.3 Consistent Navigation** | AA | Navigation appears in consistent location across pages. | ✅ PASS | - |
| | | • Test: Visit multiple pages → verify navigation in same location | | |
| **3.2.4 Consistent Identification** | AA | Components with same function identified consistently (same label, appearance). | ✅ PASS | - |
| | | • Test: Search appears same on all pages, submit buttons same label | | |

**Current Status:** ✅ Site follows predictable patterns

---

#### 3.3 Input Assistance

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **3.3.1 Error Identification** | A | Errors clearly identified & described (not just color). | ✅ PASS (if forms exist) | Verify form error messages are clear |
| | | • Test form: Enter invalid data → verify error message clear & accessible | | |
| **3.3.2 Labels or Instructions** | A | Form fields have labels. | ✅ PASS | Verify all form fields have explicit labels |
| | | • Inspect: Every `<input>` should have associated `<label>` | | |
| **3.3.3 Error Suggestion** | AA | Error suggestions provided. | ✅ PASS (if forms exist) | - |
| | | • Test: Enter invalid email → suggest correct format | | |
| **3.3.4 Error Prevention** | AA | For legal/financial transactions: confirm & allow correction. | ✅ N/A (no transactions) | - |

**Current Status:** ✅ Basic form accessibility in place

---

### Robust

#### 4.1 Compatible

| **Criterion** | **Level** | **Test Procedure** | **Current Status** | **Remediation** |
|---|---|---|---|---|
| **4.1.1 Parsing** | A | Valid HTML (no duplicate attributes, proper nesting). | ✅ PASS | Run HTML validator regularly |
| | | • Use HTML Validator: https://validator.w3.org/ | | |
| **4.1.2 Name, Role, Value** | A | Components have proper ARIA names, roles, values. | ⚠️ PARTIAL | Add aria-label, aria-describedby to modals & components |
| | | • Inspect: Buttons have text or aria-label | | |
| | | • Modals have aria-labelledby, aria-describedby | | |
| | | • Form fields have labels or aria-label | | |
| **4.1.3 Status Messages** | AA | Status messages (e.g., "Newsletter subscribed!") announced to screen readers. | ⚠️ CHECK | Add `role="status" aria-live="polite"` to confirmation messages |
| | | • Test: Submit form → verify success/error message announced | | |

**4.1.2 Name, Role, Value – ACTION REQUIRED:**

**Newsletter Modal:**
```html
<!-- Current (missing aria-describedby) -->
<div id="newsletter-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="newsletter-title" hidden>
  <h2 id="newsletter-title">Subscribe to our newsletter</h2>
  ...
</div>

<!-- Updated (with aria-describedby) -->
<div id="newsletter-modal" class="modal" role="dialog" aria-modal="true" 
     aria-labelledby="newsletter-title" 
     aria-describedby="newsletter-description" 
     hidden>
  <h2 id="newsletter-title">Subscribe to our newsletter</h2>
  <p id="newsletter-description" class="sr-only">
    Provide your email to receive updates and news about 3mpowrApp. 
    You can unsubscribe anytime. Your email will not be shared.
  </p>
  ...
</div>
```

**Search Results Live Region:**
```html
<!-- Add live region for search result announcements -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only" id="search-status"></div>

<!-- Update results summary with accessible announcement -->
<p id="search-results-summary" class="search-summary" aria-live="polite"></p>
```

**Update JavaScript to announce results:**
```javascript
function render(results, q, terms) {
  if (!list) return;
  list.innerHTML = '';
  var count = results.length;
  var msg = !q 
    ? '' 
    : (count === 0 
      ? `No results for "${q}"` 
      : `${count} result${count === 1 ? '' : 's'} for "${q}"`);
  
  if (summary) {
    summary.textContent = msg;
    // Announce to screen readers
    var statusEl = document.getElementById('search-status');
    if (statusEl) statusEl.textContent = msg;
  }
  
  // ... rest of rendering code
}
```

---

## Test Execution Checklist

### Automated Tests (CI/CD)

- [ ] **pa11y-ci:** Run on push
  ```bash
  npm run test:a11y
  ```
  **Expected:** Zero errors (threshold: 0)

- [ ] **axe-core:** Run on push
  ```bash
  npx playwright test --project=axe
  ```
  **Expected:** Zero critical/serious violations

- [ ] **Lighthouse:** Weekly audit
  ```bash
  npm run lighthouse
  ```
  **Expected:** Accessibility score ≥95/100

### Manual Tests

#### Keyboard Navigation
- [ ] Tab through entire homepage
- [ ] Verify logical order (top-to-bottom, left-to-right)
- [ ] Check focus indicators visible on all focusable elements
- [ ] Test ESC to close modals
- [ ] Test Enter to activate buttons
- [ ] Test Space to toggle checkboxes

#### Screen Reader Testing

**NVDA on Windows:**
```
1. Download NVDA from https://www.nvaccess.org/
2. Start NVDA (insert key + N)
3. Alt+Tab to browser window
4. NVDA+Home = read from current position
5. NVDA+Down = read next line
6. NVDA+Right arrow = read next element
7. Tab = jump to next link/button
```

- [ ] Page title announced
- [ ] Navigation structure clear (nav landmark)
- [ ] Main content clearly announced
- [ ] All images have alt text
- [ ] Form labels announced before fields
- [ ] Error messages announced
- [ ] Success messages announced

**VoiceOver on macOS:**
```
1. System Preferences > Accessibility > VoiceOver > Enable
2. VO key = Control + Option
3. VO + Right Arrow = read next item
4. VO + Left Arrow = read previous item
5. VO + Up/Down Arrow = move within complex widgets
6. Tab = jump to next link/button
```

#### Color Contrast
- [ ] Use WebAIM Contrast Checker for each color pair
- [ ] Normal text: ≥4.5:1
- [ ] Large text (18px+ bold or 24px+ normal): ≥3:1
- [ ] UI components/borders: ≥3:1
- [ ] Focus indicators: ≥3:1 against background

#### Responsiveness (Breakpoints)
- [ ] 320px (mobile) – no horizontal scroll, text readable
- [ ] 480px (landscape phone) – menu functional
- [ ] 768px (tablet) – layout optimal
- [ ] 1024px+ (desktop) – full experience

#### Browser Testing
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Edge (Latest)

### Documentation

- [ ] Screenshot of each page in normal view
- [ ] Screenshot of page at 200% zoom
- [ ] Screenshot of each page in high-contrast mode (if available)
- [ ] Video of keyboard navigation demo
- [ ] Video of screen reader demo (NVDA + search)
- [ ] Contrast ratio report (all text, links, components)

---

## Remediation Roadmap

### Phase 1: Critical (Week 1)
1. [ ] Update focus styles (2.4.11 – WCAG 2.2)
   - Change outline color from cyan (#06b6d4) to darker blue (#0066CC)
   - Add box-shadow for visibility on all backgrounds
   - Test contrast ≥3:1

2. [ ] Fix focus not obscured (2.4.12 – WCAG 2.2)
   - Add scroll-margin-top to :focus
   - Test sticky header doesn't obscure focused elements

3. [ ] Verify target size (2.5.8 – WCAG 2.2)
   - Ensure all interactive elements ≥24×24px (44×44px recommended)
   - Add padding if needed to smaller elements

4. [ ] Add ARIA descriptions to modals (4.1.2)
   - Newsletter modal: add aria-describedby
   - Any other modals: add aria-labelledby & aria-describedby

### Phase 2: High Priority (Week 2)
5. [ ] Add live region for search results (4.1.3)
6. [ ] Update footer color contrast (1.4.3)
7. [ ] Verify all form labels (3.3.2)
8. [ ] Test keyboard navigation on all pages
9. [ ] Test screen reader on NVDA

### Phase 3: Verification (Week 3)
10. [ ] Re-run pa11y-ci – verify zero errors
11. [ ] Re-run axe-core – verify zero critical violations
12. [ ] Manual keyboard testing – all pages
13. [ ] Manual screen reader testing – NVDA + VoiceOver
14. [ ] Generate accessibility audit report
15. [ ] Obtain sign-off from accessibility specialist

---

## Tools & Resources

### Automated Testing Tools
- **axe-core DevTools:** https://www.deque.com/axe/devtools/
- **WAVE Browser Extension:** https://wave.webaim.org/extension/
- **Lighthouse:** Built into Chrome DevTools (F12 → Lighthouse tab)
- **pa11y-ci:** Already configured in `.pa11yci.json` ✅

### Manual Testing Tools
- **Color Contrast Analyzer:** https://www.tpgi.com/color-contrast-checker/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **HTML Validator:** https://validator.w3.org/
- **NVDA (Screen Reader):** https://www.nvaccess.org/download/
- **JAWS (Screen Reader):** https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver (Built-in):** macOS/iOS accessibility settings

### Reference Standards
- **WCAG 2.1 Full Guide:** https://www.w3.org/WAI/WCAG21/quickref/
- **WCAG 2.2 Draft (AAA):** https://www.w3.org/WAI/WCAG22/quickref/
- **Section 508 (US Federal):** https://www.section508.gov/
- **EN 301 549 (EU):** https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf

### Learning Resources
- **WebAIM Articles:** https://webaim.org/articles/
- **A11ycasts with Google Chrome:** https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9Xc-RgEzwLvePng7V
- **The A11Y Podcast:** https://a11ypodcast.com/

---

## Bug Report: Accessibility Issues

### Template

```markdown
## Accessibility Bug: [Title]

**WCAG Criterion:** [e.g., 2.4.11 Focus Appearance (AA)]  
**Severity:** Critical | High | Medium | Low  
**Component:** [Page/Feature]  
**Affected Users:** [e.g., Keyboard users, screen reader users, users with low vision]  

### Issue Description
[Brief description of accessibility problem]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Expected vs. Actual]

### Screenshots/Video
[Attach screenshot or video demonstrating issue]

### Remediation Steps
[How to fix]

### Verification
- [ ] Fixed in code
- [ ] Re-tested manually
- [ ] Verified with axe-core
- [ ] Verified with screen reader
```

---

## Sign-Off

- [ ] **Accessibility Specialist Review:** _______________ Date: _______
- [ ] **QA Lead Approval:** _______________ Date: _______
- [ ] **Product Owner Sign-Off:** _______________ Date: _______

---

**Document History:**

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | Oct 17, 2025 | A11y Specialist | Initial framework |
| TBD | TBD | TBD | Updates during testing |

