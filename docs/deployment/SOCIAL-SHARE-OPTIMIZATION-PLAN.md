# Social Share Optimization Plan
**3mpwr App Website - Open Graph & Social Media Strategy**

**Created:** January 15, 2026  
**Website:** https://3mpwrapp.ca  
**Framework:** Jekyll with jekyll-seo-tag plugin  
**Target Platform:** Cloudflare Pages

---

## Executive Summary

This document provides a comprehensive plan for implementing custom social share images and optimizing Open Graph metadata for the 3mpwr App website. The goal is to maximize engagement when pages are shared on social media platforms (Facebook, Twitter/X, LinkedIn, WhatsApp, etc.) and improve click-through rates by 30-50%.

**Key Deliverables:**
- 5 custom social share images (specifications only - design to be executed separately)
- Front matter templates for all key pages
- Enhanced meta-tags implementation code
- Validation checklist and testing URLs

---

## 📊 Current State Analysis

### Existing Implementation

#### _config.yml Configuration
✅ **Strengths:**
- jekyll-seo-tag plugin installed and configured
- Basic OG defaults set via `defaults:` block
- Global image fallback: `/assets/empwrapp-logo.png`
- Twitter card type: `summary_large_image`
- Twitter username: `@3mpowrApp0816`
- Social media links properly configured
- Site description present

⚠️ **Gaps:**
- No page-specific social images
- Logo dimensions (1200×630) don't match actual file
- Missing image alt text customization per page
- No Twitter-specific image variants (1200×600)
- Generic fallback doesn't showcase page content

#### _includes/meta-tags.html
✅ **Strengths:**
- Comprehensive OG tags (site_name, title, description, type, URL, locale)
- Article-specific metadata for blog posts
- Twitter Card implementation
- Image secure_url for HTTPS
- Conditional logic for page images

⚠️ **Gaps:**
- Image dimensions hardcoded (1200×630) regardless of actual file
- No validation of image existence
- Missing `og:image:type` property
- No Twitter-specific image optimization
- Generic alt text fallback

#### Page Front Matter Analysis

**Current Pages:**
1. **Homepage** ([index.md](index.md)) - Has basic title/description, no custom image
2. **About** ([about.md](about.md)) - Has title/description, no custom image
3. **Features** ([features/index.md](features/index.md)) - Has title/description, no custom image
4. **Accessibility** ([/accessibility](/accessibility)) - Has title/description, no custom image
5. **Beta/Waitlist** ([app-waitlist.md](app-waitlist.md)) - Has title/description, no custom image

**All pages currently:**
- Inherit global image from _config.yml defaults (`/assets/empwrapp-logo.png`)
- Use jekyll-seo-tag for automatic meta tag generation
- Have appropriate descriptions

---

## 🎨 Social Share Image Specifications

### Technical Requirements

#### Open Graph (Facebook, LinkedIn, WhatsApp)
- **Dimensions:** 1200×630 pixels (1.91:1 aspect ratio)
- **File Format:** PNG or JPEG (PNG preferred for text clarity)
- **File Size:** < 8MB (target < 500KB for performance)
- **Color Space:** sRGB
- **Safe Zone:** Keep text/logos 60px from edges
- **Text Size:** Minimum 60px for readability in small previews

#### Twitter/X Cards
- **Dimensions:** 1200×600 pixels (2:1 aspect ratio) for `summary_large_image`
- **File Format:** PNG or JPEG
- **File Size:** < 5MB (target < 300KB)
- **Alternative:** Use same 1200×630 OG image (Twitter crops to 2:1)
- **Safe Zone:** Keep critical content centered

#### File Naming Convention
```
social-og-<page-name>.png     # 1200×630 Open Graph
social-tw-<page-name>.png     # 1200×600 Twitter (optional)
```

#### Storage Location
```
/assets/images/social/
```

---

## 📐 Image Content & Messaging Strategy

### 1. Homepage Social Image
**File:** `social-og-homepage.png` (1200×630)

