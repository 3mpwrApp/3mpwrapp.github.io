# Accessibility Checklist (Quick Manual Pass)

Keyboard
- Can I tab to all interactive elements in a logical order?
- Is focus always visible and not trapped?

Structure
- One `<h1>` per page; headings in logical order
- Landmarks present: header, nav, main, footer

Links and Controls
- Link text is meaningful out of context
- Buttons are used for actions; links for navigation
- Touch targets large enough (ideally 44×44px)

Forms
- Labels are explicitly associated with inputs
- Helper text via `aria-describedby` where needed
- Required fields indicated; errors described programmatically

Media
- Provide captions/transcripts for audio/video
- Avoid auto‑play with sound

Visual
- Sufficient color contrast
- Don’t rely on color alone
- Support reduced motion and dark/high‑contrast modes

Content
- Plain language; short sentences and paragraphs
- Avoid all caps; use sentence case or title case
