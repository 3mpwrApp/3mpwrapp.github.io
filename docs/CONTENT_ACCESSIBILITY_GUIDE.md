# Content Accessibility Guidelines for 3mpwr

**Version:** 1.0  
**Last Updated:** May 11, 2026  
**Audience:** Content authors, bloggers, documentation writers

This guide ensures all content on 3mpwrapp.ca meets WCAG 2.2 Level AAA standards and serves our community of injured workers and persons with disabilities effectively.

---

## 🎯 Core Principles

1. **Inclusive Language**: Speak to injured workers, persons with disabilities, and advocates
2. **Plain Language**: Flesch-Kincaid Grade 8 target (12th grade maximum)
3. **Accessible by Default**: Every piece of content must work with screen readers, keyboard navigation, and high contrast modes
4. **SEO & Discoverability**: Help users find critical resources through search engines

---

## ✅ Quick Checklist for Every Post

Before publishing, verify:

- [ ] Title is descriptive and unique (50-60 characters for SEO)
- [ ] Meta description summarizes content (150-160 characters)
- [ ] All images have meaningful alt text
- [ ] Headings follow hierarchy (H1 → H2 → H3, no skips)
- [ ] Links use descriptive text (not "click here")
- [ ] Color contrast passes WCAG AAA (7:1 for text, 3:1 for UI)
- [ ] Tables have captions and proper headers
- [ ] Plain language summary provided for complex topics
- [ ] Content is scannable (short paragraphs, bulleted lists)
- [ ] No flashing or rapidly moving content

---

## 📝 Writing Accessible Content

### Plain Language Guidelines

**DO:**
- Use short sentences (15-20 words average)
- Use active voice ("WSIB denied the claim" not "The claim was denied by WSIB")
- Define technical/legal terms on first use
- Use common words ("use" not "utilize", "help" not "facilitate")
- Break complex ideas into bullet points
- Use "you" to address readers directly

**DON'T:**
- Use jargon without explanation
- Write walls of text (>150 words without breaks)
- Use passive voice excessively
- Assume prior knowledge of legal processes

**Readability Target:**
- Flesch-Kincaid Grade Level: 8 (max 12 for complex topics)
- Check with: https://readable.com or https://hemingwayapp.com

### Heading Hierarchy

✅ **Correct:**
```markdown
# Main Title (H1 - only one per page)

## Section 1 (H2)

### Subsection 1.1 (H3)

### Subsection 1.2 (H3)

## Section 2 (H2)

### Subsection 2.1 (H3)
```

❌ **Incorrect:**
```markdown
# Main Title (H1)

### Skipped H2! (H3) ← BAD
```

**Rules:**
1. Only one H1 per page (the title)
2. Never skip heading levels
3. Use headings for structure, not styling
4. Headings must describe the section content

### Link Text

✅ **Accessible Link Text:**
- "Read the [WSIAT Chronic Pain Guide](link)"
- "Download the [Appeal Template (PDF, 250 KB)](link)"
- "Learn about [Bill 86 changes to pre-existing conditions](link)"

❌ **Inaccessible Link Text:**
- "Click [here](link)" ← Screen readers read "link, click here" (no context!)
- "[www.wsiat.on.ca](link)" ← URLs are meaningless to screen readers
- "Read more" ← "More" of what?

**Rules:**
1. Link text must describe the destination
2. Don't rely on surrounding text for context
3. Include file type and size for downloads (PDF, DOCX, etc.)
4. Use unique link text (avoid multiple "Read more" links on same page)

---

## 🖼️ Images & Alt Text

### Alt Text Best Practices

**Informative Images** (convey information):
```markdown
![Bar chart showing WSIAT appeal success rates by injury type. Chronic pain: 42%, Back injuries: 58%, Mental health: 31%](image.png)
```

**Decorative Images** (no information, just aesthetics):
```markdown
<img src="decorative-line.png" alt="" role="presentation">
```

**Complex Images** (charts, diagrams):
```markdown
![Flowchart of WSIB appeal process](appeal-flowchart.png)

**Description:** This flowchart shows the 6-step WSIB appeal process:
1. Receive denial letter...
[Full text description below image]
```

**Rules:**
1. Alt text for informative images: describe the content and context
2. Alt text for decorative images: use empty alt (`alt=""`)
3. Complex images: short alt + detailed description below
4. Max 150 characters for alt text (use long description for more)
5. Don't start with "Image of..." (screen readers already announce "image")
6. Include data from charts in accessible format (table or list)

### Image Guidelines

- **Format:** Use WebP with PNG/JPG fallback (already automated via `webp-picture.html` include)
- **Size:** Max 1200px width for blog images
- **File size:** Max 200 KB per image (compress with TinyPNG)
- **Color contrast:** Text overlays must meet 4.5:1 contrast minimum

---

## 📊 Tables

All tables must have:
1. Caption describing the table purpose
2. Header cells (`<th>`) with `scope` attribute
3. Simple structure (avoid merged cells if possible)

