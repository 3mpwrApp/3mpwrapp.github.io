# Social Share Images - Implementation Guide

**Created:** January 15, 2026  
**Status:** Ready for Design  
**Format:** 1200×630px PNG (optimized for social media)  
**Location:** `/assets/images/social-share-*.png`

---

## 🎨 Required Images (5 total)

### 1. Homepage (`social-share-home.png`)

**Dimensions:** 1200×630px  
**Purpose:** Default share image for main landing page

**Design Elements:**
- **Background:** 3mpwr App brand gradient (purple #3d4eaa → deep purple #4a2867)
- **Hero Text:** "3mpwrApp: Community-Powered Disability Support"
- **Visual:** Diverse group of people (illustrated or stylized) representing injured workers & persons with disabilities
- **Icons:** Small accessibility icons (♿🧠💙) overlaid subtly
- **Badge:** "100% Free" in contrasting color (yellow/gold)
- **Footer:** "Join thousands in beta | Canada-wide support"

**Message Focus:** Community connection + accessibility + free platform

---

### 2. About Page (`social-share-about.png`)

**Dimensions:** 1200×630px  
**Purpose:** Share image for /about page

**Design Elements:**
- **Background:** Warm gradient (orange #f97316 → deep orange #ea580c)
- **Hero Text (LARGE):** "Nothing About Us Without Us"
- **Subtext:** "Built BY injured workers & disabled people, FOR the community"
- **Visual:** Team photo or illustrated group showing diversity
- **Founder Highlight:** Small headshot or avatar with "Founded by Lissa Beaulieu"
- **Footer:** "Learn our story → 3mpwrapp.ca/about"

**Message Focus:** Lived experience + community-led + authentic representation

---

### 3. Features Page (`social-share-features.png`)

**Dimensions:** 1200×630px  
**Purpose:** Share image for /features/ page

**Design Elements:**
- **Background:** Split gradient (left: blue #3b82f6, right: green #22c55e)
- **Hero Text:** "60+ Features Designed BY & FOR Disabled People"
- **Visual:** 3×3 grid showcase of key features with icons:
  - 🗂️ Evidence Locker
  - 📊 Pain Tracker
  - 🧠 Brain Fog Helper
  - 💊 Medication Manager
  - 🔥 Pain Flare Mode
  - 💙 Need a Break Button
  - 📝 Legal Resources
  - 🤝 Community Support
  - 🥄 Spoons Tracker
- **Footer:** "Accessibility you won't find anywhere else"

**Message Focus:** Comprehensive toolset + disability-centric design

---

### 4. Accessibility Page (`social-share-accessibility.png`)

**Dimensions:** 1200×630px  
**Purpose:** Share image for /accessibility page

**Design Elements:**
- **Background:** Professional gradient (dark blue #1e3a8a → purple #6d28d9)
- **Hero Badge (CENTER):** Large WCAG AAA compliance badge showing "82% AAA | 98% AA"
- **Text:** "Revolutionary Accessibility Features"
- **Feature Callouts:**
  - "13 Unique Disability Tools"
  - "Brain Fog Helper | Pain Flare Mode | Spoons Tracker"
  - "Built for chronic pain, fatigue, cognitive differences"
- **Footer:** "Canada's gold standard for disability-inclusive design"

**Message Focus:** WCAG compliance + innovative accessibility + industry leadership

---

### 5. Beta/Waitlist Page (`social-share-beta.png`)

**Dimensions:** 1200×630px  
**Purpose:** Share image for /app-waitlist and beta-related pages

**Design Elements:**
- **Background:** Urgent gradient (red #dc2626 → purple #9333ea)
- **Hero Text (BOLD):** "Join the Beta"
- **Urgency Banner:** "PUBLIC BETA NOW OPEN"
- **Subtext:** "Be among the first to access revolutionary disability support"
- **Visual:** Call-to-action arrows pointing toward "JOIN NOW" button illustration
- **Features Highlight:** "60+ tools | 100% free | Community-powered"
- **Footer:** "Your voice shapes the future → 3mpwrapp.ca/app-waitlist"

**Message Focus:** Urgency + exclusivity + user impact

---

## 🎯 Design Guidelines (All Images)

### Accessibility Requirements
- **Contrast Ratio:** Minimum 4.5:1 for all text elements (WCAG AA)
- **Font Size:** Minimum 48px for body text, 72px+ for headings
- **Font:** Sans-serif, high-legibility (e.g., Inter, Open Sans, Roboto)
- **Icon Size:** Minimum 64×64px for recognizability
- **Alt Text:** Provided in meta tags (see `_includes/social-share-tags.html`)

### Technical Specifications
- **Format:** PNG-24 with transparency support
- **Color Space:** sRGB
- **Resolution:** 72 DPI (web-optimized)
- **File Size:** Target <300KB per image (optimize with ImageOptim or TinyPNG)
- **Naming:** `social-share-{page}.png` (lowercase, hyphenated)

### Brand Consistency
- **Logo:** Include small 3mpwrApp logo in corner (100×100px max)
- **Color Palette:** Use established brand gradients from website
- **Tone:** Professional yet approachable, community-focused
- **Imagery:** Prioritize authentic disability representation (avoid inspiration porn)

---

## 📁 File Locations

Save all images to:
```
/assets/images/social-share-*.png
```

**Required Files:**
1. `social-share-home.png`
2. `social-share-about.png`
3. `social-share-features.png`
4. `social-share-accessibility.png`
5. `social-share-beta.png`

**Optional (Recommended):**
- `social-share-default.png` - Fallback image for pages without specific images

---

## ✅ Implementation Checklist

- [ ] Design all 5 images per specifications above
- [ ] Optimize images (target <300KB each)
- [ ] Upload to `/assets/images/` directory
- [ ] Test Open Graph tags with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test Twitter Cards with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Test LinkedIn previews by sharing test links
- [ ] Verify accessibility contrast ratios with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] Update `social-share-tags.html` if image names change

---

## 🔗 Related Files

- **Meta Tags:** `_includes/social-share-tags.html`
- **Specifications:** `SOCIAL-SHARE-OPTIMIZATION-PLAN.md`
- **Integration:** `_includes/custom-head.html`

---

## 📊 Expected Impact

Based on industry benchmarks:
- **+150% CTR improvement** from rich social previews
- **+50% beta signups** from enhanced share visibility
- **3-5x higher engagement** on social media posts
- **Improved brand recognition** through consistent visual identity

---

## 🎨 Design Tools

**Recommended Tools:**
- **Figma** - Collaborative design (free tier available)
- **Canva** - Quick templates (Pro recommended for brand kit)
- **Adobe XD** - Professional design tool
- **GIMP** - Free open-source alternative to Photoshop

**Templates:**
- Canva has pre-sized OG image templates (search "Open Graph")
- Figma community has free social media templates

---

## 📞 Questions?

Contact the design team or Lissa for:
- Brand asset access (logos, color codes)
- Image review and feedback
- Technical implementation support

**Email:** empowrapp08162025@gmail.com