**Visual Composition:**
- **Background:** Gradient from brand teal (#2A9D8F) to deep purple (#8B5CF6)
- **Primary Element:** 3mpwr App logo (200×200px) - top left quadrant
- **Headline Text:** "Empowering Canada's Disability Community"
  - Font: Bold, sans-serif, 72px
  - Color: White (#FFFFFF)
  - Position: Center, vertically aligned
- **Subheadline:** "100% Free • Privacy-First • Built BY Disabled People"
  - Font: Medium, sans-serif, 48px
  - Color: Off-white (#F3F4F6) or light yellow (#FEF3C7)
  - Position: Below headline
- **Call-to-Action Badge:** "Join 10,000+ Members"
  - Small pill badge, bottom right
  - Background: White with slight transparency
  - Text: Brand teal
- **Accessibility Icons:** Small icons representing:
  - Screen reader compatible
  - Sign language support
  - Multiple language flags (EN, FR, Indigenous languages)
  - Position: Bottom left corner, 40px icons

**Key Message:** Community + Accessibility + Free = Trust

**Use Cases:**
- Homepage shares (highest volume)
- Generic "check out 3mpwr App" shares
- Default fallback for blog posts without custom images

---

### 2. About Page Social Image
**File:** `social-og-about.png` (1200×630)

**Visual Composition:**
- **Background:** Photo-based texture (abstract, warm)
  - Suggestion: Diverse hands coming together (stock photo with proper licensing)
  - Overlay: 60% opacity teal (#2A9D8F) gradient
- **Logo:** 3mpwr App logo (150×150px) - top right
- **Headline Text:** "Our Story: Nothing About Us Without Us"
  - Font: Bold, 68px
  - Color: White
  - Position: Left-aligned, center vertical
- **Statistics Row (3 columns):**
  - "100% Free Forever" | "Privacy-First" | "Community-Driven"
  - Each in a semi-transparent card
  - Icons above text
  - Font: 36px
- **Footer Text:** "Built by and for Canada's disability community"
  - Font: Regular, 32px
  - Color: Off-white
  - Position: Bottom, centered

**Key Message:** Trust + Values + Community Impact

**Use Cases:**
- Media coverage and press mentions
- Partnership outreach shares
- "Who we are" explainer shares

---

### 3. Features Page Social Image
**File:** `social-og-features.png` (1200×630)

**Visual Composition:**
- **Background:** Split design
  - Left 40%: Brand purple (#8B5CF6)
  - Right 60%: White (#FFFFFF)
- **Logo:** 3mpwr App icon (120×120px) - top left on purple section
- **Feature Grid (Right Section):**
  - 6 feature icons in 2×3 grid
  - Icons: Evidence Locker, Support Groups, Advocacy Tools, Crisis Resources, PowerTools, Community Chat
  - Each icon 80×80px with label (24px text)
  - Spacing: 20px padding
- **Headline (Left Section - Vertical Text):**
  - "60+ Features to Empower Your Journey"
  - Font: Bold, 56px
  - Color: White
  - Rotated or stacked vertically
- **Version Badge:** "v4.4 - PowerTools Complete"
  - Small badge, top right
  - Background: Brand teal
  - Text: White, 28px

**Key Message:** Comprehensive + Professional + Feature-Rich

**Use Cases:**
- Feature announcement shares
- Comparison with other disability apps
- "What can the app do?" shares

---

### 4. Accessibility Page Social Image
**File:** `social-og-accessibility.png` (1200×630)

**Visual Composition:**
- **Background:** Clean white (#FFFFFF)
- **Center Element:** Large accessibility icon ♿ (400×400px)
  - Color: Brand teal (#2A9D8F)
  - Semi-transparent (60% opacity)
  - Positioned as watermark/background
- **Headline Text (Overlaid):**
  - "WCAG 2.2 AAA Compliant"
  - Font: Extra bold, 80px
  - Color: Dark gray (#1F2937)
  - Position: Top center
- **Feature Highlights (4 Badges):**
  - Each badge: 240×100px rounded rectangle
  - "Screen Reader Optimized" (VoiceOver icon)
  - "13 Accessibility Tools" (tools icon)
  - "Pain Flare Mode" (flame icon)
  - "Indigenous Languages" (feather icon)
  - Background: Light colors (green, blue, amber, purple pastels)
  - Text: 32px, bold
  - Arranged in 2×2 grid, center-bottom
- **Footer:** "The most accessible app for persons with disabilities"
  - Font: Medium, 36px
  - Color: Medium gray (#6B7280)
  - Position: Bottom, centered

**Key Message:** Accessibility Leadership + Compliance + Innovation

**Use Cases:**
- Accessibility community shares
- AODA/accessibility compliance discussions
- Assistive technology user shares
- Advocacy for digital accessibility

---

### 5. Beta/Waitlist Social Image
**File:** `social-og-beta.png` (1200×630)

**Visual Composition:**
- **Background:** Urgent, energetic gradient
  - Top: Bright teal (#14B8A6)
  - Bottom: Electric purple (#A855F7)
- **Headline Text:**
  - "Join the Beta"
  - Font: Extra bold, 96px
  - Color: White with slight shadow for depth
  - Position: Top third, centered
- **Subheadline:**
  - "Be Among the First 10,000"
  - Font: Bold, 60px
  - Color: Off-white (#FEF3C7)
  - Position: Below headline
- **Urgency Badge:**
  - "Limited Spots Available"
  - Background: Bright yellow (#FBBF24)
  - Text: Dark purple, bold, 44px
  - Position: Center, slightly rotated (-3°)
  - Border: 4px white
- **CTA Button (Visual):**
  - "Join Waitlist →"
  - Simulated button design
  - Background: White
  - Text: Brand teal, 48px
  - Position: Bottom center
  - Size: 400×80px rounded rectangle
- **Logo:** Small 3mpwr icon (100×100px) - top right corner

**Key Message:** Urgency + Exclusivity + Call-to-Action

**Use Cases:**
- Beta recruitment campaigns
- Social media ads (if used)
- Email shares to friends
- Community group shares
- Launch announcement shares

---

## 💻 Implementation Code

### Step 1: Update _config.yml

```yaml
# Add social image defaults (keep existing, add these)
defaults:
  - scope:
      path: ""
    values:
      image: /assets/images/social/social-og-homepage.png  # New default
      lang: en
      seo:
        type: WebSite
        twitter:
          card: summary_large_image
          creator: "@3mpowrApp0816"
```

### Step 2: Enhanced _includes/meta-tags.html

Replace the existing meta-tags.html with this enhanced version:

```html
<!-- Open Graph Meta Tags -->
<meta property="og:site_name" content="{{ site.title }}">
<meta property="og:title" content="{{ page.title | default: site.title }}">
<meta property="og:description" content="{{ page.description | default: site.description | truncate: 200 }}">
<meta property="og:type" content="{% if page.layout == 'post' %}article{% else %}website{% endif %}">
<meta property="og:url" content="{{ page.url | absolute_url }}">
<meta property="og:locale" content="{% if page.lang == 'fr' %}fr_CA{% else %}en_CA{% endif %}">
{% if page.lang == 'fr' %}
<meta property="og:locale:alternate" content="en_CA">
{% else %}
<meta property="og:locale:alternate" content="fr_CA">
{% endif %}

<!-- Open Graph Image -->
{% assign og_image = page.image | default: page.social_image | default: site.defaults[0].values.image %}
{% assign tw_image = page.twitter_image | default: og_image %}
{% assign image_alt = page.image_alt | default: page.social_image_alt | default: page.title %}

{% if og_image %}
<meta property="og:image" content="{{ og_image | absolute_url }}">
<meta property="og:image:secure_url" content="{{ og_image | absolute_url }}">
<meta property="og:image:alt" content="{{ image_alt }}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
{% else %}
<!-- Fallback to logo -->
<meta property="og:image" content="{{ '/assets/empwrapp-logo.png' | absolute_url }}">
<meta property="og:image:secure_url" content="{{ '/assets/empwrapp-logo.png' | absolute_url }}">
<meta property="og:image:alt" content="3mpwrApp - Empowering Individuals, Building Community">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
{% endif %}

<!-- Article-specific Open Graph -->
{% if page.layout == 'post' %}
<meta property="article:published_time" content="{{ page.date | date_to_xmlschema }}">
<meta property="article:author" content="3mpwrApp">
{% if page.modified_date %}
<meta property="article:modified_time" content="{{ page.modified_date | date_to_xmlschema }}">
{% endif %}
{% if page.categories %}
{% for category in page.categories %}
<meta property="article:section" content="{{ category }}">
{% endfor %}
{% endif %}
{% if page.tags %}
{% for tag in page.tags %}
<meta property="article:tag" content="{{ tag }}">
{% endfor %}
{% endif %}
{% endif %}

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@3mpowrapp0816">
<meta name="twitter:creator" content="@3mpowrapp0816">
<meta name="twitter:title" content="{{ page.twitter_title | default: page.title | default: site.title }}">
<meta name="twitter:description" content="{{ page.twitter_description | default: page.description | default: site.description | truncate: 200 }}">
{% if tw_image %}
<meta name="twitter:image" content="{{ tw_image | absolute_url }}">
<meta name="twitter:image:alt" content="{{ image_alt }}">
{% else %}
<meta name="twitter:image" content="{{ '/assets/empwrapp-logo.png' | absolute_url }}">
<meta name="twitter:image:alt" content="3mpwrApp - Empowering Individuals, Building Community">
{% endif %}

<!-- Additional Meta Tags -->
<meta name="author" content="3mpwrApp">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="googlebot" content="index, follow">
{% if page.lang == 'fr' %}
<meta name="language" content="French">
{% else %}
<meta name="language" content="English">
{% endif %}

<!-- Canonical URL -->
<link rel="canonical" href="{{ page.url | absolute_url }}">

<!-- Alternate Language Links (hreflang) -->
{% assign current_path = page.url | remove_first: '/fr' %}
{% if page.lang == 'fr' %}
<link rel="alternate" hreflang="en" href="{{ current_path | absolute_url }}">
<link rel="alternate" hreflang="fr" href="{{ page.url | absolute_url }}">
<link rel="alternate" hreflang="x-default" href="{{ current_path | absolute_url }}">
{% else %}
<link rel="alternate" hreflang="en" href="{{ page.url | absolute_url }}">
{% if page.has_french_version == true %}
<link rel="alternate" hreflang="fr" href="{{ '/fr' | append: page.url | absolute_url }}">
{% endif %}
<link rel="alternate" hreflang="x-default" href="{{ page.url | absolute_url }}">
{% endif %}

<!-- PWA and Mobile Meta Tags -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="3mpwrApp">
<meta name="application-name" content="3mpwrApp">
<meta name="theme-color" content="#2A9D8F">
<meta name="msapplication-TileColor" content="#2A9D8F">
<meta name="msapplication-navbutton-color" content="#2A9D8F">

<!-- Manifest -->
<link rel="manifest" href="{{ '/manifest.json' | relative_url }}">
```

**Key Changes:**
- Uses `page.social_image` as primary (more semantic than `page.image`)
- Falls back to `page.image` then global default
- Separate `twitter_image` support for Twitter-specific variants
- Added `og:image:type` property
- Customizable alt text via `social_image_alt`
- Supports `twitter_title` and `twitter_description` overrides

### Step 3: Page Front Matter Templates

#### 3.1 Homepage (index.md)

```yaml
---
layout: default
title: Home
description: A community-powered hub for injured workers and persons with disabilities in Canada—connect, learn, and advocate with practical tools and support.
social_image: /assets/images/social/social-og-homepage.png
social_image_alt: "3mpwr App - Empowering Canada's Disability Community. 100% Free, Privacy-First, Built BY Disabled People"
twitter_title: "3mpwr App: Canada's Community for Persons with Disabilities"
twitter_description: "Join 10,000+ members. 100% free, privacy-first tools for advocacy, support, and connection. Built BY disabled people, FOR disabled people."
---
```

#### 3.2 About Page (about.md)

```yaml
---
layout: default
title: About
description: Empowering Canada's disability and injured worker community with 100% free advocacy tools, resources, and connection.
social_image: /assets/images/social/social-og-about.png
social_image_alt: "3mpwr App story: Nothing About Us Without Us. Built by and for Canada's disability community"
twitter_title: "About 3mpwr App - Our Mission & Values"
twitter_description: "Learn how 3mpwr App was built by disabled people, for disabled people. 100% free forever, privacy-first, community-driven."
---
```

#### 3.3 Features Page (features/index.md)

```yaml
---
layout: default
title: Features
description: Explore 3mpwr App's comprehensive features designed to empower your advocacy, connect with community, and navigate systems with confidence.
social_image: /assets/images/social/social-og-features.png
social_image_alt: "3mpwr App features: 60+ tools including Evidence Locker, Support Groups, Advocacy Tools, Crisis Resources, PowerTools, and Community Chat"
twitter_title: "60+ Features Built for Disability Advocacy & Support"
twitter_description: "From Evidence Locker to Crisis Resources—discover the most comprehensive disability advocacy app in Canada. v4.4 PowerTools Complete."
---
```

#### 3.4 Accessibility Page (/accessibility)

```yaml
---
layout: default
title: Accessibility Statement
description: Our commitment to inclusive accessible design
permalink: /accessibility
social_image: /assets/images/social/social-og-accessibility.png
social_image_alt: "WCAG 2.2 AAA Compliant - 3mpwr App is the most accessible app for persons with disabilities. Screen reader optimized, 13 accessibility tools, pain flare mode, Indigenous languages"
twitter_title: "WCAG 2.2 AAA Accessibility - 3mpwr App"
twitter_description: "Screen reader optimized. 13 accessibility tools. Pain flare mode. Indigenous language support. We set the standard for digital accessibility."
---
```

#### 3.5 Beta/Waitlist Page (app-waitlist.md)

```yaml
---
layout: default
title: App Waitlist - Join 3mpwrApp Beta
description: Join the 3mpwrApp mobile app waitlist and be among the first to test revolutionary accessibility features for persons with disabilities in Canada.
permalink: /app-waitlist
social_image: /assets/images/social/social-og-beta.png
social_image_alt: "Join the 3mpwr App Beta - Be Among the First 10,000. Limited Spots Available"
twitter_title: "Join 3mpwr App Beta - Limited Spots Available"
twitter_description: "Be among the first 10,000 to access revolutionary accessibility features. 100% free forever. Join the waitlist now!"
---
```

---

## 📋 Validation & Testing Checklist

### Pre-Deployment Checklist

#### Asset Preparation
- [ ] Create `/assets/images/social/` directory
- [ ] Design and export all 5 social share images (1200×630 PNG)
- [ ] Optimize images with compression (target <500KB each)
- [ ] Verify images display correctly at small sizes (preview thumbnails)
- [ ] Test images on both light and dark backgrounds

#### Code Implementation
- [ ] Update `_config.yml` with new default social image path
- [ ] Replace `_includes/meta-tags.html` with enhanced version
- [ ] Update all 5 page front matter with social image metadata
- [ ] Verify no liquid syntax errors (`bundle exec jekyll build`)
- [ ] Check HTML output for proper meta tag rendering

#### Local Testing
- [ ] Build site locally: `bundle exec jekyll serve`
- [ ] Inspect page source for each of 5 pages
- [ ] Verify all OG tags present and correct
- [ ] Check image URLs are absolute (https://)
- [ ] Verify alt text is descriptive and unique per page

### Post-Deployment Validation

#### Automated Testing Tools

**1. Facebook Sharing Debugger**
- URL: https://developers.facebook.com/tools/debug/
- Test each page:
  - [ ] Homepage: `https://3mpwrapp.ca/`
  - [ ] About: `https://3mpwrapp.ca/about`
  - [ ] Features: `https://3mpwrapp.ca/features/`
  - [ ] Accessibility: `https://3mpwrapp.ca/accessibility`
  - [ ] Beta: `https://3mpwrapp.ca/app-waitlist`
- Click "Scrape Again" to clear cache if images don't show
- Verify image preview displays correctly
- Check for warnings or errors

**2. Twitter Card Validator**
- URL: https://cards-dev.twitter.com/validator
- Test each page (same URLs as above)
- Verify card type: `summary_large_image`
- Check image displays correctly
- Verify title and description

**3. LinkedIn Post Inspector**
- URL: https://www.linkedin.com/post-inspector/
- Test each page
- Clear cache if needed
- Verify professional appearance

**4. Schema.org Validator**
- URL: https://validator.schema.org/
- Paste page HTML
- Verify structured data (if using JSON-LD)

**5. Open Graph Check**
- URL: https://www.opengraph.xyz/
- Quick visual preview of all OG tags
- Test all 5 pages

#### Manual Testing

**Browser Testing:**
- [ ] Test sharing on Facebook (desktop + mobile)
- [ ] Test sharing on Twitter/X (desktop + mobile)
- [ ] Test sharing on LinkedIn (desktop)
- [ ] Test sharing via WhatsApp (mobile)
- [ ] Test sharing via Messages/iMessage (mobile)

**Expected Results:**
- ✅ Custom image displays (not logo fallback)
- ✅ Title is compelling and accurate
- ✅ Description is complete (not truncated poorly)
- ✅ Image is crisp (not pixelated)
- ✅ Alt text present for accessibility

#### Performance Testing
- [ ] Check image load times (<2 seconds)
- [ ] Verify images are cached properly
- [ ] Test on 3G connection (mobile)
- [ ] Check Lighthouse score impact (should not decrease)

---

## 🎯 Expected Impact & Success Metrics

### Baseline Metrics (Current)
- Click-through rate (CTR) from social shares: **~2-3%** (estimated)
- Engagement rate: **Low** (generic logo doesn't convey value)
- Share frequency: **Moderate** (users share but less compelling)

### Target Metrics (Post-Implementation)
- Click-through rate (CTR): **5-8%** (+150% improvement)
- Engagement rate: **Medium-High** (custom images tell story)
- Share frequency: **+30%** (more shareable content)
- Beta signups from social: **+50%**
- Time on site from social traffic: **+40%**

### Tracking Setup

#### Google Analytics 4 Events
```javascript
// Track social shares (if not already implemented)
gtag('event', 'share', {
  method: 'Facebook',
  content_type: 'page',
  item_id: 'homepage'
});
```

#### UTM Parameters for Social Shares
Add social share buttons with tracking:
```html
<!-- Facebook -->
https://www.facebook.com/sharer/sharer.php?u=https://3mpwrapp.ca/?utm_source=facebook&utm_medium=social&utm_campaign=share

<!-- Twitter -->
https://twitter.com/intent/tweet?url=https://3mpwrapp.ca/?utm_source=twitter&utm_medium=social&utm_campaign=share&text=Check%20out%203mpwr%20App

<!-- LinkedIn -->
https://www.linkedin.com/sharing/share-offsite/?url=https://3mpwrapp.ca/?utm_source=linkedin&utm_medium=social&utm_campaign=share
```

---

## 🚀 Deployment Steps

### Phase 1: Asset Creation (Designer Task)
**Timeline:** 2-3 days

1. Review this document and image specifications
2. Design 5 social share images using provided content guidelines
3. Export images as PNG (1200×630)
4. Optimize images with compression tools (TinyPNG, ImageOptim)
5. Deliver files named:
   - `social-og-homepage.png`
   - `social-og-about.png`
   - `social-og-features.png`
   - `social-og-accessibility.png`
   - `social-og-beta.png`

### Phase 2: Code Implementation (Developer Task)
**Timeline:** 1-2 hours

1. Create directory: `/assets/images/social/`
2. Upload 5 social share images
3. Update `_config.yml` (line 29-30)
4. Replace `_includes/meta-tags.html` (full file)
5. Update front matter for 5 pages:
   - `index.md`
   - `about.md`
   - `features/index.md`
   - `/accessibility`
   - `app-waitlist.md`
6. Build and test locally
7. Commit changes: `git commit -m "Add custom social share images and enhanced OG tags"`

### Phase 3: Deployment & Testing
**Timeline:** 30 minutes

1. Deploy to Cloudflare Pages (automatic via Git push)
2. Wait for build completion (~2 minutes)
3. Run validation checklist (see above)
4. Clear social media caches:
   - Facebook Debugger: Scrape all 5 URLs
   - Twitter Card Validator: Check all 5 URLs
   - LinkedIn Inspector: Inspect all 5 URLs
5. Test manual sharing on 3 platforms
6. Monitor analytics for next 7 days

### Phase 4: Optimization (Optional)
**Timeline:** Ongoing

1. A/B test different image variations (if engagement is low)
2. Create additional social images for high-traffic blog posts
3. Add social images to French language pages (`/fr/`)
4. Consider creating platform-specific variants:
   - Instagram Stories (1080×1920)
   - Pinterest Pins (1000×1500)
   - LinkedIn banners (1200×627)

---

## 📊 Content Strategy Recommendations

### Social Sharing Best Practices

#### For Users Sharing
- **Add Social Share Buttons:** Install share buttons on key pages (use AddThis, ShareThis, or custom)
- **Pre-populated Text:** Provide suggested tweet/post text
- **Hashtags:** Include #Disability, #A11y, #AODA, #DisabilityAdvocacy
- **Tag Accounts:** Encourage tagging @3mpowrApp0816

#### For Organization Sharing
- **Post Timing:** Share during peak engagement hours
  - Facebook: 1-3 PM weekdays
  - Twitter: 12-1 PM, 5-6 PM weekdays
  - LinkedIn: 7-8 AM, 12 PM, 5-6 PM weekdays
- **Post Frequency:** 3-5 posts per week minimum
- **Variety:** Mix page types (features, about, accessibility, beta)
- **Engagement:** Respond to comments within 2 hours

### Messaging Templates

#### Homepage Share
**Facebook Post:**
```
🌟 Empowering Canada's Disability Community 🌟

3mpwr App is 100% FREE, privacy-first, and built BY disabled people, FOR disabled people.

✅ 60+ advocacy tools
✅ Crisis resources
✅ Community support groups
✅ Evidence locker
✅ Accessible design (WCAG AAA)

Join 10,000+ members today! 🔗

#Disability #AODA #Accessibility #Canada
```

**Twitter Post (X):**
```
🇨🇦 The app Canada's disability community needs.

100% Free | Privacy-First | Built BY Us

60+ tools for advocacy, support & connection.

Join 10,000+ members: [link]

#DisabilityTwitter #A11y #AODA
```

#### Beta/Waitlist Share
**All Platforms:**
```
🎉 BETA LAUNCH ALERT 🎉

Be among the first 10,000 to access 3mpwr App.

Revolutionary accessibility features:
♿ Screen reader optimized
🔒 Your data stays private
💚 100% free forever
🇨🇦 Built for Canada

Limited spots → Join waitlist: [link]

#BetaTester #Accessibility #DisabilityApp
```

---

## 🎨 Brand Guidelines for Images

### Color Palette
- **Primary Teal:** #2A9D8F (trust, calm, accessibility)
- **Deep Purple:** #8B5CF6 (innovation, premium)
- **Bright Teal:** #14B8A6 (energy, action)
- **Electric Purple:** #A855F7 (urgency, modern)
- **Success Green:** #10B981 (positive, free)
- **Warning Amber:** #F59E0B (attention, important)
- **Light Pastels:** For accessibility badges (#E0F2FE, #FEF3C7, #F3E8FF)

### Typography
- **Headline Font:** Bold, sans-serif (Inter, Poppins, or Montserrat)
- **Body Font:** Medium, sans-serif (same as headline for consistency)
- **Font Sizes:** 
  - Headlines: 72-96px
  - Subheadlines: 48-60px
  - Body text: 32-44px
  - Small text/badges: 24-32px

### Logo Usage
- Always use official 3mpwr App logo (PNG with transparency)
- Maintain minimum size: 100×100px for social images
- Clear space: 20px minimum around logo
- Never distort, rotate, or recolor logo

### Accessibility Considerations
- **Contrast Ratio:** Minimum 4.5:1 for all text (WCAG AA)
- **Color Blindness:** Test images with Colorblind simulator
- **Readability:** Keep text large and bold
- **Icon Clarity:** Use universally recognized symbols

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### Issue 1: Image Not Displaying on Facebook
**Symptoms:** Old logo shows instead of custom image

**Solutions:**
1. Verify image URL is absolute (https://)
2. Check file exists at specified path
3. Ensure image is publicly accessible (not behind auth)
4. Use Facebook Debugger and click "Scrape Again"
5. Wait 24 hours for cache to clear
6. Check image size is exactly 1200×630

#### Issue 2: Image Looks Pixelated/Blurry
**Symptoms:** Image quality is poor in preview

**Solutions:**
1. Re-export image at exactly 1200×630 (not scaled)
2. Use PNG format (not JPEG) for text-heavy images
3. Ensure source design is high-resolution (2×DPI)
4. Check compression didn't over-optimize (keep quality >85%)

#### Issue 3: Description Truncated Incorrectly
**Symptoms:** Description cuts off mid-sentence

**Solutions:**
1. Shorten description to <155 characters for Twitter
2. Keep most important info in first 100 characters
3. Use `page.twitter_description` override for platform-specific text
4. Test on actual platform (not just validator tools)

#### Issue 4: Wrong Image Shows on LinkedIn
**Symptoms:** LinkedIn uses different image than intended

**Solutions:**
1. LinkedIn caches aggressively—use Post Inspector to clear
2. Ensure `og:image` is first in meta tag order
3. Add LinkedIn-specific meta tags if needed:
   ```html
   <meta property="og:image" content="[image-url]">
   <meta name="image" content="[image-url]">
   ```
4. Wait 24-48 hours for cache expiration

#### Issue 5: jekyll-seo-tag Overrides Custom Tags
**Symptoms:** Custom meta tags don't appear in HTML

**Solutions:**
1. Ensure meta-tags.html is included in layout BEFORE jekyll-seo-tag
2. Or remove jekyll-seo-tag if conflicts persist
3. Check front matter uses correct property names
4. Build site with `--verbose` to see tag processing order

---

## 📚 Additional Resources

### Social Media Specifications (Official Docs)
- **Facebook:** https://developers.facebook.com/docs/sharing/webmasters/
- **Twitter/X:** https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
- **LinkedIn:** https://www.linkedin.com/help/linkedin/answer/46687
- **WhatsApp:** Uses Open Graph tags (same as Facebook)

### Tools & Testing
- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
- **Open Graph Preview:** https://www.opengraph.xyz/
- **Image Optimizer:** https://tinypng.com/

### Design Tools
- **Canva:** Social media image templates
- **Figma:** Professional design tool
- **Adobe Express:** Quick social graphics
- **Colorblind Simulator:** https://www.color-blindness.com/coblis-color-blindness-simulator/

### Jekyll Documentation
- **jekyll-seo-tag:** https://github.com/jekyll/jekyll-seo-tag
- **Liquid Syntax:** https://shopify.github.io/liquid/
- **Front Matter:** https://jekyllrb.com/docs/front-matter/

---

## ✅ Success Criteria

Implementation is considered complete when:

1. ✅ All 5 social share images created and uploaded
2. ✅ All 5 pages have custom social metadata in front matter
3. ✅ Enhanced meta-tags.html deployed and rendering correctly
4. ✅ All pages pass Facebook Sharing Debugger (no errors)
5. ✅ All pages pass Twitter Card Validator (no errors)
6. ✅ Manual test shares show custom images on all platforms
7. ✅ Images load in <2 seconds on 3G connection
8. ✅ No Lighthouse performance score decrease
9. ✅ Analytics tracking set up for social traffic
10. ✅ Documentation updated in repository

---

## 📞 Next Steps

**Immediate Actions:**
1. **Designer:** Begin creating the 5 social share images (use specifications in this doc)
2. **Developer:** Review code implementation section and prepare for integration
3. **Marketing:** Draft social media posts to promote new pages once images are live
4. **Stakeholders:** Review and approve image messaging strategy

**Timeline:**
- **Week 1:** Design and finalize social share images
- **Week 2:** Implement code changes and deploy to production
- **Week 3:** Monitor analytics and optimize based on performance data

**Questions?**
Contact the web development team or refer to this document for guidance.

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026  
**Maintained By:** 3mpwr App Web Team  
**Review Frequency:** Quarterly or after major site updates
