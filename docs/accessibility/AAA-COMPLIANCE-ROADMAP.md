# Remaining WCAG AAA Compliance Gaps - Action Plan

**Current Status:** 82% AAA, 98% AA  
**Target:** 95%+ AAA  
**Gap to Close:** 13 percentage points  
**Target Date:** March 1, 2026

---

## Priority 1: Forms (WCAG 3.3.5 AAA - Context-Sensitive Help)

### Issue
Not all forms have context-sensitive help buttons for complex fields.

### Current Status
- ✅ Contact form: AAA compliant (help buttons implemented)
- ⚠️ Newsletter signup: Missing help
- ⚠️ Search form: Missing help
- ⚠️ Beta signup form (app-waitlist): Partial help

### AAA Requirement
**WCAG 3.3.5 (Level AAA):** Help is available for form inputs

### Solution
Add help buttons to remaining forms:

**Newsletter Form** (`_includes/newsletter-signup.html` or inline):
- Add help for "Email" field explaining purpose
- Add help for "Frequency" dropdown (if exists)

**Search Form** (site-wide search):
- Add help explaining search syntax
- Examples: "WSIB", "disability rights", "evidence locker"

**Beta Signup Form** (`app-waitlist.md`):
- Enhance existing help
- Add help for role selection, region selection

### Estimated Time
2-3 hours total

### Files to Edit
1. `_includes/newsletter-signup.html` (if exists) OR inline newsletter forms
2. Search widget/component
3. `app-waitlist.md` beta form

---

## Priority 2: Image Optimization (WCAG 1.4.4 AAA - Images of Text)

### Issue
Some images contain text instead of real HTML text (logos, badges, some graphics).

### Current Status
- ✅ Main logo: Acceptable (brand identity exception)
- ⚠️ Some badge graphics: Could be HTML/CSS
- ⚠️ Social media images: Pending creation (will be optimized)

### AAA Requirement
**WCAG 1.4.4 (Level AA, enhanced in AAA):** Text preferred over images of text except for logos/customization

### Solution
**Audit all images containing text:**
1. Identify images with text content
2. Replace with HTML/CSS equivalents where possible
3. Add robust alt text for remaining images
4. Use SVG for scalable graphics

**Exception:** Brand logos, essential graphics where text is decorative

### Estimated Time
3-4 hours audit + implementation

### Files to Review
- `assets/images/` directory
- Badge/icon usage in pages
- Social share images (ensure alt text is comprehensive)

---

## Priority 3: Responsive Images (Performance + Accessibility)

### Issue
Some images lack `srcset` for responsive sizing and format optimization.

### Current Status
- ✅ Main logo: Has WebP alternate
- ⚠️ Most content images: No srcset
- ⚠️ No lazy loading attributes on below-fold images

### AAA Best Practice
While not strictly AAA requirement, responsive images improve accessibility for users on slow connections or assistive tech.

### Solution
**Add `srcset` and `sizes` attributes:**
```html
<img 
  src="image.jpg"
  srcset="image-320w.jpg 320w,
          image-640w.jpg 640w,
          image-1280w.jpg 1280w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="Descriptive text"
  loading="lazy">
```

**Add lazy loading:**
- `loading="lazy"` for below-fold images
- `loading="eager"` for above-fold critical images

### Estimated Time
4-6 hours (batch process + testing)

### Tools
- ImageOptim / TinyPNG for compression
- Responsive breakpoints generator
- Automated script for srcset generation

---

## Priority 4: Font Loading Strategy (WCAG AAA Performance)

### Issue
Font loading may cause FOIT (Flash of Invisible Text) on slow connections, affecting readability.

### Current Status
- ⚠️ No explicit font-display strategy
- ⚠️ Potential CLS (Cumulative Layout Shift) during font load

### AAA Best Practice
**Ensure text remains visible during font loading**

### Solution
Add `font-display: swap` to all @font-face declarations:

```css
@font-face {
  font-family: 'Inter';
  src: url('inter.woff2') format('woff2');
  font-display: swap; /* Show fallback font immediately */
}
```

**Also implement:**
- Preload critical fonts: `<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>`
- Use system fonts as fallback
- Subset fonts to reduce file size