✅ **Accessible Table:**
```markdown
<table>
  <caption>WSIAT Decision Outcomes by Year</caption>
  <thead>
    <tr>
      <th scope="col">Year</th>
      <th scope="col">Appeals</th>
      <th scope="col">Success Rate</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">2024</th>
      <td>1,234</td>
      <td>45%</td>
    </tr>
  </tbody>
</table>
```

**For complex tables:** Provide CSV download link for screen reader users.

---

## 🎨 Color & Contrast

### Color Contrast Requirements (WCAG AAA)

- **Normal text:** 7:1 minimum
- **Large text (18pt+):** 4.5:1 minimum
- **UI elements:** 3:1 minimum (buttons, form borders, focus indicators)

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Built into browser DevTools (Chrome, Firefox)

### Don't Rely on Color Alone

❌ **Bad:** "Click the green button to continue"  
✅ **Good:** "Click the Continue button"

❌ **Bad:** "Red items require attention"  
✅ **Good:** "Items marked with ⚠️ require attention"

**Rules:**
1. Use color + text labels
2. Use color + icons
3. Use color + patterns/textures (in charts)

---

## 📹 Video & Audio

### Video Requirements

1. **Captions:** All videos must have captions (YouTube auto-captions acceptable as baseline)
2. **Transcripts:** Provide downloadable transcript for critical content
3. **Audio descriptions:** For complex visuals (optional for basic talking-head videos)
4. **No autoplay:** Videos must not autoplay with sound

### YouTube Embeds

Use VideoObject schema (automatically added by site template):

```yaml
---
title: "WSIB Appeals 101"
youtube_id: "abc123xyz"
video_duration: "PT10M30S"  # 10 minutes 30 seconds
video_upload_date: "2026-05-01"
---
```

---

## 📋 Forms

### Form Accessibility Checklist

- [ ] Every input has a `<label>` with matching `for` attribute
- [ ] Required fields marked with `aria-required="true"` AND visible indicator
- [ ] Instructions provided before form, not just in placeholder text
- [ ] Error messages are specific ("Email format invalid" not "Error")
- [ ] Errors linked with `aria-describedby`
- [ ] Success messages announced with `role="alert"`

**Example:** See [_includes/contact-form-aaa.html](../_includes/contact-form-aaa.html) for reference implementation.

---

## 🧠 Cognitive Accessibility

### Make Content Scannable

- Use bulleted lists for 3+ items
- Use numbered lists for sequential steps
- Highlight key information in callout boxes
- Use subheadings every 200-300 words

### Provide Context & Definitions

**On first use of legal/medical terms:**
```markdown
The worker filed a Form 6 (**Request for Reconsideration** - the first step to appeal a WSIB decision).
```

**For complex topics, add a "Simple Language Summary":**
```markdown
---
title: "Bill 86: Pre-Existing Conditions Changes"
plain_language_summary: "Bill 86 changed the rules. Now, if you had a condition before your workplace injury, WSIB can't use that as the only reason to deny your claim."
---
```

### Reduce Cognitive Load

- One main idea per paragraph
- Chunk instructions into steps
- Use examples to illustrate abstract concepts
- Provide "What this means for you" summaries

---

## 🔍 SEO Best Practices

### Required Frontmatter

Every blog post and guide must include:

```yaml
---
layout: post
title: "Descriptive Title (50-60 chars)"
date: 2026-05-11
categories: [research, advocacy, community]
tags: [wsib, chronic-pain, appeal-tips]
excerpt: "150-160 character summary for search engines and social media"
featured: false
toc: true  # Table of contents for long guides
image: /assets/images/post-image.png
image_alt: "Descriptive alt text for social sharing"
author: 3mpwr Team
lang: en
---
```

### SEO Guidelines

1. **Title Tag:** 50-60 characters, include primary keyword
2. **Meta Description:** 150-160 characters, compelling + includes keyword
3. **URL Slug:** Use hyphens, lowercase, descriptive (e.g., `/wsib-chronic-pain-guide`)
4. **Internal Linking:** Link to 2-3 related articles per post
5. **External Links:** Link to authoritative sources (government sites, tribunals)
6. **Keywords:** Use naturally, don't stuff (aim for 1-2% density)

### Structured Data

Automatically generated for:
- Blog posts (BlogPosting schema)
- Guides (Article schema)
- FAQ pages (FAQPage schema)
- Videos (VideoObject schema)

**To add custom FAQ schema:**
```markdown
---
faq:
  - question: "What is a Form 6?"
    answer: "A Form 6 is a Request for Reconsideration..."
  - question: "How long do I have to file?"
    answer: "You have 6 months from the decision date..."
---
```

---

## ♿ Testing Your Content

### Before Publishing

1. **Automated Tests** (will run in CI):
   - pa11y-ci (WCAG 2.2 AAA)
   - axe-core (WCAG violations)
   - Lighthouse (accessibility score)

