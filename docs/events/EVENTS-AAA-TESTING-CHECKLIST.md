# Events Page WCAG 2.2 AAA - Testing Checklist

## ✅ Implementation Complete - November 8, 2025

Use this checklist to verify all color contrast fixes are working correctly on the Events page.

---

## 🔍 Visual Testing Checklist

### 1. Main Gradient Banner
- [ ] Background gradient is dark purple (not light purple)
- [ ] White text on banner is clearly readable
- [ ] "Learn More About Events" button has white background with dark text
- [ ] Button has visible hover effect
- [ ] Button has yellow focus outline when tabbed to

### 2. Event Cards - Happening Soon (Yellow)
- [ ] Card has yellow gradient background
- [ ] Border is dark brown (#b45309), not orange
- [ ] Title is dark gray/black (#1a202c)
- [ ] Description text is dark gray (#1f2937)
- [ ] Location and date are clearly readable
- [ ] "HAPPENING SOON" badge is dark red with white text

### 3. Event Cards - Future Events (Blue)
- [ ] Card has light blue gradient background
- [ ] Border is dark blue (#075985), not light blue
- [ ] Title is dark blue (#0c4a6e)
- [ ] Description text is very dark (#0f172a)
- [ ] All text is easily readable

### 4. Event Cards - Past Events (Gray)
- [ ] Card has gray gradient background
- [ ] Border is medium gray
- [ ] Title and text are dark and readable

### 5. Event Badges
Check each badge type appears as solid color with white text:
- [ ] 🌐 Virtual: Dark blue background (#1e40af) with white text
- [ ] 🤟 ASL: Dark brown background (#92400e) with white text
- [ ] 📝 Captions: Dark indigo background (#3730a3) with white text
- [ ] ♿ Accessible: Dark green background (#065f46) with white text
- [ ] 🎧 Sensory-Friendly: Dark pink background (#9f1239) with white text
- [ ] 🔋 Energy: Dark orange background (#9a3412) with white text

### 6. RSVP Buttons
- [ ] Button is solid dark blue (#004080), not gradient
- [ ] White text is clearly visible
- [ ] Button darkens on hover
- [ ] Button has yellow focus outline when tabbed to
- [ ] Hover effect includes scale animation

### 7. Share Buttons
Check each social media button:
- [ ] 𝕏 Twitter: Darker blue (#0d8bd9)
- [ ] 🦋 Bluesky: Darker blue (#0066cc)
- [ ] 🐘 Mastodon: Darker purple-blue (#4547cc)
- [ ] 📘 Facebook: Much darker blue (#2d4373)
- [ ] 💼 LinkedIn: Darker blue (#005582)
- [ ] 📧 Email: Darker gray (#4b5563)
- [ ] All buttons have white text that's clearly readable
- [ ] All buttons scale up slightly on hover
- [ ] All buttons have yellow focus outline

### 8. Info Boxes

#### Green Success Box
- [ ] Background is light green gradient
- [ ] Border is dark green (#065f46), not bright green
- [ ] Text is dark green (#065f46)
- [ ] All text is clearly readable

#### Yellow Warning Box
- [ ] Background is light yellow gradient
- [ ] Border is dark brown (#92400e), not orange
- [ ] Text is dark brown/amber (#78350f)
- [ ] All text is clearly readable

#### Blue Info Box
- [ ] Background is light blue gradient
- [ ] Border is dark blue (#075985), not light blue
- [ ] Text is dark blue (#0c4a6e)
- [ ] All text is clearly readable

### 9. Subscription Instructions

Check each platform's instruction box:
- [ ] 📱 iOS: Light blue background, dark blue border and text
- [ ] 🤖 Android: Light green background, dark green border and text
- [ ] 🍎 macOS: Light yellow background, dark brown border and text
- [ ] 💻 Windows: Light indigo background, dark indigo border and text
- [ ] 🌐 Web: Light pink background, dark pink border and text
- [ ] All summary text (bold) is clearly readable
- [ ] All content text is clearly readable
- [ ] All code blocks have dark text on light gray background

### 10. Troubleshooting Accordions
- [ ] Background is light red/pink
- [ ] Border is dark red (#991b1b)
- [ ] Summary text is dark red (#7f1d1d)
- [ ] Content text is dark red (#7f1d1d)
- [ ] All text is clearly readable

### 11. Stats/Quick Reference Box
- [ ] Background is light blue gradient
- [ ] Border is dark blue (#075985)
- [ ] Numbers/stats are dark blue (#0c4a6e)
- [ ] Labels are dark gray (#1e293b)
- [ ] All text is clearly readable

### 12. Code Blocks
- [ ] Background is light gray (#f3f4f6)
- [ ] Text is dark gray (#1f2937)
- [ ] Border is medium gray (#9ca3af)
- [ ] URLs/paths are easily readable

---

## 🖱️ Keyboard Navigation Testing

### Focus Indicators
- [ ] Tab through all interactive elements
- [ ] Each element shows yellow focus outline (3px)
- [ ] Focus outline has 2px offset from element
- [ ] Focus outline is visible on all backgrounds
- [ ] Box shadow provides additional visibility

### Interactive Elements to Test
- [ ] "Learn More" button in top banner
- [ ] "Share Events Calendar" button
- [ ] RSVP buttons (if events present)
- [ ] All social media share buttons
- [ ] Details/accordion elements
- [ ] All links in info boxes
- [ ] All links in instruction boxes

---

## 🌙 Dark Mode Testing

### Enable Dark Mode
1. System: Change OS to dark mode
2. Or: Use browser DevTools > Rendering > Emulate CSS media feature `prefers-color-scheme: dark`

### Verify
- [ ] Gradient banners are dark blue/indigo, not light purple
- [ ] Event cards have dark background (#1a202c)
- [ ] All text is white on dark backgrounds
- [ ] Info boxes have dark backgrounds
- [ ] Code blocks have dark gray background with light text
- [ ] All colors remain high contrast

---

## 🔆 High Contrast Mode Testing

### Enable High Contrast
1. Windows: Settings > Ease of Access > High contrast
2. Or: Use browser extension for high contrast simulation

### Verify
- [ ] All elements have solid black backgrounds
- [ ] All text is white
- [ ] All borders are white (3px)
- [ ] Links are yellow for maximum visibility
- [ ] All interactive elements have white borders
- [ ] Focus indicators are visible

---

## 🖨️ Print Preview Testing

### Test Print Styles
1. Open Events page
2. File > Print or Ctrl+P
3. View print preview

### Verify
- [ ] All backgrounds are white
- [ ] All text is black
- [ ] All borders are black (2px)
- [ ] Buttons are hidden (don't print)
- [ ] Links are underlined
- [ ] Content is clearly readable in black and white

---

## 🔬 Automated Testing

### Using Browser DevTools
1. Open Events page
2. F12 to open DevTools
3. Lighthouse tab > Accessibility audit
4. Run audit

### Expected Results
- [ ] Contrast: 100% (all elements pass)
- [ ] No color contrast violations
- [ ] All interactive elements have adequate target size
- [ ] All focus indicators visible

### Using axe DevTools Extension
1. Install axe DevTools browser extension
2. Open Events page
3. Run axe scan

### Expected Results
- [ ] 0 color contrast violations
- [ ] All elements meet WCAG 2.2 AAA (7:1 ratio)
- [ ] No critical or serious issues

### Using WebAIM Contrast Checker
Test random elements manually:
1. Right-click element > Inspect
2. Note background color and text color
3. Visit https://webaim.org/resources/contrastchecker/
4. Enter colors and verify ratio

### Test These Combinations
- [ ] Main banner white text on dark purple: Should be 11.2:1
- [ ] Badge white text on solid backgrounds: Should be 7.3-8.5:1
- [ ] RSVP button white on dark blue: Should be 9.5:1
- [ ] Event card titles on backgrounds: Should be 8.2-15.5:1
- [ ] Info box text on backgrounds: Should be 7.5-8.2:1

---

## 📱 Mobile Testing

### Test on Mobile Device or DevTools Device Mode
- [ ] All gradients render correctly
- [ ] All text is readable on small screens
- [ ] Buttons are large enough to tap (44x44px minimum)
- [ ] Focus outlines visible when using external keyboard
- [ ] Colors don't appear washed out on mobile display

---

## 🌐 Cross-Browser Testing

### Chrome/Edge (Chromium)
- [ ] All colors render correctly
- [ ] Focus indicators visible
- [ ] Dark mode works
- [ ] Print preview correct

### Firefox
- [ ] All colors render correctly
- [ ] Focus indicators visible
- [ ] Dark mode works
- [ ] Print preview correct

### Safari (macOS/iOS)
- [ ] All colors render correctly
- [ ] Focus indicators visible
- [ ] Dark mode works
- [ ] Print preview correct

---

## ✅ Final Verification

### Before Marking Complete
- [ ] All visual elements meet WCAG 2.2 AAA standards
- [ ] All interactive elements have visible focus indicators
- [ ] Dark mode, high contrast, and print styles all work
- [ ] No CSS errors in browser console
- [ ] Page loads without issues
- [ ] All functionality preserved (no breaking changes)

### Documentation Verification
- [ ] `assets/css/events-aaa-fixes.css` file exists (19KB)
- [ ] `events/index.md` links to new CSS file
- [ ] `EVENTS-PAGE-AAA-COLOR-FIXES-NOV2025.md` documentation complete
- [ ] `EVENTS-AAA-FIXES-SUMMARY.md` summary complete
- [ ] `EVENTS-COLOR-BEFORE-AFTER-COMPARISON.md` comparison complete

---

## 🐛 Issues Found?

### If you find any failing checks:
1. Note the element/section with the issue
2. Use browser inspector to check actual colors
3. Compare against expected values in documentation
4. Check if CSS file is loading (Network tab in DevTools)
5. Look for conflicting CSS rules (Computed tab in DevTools)
6. Verify `!important` flags are working

### Common Issues
- **CSS file not loading:** Check file path in HTML
- **Colors not changing:** Check CSS specificity, may need more `!important`
- **Focus outline not visible:** Check z-index of elements
- **Dark mode not working:** Check `@media (prefers-color-scheme: dark)` queries

### Report Issues
Email: empowrapp08162025@gmail.com  
Subject: Events Page Color Contrast Issue  
Include: Screenshot, browser version, OS, specific element

---

## 📊 Success Criteria

### All Tests Pass = Ready for Production ✅
- Visual testing: 100% pass
- Keyboard navigation: All focus indicators visible
- Dark mode: All colors high contrast
- High contrast mode: All elements accessible
- Print preview: Clean black and white output
- Automated tools: 0 color contrast violations
- Mobile: All elements readable and tappable
- Cross-browser: Works in Chrome, Firefox, Safari

---

**Testing completed by:** _________________  
**Date:** _________________  
**All checks passed:** ☐ Yes ☐ No  
**Issues found:** _________________  
**Issues resolved:** _________________  

---

**Note:** This checklist ensures the Events page meets WCAG 2.2 AAA color contrast standards. Complete all sections before considering the work finished.