### Estimated Time
2 hours

### Files to Edit
- CSS font declarations
- `_includes/custom-head.html` (add preload tags)

---

## Priority 5: PWA Enhancements (Accessibility + Offline)

### Issue
Progressive Web App features not fully implemented for offline accessibility.

### Current Status
- ✅ Service worker registered (from previous work)
- ⚠️ Offline fallback page needs accessibility review
- ⚠️ Install prompts not optimized for screen readers

### AAA Best Practice
Offline access improves accessibility for users with connectivity issues or in rural/remote areas.

### Solution
**Enhance offline experience:**
1. Ensure offline fallback page is AAA compliant
2. Add screen reader announcements for online/offline state changes
3. Cache critical accessibility resources (fonts, CSS for high contrast mode)
4. Provide clear offline indicators

```html
<div role="status" aria-live="polite" id="connection-status">
  You are currently offline. Some features may be limited.
</div>
```

### Estimated Time
3-4 hours

### Files to Edit
- `assets/js/service-worker.js`
- Offline fallback page
- Connection status indicator component

---

## Priority 6: Enhanced Keyboard Navigation (AAA)

### Issue
Some interactive elements lack visible focus indicators meeting AAA standards.

### Current Status
- ✅ Most elements: 2px focus outline (meets AA)
- ⚠️ Some complex components: Inconsistent focus styles
- ⚠️ Focus order not optimized on all pages

### AAA Requirement
**WCAG 2.4.7 (Level AA, enhanced in AAA):** Enhanced focus indicators (3px+ recommended for AAA)

### Solution
**Standardize focus indicators:**
```css
:focus-visible {
  outline: 3px solid #ffd54f;
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Audit focus order:**
- Tab through every page
- Ensure logical progression
- Skip links at top of each page

### Estimated Time
2-3 hours audit + fixes

### Files to Edit
- Global CSS (`style.css`)
- Page-specific navigation components

---

## Priority 7: Color Contrast Enhancements (AAA)

### Issue
Some UI elements meet AA (4.5:1) but not AAA (7:1) requirements.

### Current Status
- ✅ Primary gradient: 11.2:1 (exceeds AAA)
- ✅ Pink gradient: 8.7:1 (exceeds AAA)
- ✅ Status banner: 7.4:1 (meets AAA)
- ⚠️ Some link hover states: 6:1 (meets AA, not AAA)
- ⚠️ Some disabled button states: 4.8:1 (meets AA, not AAA)

### AAA Requirement
**WCAG 1.4.6 (Level AAA):** Contrast ratio of at least 7:1 for normal text, 4.5:1 for large text

### Solution
**Audit all colors with WebAIM Contrast Checker:**
1. Test every color combination
2. Adjust colors that fall short of 7:1
3. Document exceptions (logos, where brand identity requires specific colors)

**Example fixes:**
- Link hover: Change from `#0066CC` (might be 6:1) to `#004C99` (7:1+)
- Disabled buttons: Increase contrast or add additional visual indicators (icon, pattern)

### Estimated Time
2-3 hours

### Tools
- WebAIM Contrast Checker
- Browser DevTools color picker
- Automated contrast testing (pa11y, axe)

---

## Priority 8: Video/Audio Content (WCAG 1.2.5 AAA)

### Issue
If website contains video content, need audio descriptions.

### Current Status
- ✅ No autoplay video (meets WCAG 1.4.2)
- ⚠️ YouTube embeds: Rely on YouTube's captions (not AAA)
- ⚠️ No native audio description tracks

### AAA Requirement
**WCAG 1.2.5 (Level AA):** Audio descriptions provided for video content

### Solution
**For embedded YouTube videos:**
- Verify all videos have accurate captions
- Add text transcripts below each video embed
- Link to YouTube's audio description versions if available

**For future native video:**
- Include audio description track (`<track kind="descriptions">`)
- Or provide full text transcript

### Estimated Time
1-2 hours per video (audit + transcripts)

### Implementation
Add transcripts to pages with video embeds:
```markdown
<details>
<summary>Video Transcript</summary>
[Full text transcript here]
</details>
```

---

