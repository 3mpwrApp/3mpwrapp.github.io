# Quick Reference - Site-Wide Styling Updates

## 🎨 Color Reference

### Links
```css
/* Light Mode */
--link-color: #3b82f6;      /* Lighter blue */
--link-hover: #2563eb;       /* Hover state */

/* Dark Mode */
--link-color: #7eb7ff;       /* Lighter blue */
--link-hover: #a8c7ff;       /* Hover state */
```

### Focus Indicators
```css
--focus-outline: #0066cc;    /* Light mode */
--focus-outline: #82aaff;    /* Dark mode */
--focus-ring-width: 3px;     /* All modes */
```

### Warning Box (Brown/Yellow)
```css
/* Light Mode */
background: #fef3c7;         /* Light yellow */
text: #78350f;               /* Dark brown */
border: #f59e0b;             /* Orange */

/* Dark Mode */
background: #44260a;         /* Dark brown */
text: #fef3c7;               /* Light yellow */
border: #fb923c;             /* Light orange */
```

### Gradient Banners
```css
/* Pink */
background: linear-gradient(135deg, #d946a6 0%, #e63946 100%);

/* Blue */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

---

## 📏 Typography Scale

```css
Body:  16px (1rem) - line-height: 1.7
h1:    36px (2.25rem) - line-height: 1.3
h2:    30px (1.875rem) - line-height: 1.3
h3:    24px (1.5rem) - line-height: 1.3
h4:    20px (1.25rem) - line-height: 1.3
```

---

## 📐 Spacing Scale

```css
Paragraphs:     margin-bottom: 1.25em
Headings:       margin-top: 2em, margin-bottom: 0.75em
Lists:          margin-bottom: 1.5em
List items:     margin-bottom: 0.5em
```

---

## 🔍 Focus Styles

All interactive elements have visible focus:

```css
/* Universal */
outline: 3px solid #0066cc;
outline-offset: 2px;
border-radius: 2px;

/* Enhanced (buttons, primary actions) */
outline: 3px solid #0066cc;
outline-offset: 3px;
box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.15);
```

---

## 🔗 Link Underlines

```css
Default:  2px thickness
Hover:    3px thickness
Offset:   0.2em
```

---

## ✨ Text Shadows (Gradients)

Used on gradient backgrounds for readability:

```css
Body text:    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
Headings:     text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
Hover links:  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
```

---

## 📱 Touch Targets

All interactive elements meet WCAG 2.5.5:

```css
min-height: 44px;
min-width: 44px;
```

---

## 🎯 Quick Testing

### Keyboard Navigation
```
Tab        → Move forward
Shift+Tab  → Move backward
Enter      → Activate
Space      → Toggle/Select
```

All should show visible blue outline!

### Color Contrast
- Body text: 4.5:1 minimum (AA)
- Headings: 3:1 minimum (AA)
- Warning boxes: 7:1+ (AAA)
- Gradient sections: Enhanced with text-shadow

### Responsive
- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+

---

## 📍 Key Files

```
assets/css/style.css                    ← Main stylesheet (2500+ lines)
_layouts/default.html                   ← Includes CSS on all pages
user-guide/index.md                     ← Fixed 404 issue
ACCESSIBILITY-UX-IMPROVEMENTS-OCT27.md  ← Full documentation
```

---

*Last updated: October 27, 2025*