2. **Manual Checks:**
   - [ ] Navigate page with keyboard only (Tab, Shift+Tab, Enter, Space)
   - [ ] Test with screen reader (NVDA on Windows, VoiceOver on Mac)
   - [ ] View in high contrast mode (Windows: Shift+Alt+Print Screen)
   - [ ] Zoom to 200% (no horizontal scrolling except tables)
   - [ ] Check color contrast with DevTools
   - [ ] Verify in light mode, dark mode, high contrast mode

3. **Readability Check:**
   - Paste content into Hemingway App (aim for Grade 8 or lower)
   - Ask: "Would someone with a concussion understand this?"

### Quick Screen Reader Test (Windows + Chrome)

1. Install NVDA (free): https://www.nvaccess.org/download/
2. Press `Ctrl+Alt+N` to start NVDA
3. Navigate page with:
   - `H` key: Jump between headings
   - `Tab` key: Navigate links/buttons
   - `T` key: Navigate tables
   - `B` key: Navigate buttons
   - `Insert+F7`: List all links/headings

---

## 📚 Resources & Tools

### Writing Tools
- **Hemingway App:** https://hemingwayapp.com (readability)
- **Grammarly:** https://grammarly.com (grammar + tone)
- **LanguageTool:** https://languagetool.org (open-source alternative)

### Accessibility Tools
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WAVE:** https://wave.webaim.org (visual accessibility check)
- **axe DevTools:** Browser extension for Chrome/Firefox
- **NVDA Screen Reader:** https://www.nvaccess.org (free for Windows)
- **ChromeVox:** Chrome extension screen reader

### SEO Tools
- **Google Search Console:** https://search.google.com/search-console
- **Yoast SEO (plugin):** For real-time SEO feedback
- **Screaming Frog:** Site crawling and auditing (free up to 500 URLs)

### Image Tools
- **TinyPNG:** https://tinypng.com (compress images)
- **Squoosh:** https://squoosh.app (Google's image optimizer)
- **Canva:** https://canva.com (accessible image creation with templates)

---

## ❓ Common Questions

### Q: Can I use "click here" if the link is descriptive elsewhere?
**A:** No. Screen reader users often navigate by links only, skipping surrounding text. Each link must be self-describing.

### Q: Do I need alt text for logos?
**A:** Yes. For the site logo: `alt="3mpwr App logo"`. For external logos: `alt="WSIB logo"`.

### Q: What if my image has a lot of text?
**A:** Best practice: Don't embed text in images. If necessary, include the full text in alt attribute or provide transcript below.

### Q: Can I use PDF downloads?
**A:** Yes, but:
1. Ensure PDFs are tagged and accessible
2. Provide HTML alternative when possible
3. Include file size in link text: "(PDF, 2.5 MB)"

### Q: How do I add a plain language summary?
**A:** Add to frontmatter:
```yaml
plain_language_summary: "Short, simple explanation here."
```

### Q: What's the difference between caption and alt text?
- **Alt text:** Screen reader description (not visible)
- **Caption:** Visible text below image for all users
- **Title:** Tooltip on hover (avoid, use alt text instead)

---

## 🚨 Accessibility Red Flags

**If you see any of these, stop and fix immediately:**

❌ Images without alt text  
❌ Links that say "click here" or "read more"  
❌ Headings used for styling (e.g., H3 for larger text)  
❌ Color as the only way to convey information  
❌ Forms without labels  
❌ Videos without captions  
❌ Text over images with poor contrast  
❌ Flashing/blinking content  
❌ PDFs that aren't tagged  
❌ Tables without headers  

---

## 📞 Get Help

**Questions about accessibility?**
- Review [accessibility.md](../accessibility.md) for site-wide features
- Check [COMPONENT_A11Y_DOCS.md](./COMPONENT_A11Y_DOCS.md) for reusable patterns
- Ask in #accessibility channel (if Slack/Discord set up)
- Email: accessibility@3mpwrapp.ca

**Pre-Commit Hooks Failed?**
- HTML validation error: Check for unclosed tags
- Alt text missing: Add descriptive alt to all `<img>` tags
- Heading skip: Review heading hierarchy (H1 → H2 → H3)
- Contrast failure: Use WebAIM Contrast Checker to fix colors

---

## 📄 Version History

- **1.0** (May 11, 2026): Initial release
  - Plain language guidelines
  - Alt text best practices
  - Heading hierarchy rules
  - Link text standards
  - SEO frontmatter requirements
  - Cognitive accessibility guidance

---

**Remember:** Accessibility isn't a checklist—it's about ensuring every person, regardless of disability, can access the critical information and tools they need to navigate the WSIB system and advocate for their rights.

When in doubt, ask: "Would this work for someone who..."
- Uses a screen reader?
- Can only use a keyboard?
- Has a brain injury and gets easily overwhelmed?
- Is reading this on a phone in bright sunlight?
- Is new to WSIB and doesn't know the terminology?

If the answer is "no" or "maybe," it needs improvement.