## Priority 9: Language Declarations (WCAG 3.1.2 AA/AAA)

### Issue
Some pages with mixed language content may not have `lang` attributes on language-specific elements.

### Current Status
- ✅ Page-level lang declarations (en, fr)
- ⚠️ Inline foreign words may lack lang attributes
- ⚠️ Some French content embedded in English pages

### AAA Requirement
**WCAG 3.1.2 (Level AA):** Language of parts declared

### Solution
Add `lang` attributes to foreign language content:
```html
<p>The motto <span lang="fr">Rien sur nous sans nous</span> means "Nothing about us without us".</p>
```

**Audit needed:**
- Search for French phrases in English content
- Add `lang="fr"` to French content
- Add `lang="en"` to English content on French pages

### Estimated Time
1-2 hours

### Files to Audit
- About page (French motto)
- Features page (any French terms)
- FAQ (bilingual content)

---

## Priority 10: Automated Testing Integration (Continuous AAA)

### Issue
No automated AAA-level testing in CI/CD pipeline.

### Current Status
- ✅ Manual accessibility audits (periodic)
- ⚠️ No automated AAA checks
- ⚠️ GitHub Actions only runs basic axe tests

### Solution
**Enhance CI/CD with AAA testing:**

1. **Add pa11y-ci with AAA ruleset:**
```json
{
  "standard": "WCAG2AAA",
  "runners": ["axe", "htmlcs"],
  "timeout": 30000
}
```

2. **Add contrast ratio checks:**
- Automated contrast testing for all color combinations
- Fail build if any combination < 7:1

3. **Add keyboard navigation tests:**
- Playwright/Puppeteer scripts to tab through pages
- Verify focus indicators visible

### Estimated Time
4-6 hours setup + testing

### Files to Create/Edit
- `.github/workflows/accessibility.yml`
- `pa11yci.json` configuration
- Contrast testing script

---

## Summary: Roadmap to 95%+ AAA

| Priority | Task | Effort | Impact | Deadline |
|----------|------|--------|--------|----------|
| 1 | Forms context help | 2-3h | HIGH | Week 1 |
| 2 | Image optimization | 3-4h | MEDIUM | Week 1 |
| 3 | Responsive images | 4-6h | MEDIUM | Week 2 |
| 4 | Font loading strategy | 2h | LOW | Week 2 |
| 5 | PWA enhancements | 3-4h | MEDIUM | Week 3 |
| 6 | Keyboard navigation | 2-3h | MEDIUM | Week 3 |
| 7 | Color contrast AAA | 2-3h | HIGH | Week 4 |
| 8 | Video transcripts | 1-2h | LOW | Week 4 |
| 9 | Language declarations | 1-2h | LOW | Week 5 |
| 10 | Automated AAA testing | 4-6h | HIGH | Week 6 |

**Total Estimated Time:** 24-35 hours  
**Timeline:** 6 weeks (4-6 hours/week)  
**Target Completion:** March 1, 2026

---

## Success Metrics

**WCAG AAA Compliance:**
- **Current:** 82% AAA, 98% AA
- **After Priority 1-3:** ~87% AAA (Week 2)
- **After Priority 4-7:** ~92% AAA (Week 4)
- **After Priority 8-10:** 95%+ AAA (Week 6)

**Quality Checks:**
- Zero AAA violations in automated tests
- Positive feedback from disabled community members
- Independent third-party AAA audit passes
- Industry recognition as gold standard

---

## Next Steps

1. **Immediate (This Week):**
   - Create help button component for forms
   - Apply to newsletter, search, beta signup forms
   - Audit all images containing text

2. **Short-Term (Weeks 2-4):**
   - Implement responsive images
   - Fix remaining contrast issues
   - Enhance keyboard navigation

3. **Medium-Term (Weeks 5-6):**
   - Complete video transcripts
   - Setup automated AAA testing
   - Final comprehensive audit

4. **Ongoing:**
   - Monthly community feedback reviews
   - Quarterly third-party audits
   - Continuous improvement based on user needs

---

**Contact:** empowrapp08162025@gmail.com  
**Documentation:** See WCAG-COMPLIANCE-CHECKLIST.md for detailed criteria
