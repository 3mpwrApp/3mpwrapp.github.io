------

layout: defaultlayout: default

title: Accessibility Statementtitle: Accessibility Statement

description: Our commitment to inclusive, accessible design and development for everyone. Accessibility First!description: Our commitment to inclusive, accessible design and development for everyone. Accessibility First !

permalink: /accessibility/---

---

# Accessibility Statement

# Accessibility Statement

3mpwrApp is committed to inclusive design. We aim to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA, and we adopt selected AAA practices where feasible.

3mpwrApp is committed to inclusive design. We aim to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA, and we adopt selected AAA practices where feasible.

## Our approach

## Our Commitment- Design with semantic HTML, proper landmarks, and descriptive headings

- Ensure keyboard access to all interactive elements

We believe that accessibility is a fundamental human right, not an afterthought. Every person, regardless of ability, deserves equal access to information and services.- Provide visible focus styles, skip links, and logical tab order

- Maintain sufficient color contrast and support dark and high‑contrast modes

### Our Accessibility Goals- Respect user preferences, including reduced motion

- Make forms usable with clear labels, instructions, and error handling

- ✅ **WCAG 2.2 Level AA Compliance**: Meeting international accessibility standards- Offer captions and transcripts for audio/video when published

- ✅ **Zero Critical Barriers**: No obstacles preventing core functionality access

- ✅ **Continuous Improvement**: Regular audits and user testing## Known limitations

- ✅ **Inclusive by Design**: Accessibility built-in from the start- Embedded third‑party forms or media may have constraints beyond our control. We provide titles, labels, and alternatives where possible.



---## 3mpwrApp Accessibility Features



## Our ApproachFor detailed information about accessibility features in the 3mpwrApp itself, including:

- Cognitive accessibility modes (Standard, Simplified, Minimal)

### 1. Semantic HTML & Structure- Dyslexia support with specialized fonts and overlays

- Design with semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<footer>`)- Motor accessibility features (coming soon)

- Proper landmark regions for screen reader navigation- Step-by-step setup instructions

- Descriptive and hierarchical headings (H1-H6)

- Logical document structure and reading order**[View the complete Accessibility Walkthrough & Quick Start Guide →](/accessibility-walkthrough/)**



### 2. Keyboard Accessibility## Feedback and support

- All interactive elements accessible via keyboardIf you encounter accessibility issues:

- Visible focus indicators on all focusable elements- **App accessibility:** empowrapp08162025@gmail.com

- Skip links to main content and navigation- **Website accessibility:** [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)

- Logical tab order throughout the site- Subject: "Accessibility Feedback"

- No keyboard traps- Please include page URL, assistive tech/browser details, and steps to reproduce.

- Keyboard shortcuts documented and configurable

We review feedback promptly and work to improve the experience for all users.

### 3. Visual Design

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large textWe aim to respond within 5 business days. If you need content in an alternative format (e.g., large print, accessible PDF, plain text), let us know which format you prefer and the page URL.

- **Dark Mode**: Available via header toggle

- **High Contrast Mode**: Enhanced contrast for better visibilityLast updated: {{ site.time | date: "%Y-%m-%d" }}

- **Respects prefers-contrast**: Follows system preferences
- **Color is not sole indicator**: Information never conveyed by color alone

### 4. Motion & Animation
- Respects `prefers-reduced-motion` system setting
- Option to disable all animations in [Accessibility Settings](/accessibility-settings/)
- No auto-playing videos or animations
- No flashing content above 3Hz (seizure safety)

### 5. Forms & Interaction
- Clear labels for all form fields
- Helpful instructions and error messages
- Error identification and suggestions
- Sufficient time to complete forms
- Confirmation for destructive actions

### 6. Multimedia
- Captions and transcripts for audio/video content
- Audio descriptions where applicable
- Text alternatives for non-text content
- Background audio control

---

## Accessibility Features

### Visual Accessibility

#### Text Customization
- **Font Size**: Adjustable from 90% to 150%
- **Line Spacing**: Normal or loose (2.0)
- **Letter Spacing**: Normal or wide
- **Font Family**: Default, Readable, or Dyslexia-friendly
- **Link Underlines**: Auto or always underlined

[Customize Text Settings →](/accessibility-settings/)

#### Display Modes
- **Light Mode**: Default bright theme
- **Dark Mode**: Reduces eye strain in low light
- **High Contrast**: Maximum color differentiation
- **Grayscale**: Removes color distractions
- **Hue Shift**: Adjusts colors for colorblindness

#### Focus Visibility
- **Default**: Standard browser focus rings
- **Thick**: Enhanced 4px focus indicators
- **High Visibility**: Bright cyan focus rings

### Motor Accessibility

#### Navigation
- **Skip Links**: Jump to main content, navigation, footer
- **Keyboard Shortcuts**: All features keyboard-accessible
- **Large Touch Targets**: Minimum 44x44px (mobile-friendly)
- **No Timing**: No time-based interactions required
- **Hover Tolerance**: Generous hover areas

#### Input Methods
- ✅ Keyboard
- ✅ Mouse
- ✅ Touch
- ✅ Voice control (Dragon NaturallySpeaking compatible)
- ✅ Switch access
- ✅ Eye tracking (compatible with major software)

### Cognitive Accessibility

#### Content Clarity
- Plain language throughout
- Short paragraphs and sentences
- Descriptive headings and labels
- Consistent navigation and layout
- Breadcrumb navigation for orientation

#### Reading Support
- **Dyslexia Font**: OpenDyslexic available
- **Adjustable Spacing**: Reduce visual crowding
- **Focus Mode**: Minimize distractions
- **Reading Time**: Estimated time for long content

### Auditory Accessibility

#### For Deaf/Hard of Hearing
- Captions for all video content
- Transcripts for audio content
- Visual indicators for audio cues
- No audio-only content

#### For Screen Reader Users
- Tested with NVDA, JAWS, VoiceOver, TalkBack
- Proper ARIA labels and roles
- Live regions for dynamic content
- Descriptive link text (no "click here")
- Image alt text for all meaningful images

---

## Conformance Status

### WCAG 2.2 Compliance

| Level | Status | Notes |
|-------|--------|-------|
| **Level A** | ✅ **Full Compliance** | All Level A criteria met |
| **Level AA** | ✅ **Full Compliance** | All Level AA criteria met |
| **Level AAA** | 🟨 **Partial** | Selected AAA criteria implemented |

**Last Audit**: {{ site.time | date: '%B %Y' }}  
**Audit Tool**: axe DevTools, WAVE, Pa11y  
**Results**: 0 critical issues, 0 serious issues

[View Detailed Audit Report →](/WCAG-2.2-COMPLIANCE-REPORT.md)

### Testing Environment

We test with:
- **Screen Readers**: NVDA (Windows), JAWS, VoiceOver (Mac/iOS), TalkBack (Android)
- **Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Devices**: Desktop, laptop, tablet, smartphone
- **Assistive Tech**: Dragon NaturallySpeaking, ZoomText, Switch access

---

## Known Limitations

### Third-Party Content
- **Google Forms**: Contact/newsletter forms may have limitations beyond our control
- **Social Media Embeds**: Twitter/Facebook embeds follow their accessibility standards
- **External Links**: We can't control accessibility of external sites

**Our Mitigation**:
- Provide titles and labels for all embeds
- Offer direct links to open in new tabs
- Provide alternative contact methods (email)

### Progressive Enhancements
- Some features require JavaScript enabled
- Graceful degradation ensures core functionality without JS
- NoScript messages explain limitations

### Browser Compatibility
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) recommended
- Older browsers may lack some accessibility features
- We encourage users to update for best experience

---

## Feedback and Support

We actively welcome feedback on our accessibility efforts.

### Report an Issue

If you encounter an accessibility barrier:

1. **Email**: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
2. **Subject**: "Accessibility Issue"
3. **Include**:
   - Page URL
   - Description of the problem
   - Your assistive technology (screen reader, browser, etc.)
   - Steps to reproduce
   - Screenshots (if applicable)

**Response Time**: We aim to respond within 2 business days and resolve critical issues within 7 days.

### Request Alternative Formats

Need content in a different format? We can provide:

- ✅ Large print (PDF)
- ✅ Plain text
- ✅ Accessible PDF (tagged)
- ✅ Audio (MP3)
- ✅ EPUB (eBook)

**How to Request**:
- Email [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- Specify the format you need
- Include the page URL
- We'll deliver within 5 business days

---

## Ongoing Efforts

### Regular Audits
- **Automated Testing**: Monthly scans with axe, WAVE, Lighthouse
- **Manual Testing**: Quarterly keyboard and screen reader testing
- **User Testing**: Annual testing with users with disabilities
- **Code Reviews**: Accessibility checks in all pull requests

### Training & Education
- Development team trained in WCAG 2.2 and ARIA
- Regular workshops on inclusive design
- Accessibility champion in every team
- User research with diverse participants

### Roadmap

#### 2025 Q4
- [ ] Enhanced voice control support
- [ ] More dyslexia-friendly features
- [ ] Simplified cognitive mode
- [ ] Service worker for offline access

#### 2026 Q1
- [ ] Sign language videos for key content
- [ ] Augmented reading mode
- [ ] AI-powered alt text generation
- [ ] Personalized accessibility profiles

---

## Resources

### For Users
- [Accessibility Settings](/accessibility-settings/) - Customize your experience
- [Accessibility Walkthrough](/accessibility-walkthrough/) - Detailed feature guide
- [Keyboard Shortcuts](#) - Complete list (coming soon)
- [Screen Reader Guide](#) - Tips for screen reader users (coming soon)

### For Developers
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [Our GitHub](https://github.com/3mpowrApp/3mpwrapp.github.io) - View our code

### For Organizations
- [Accessibility for Teams](https://accessibility.digital.gov/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- [A11Y Project](https://www.a11yproject.com/)

---

## Legal Compliance

We comply with:

- 🇨🇦 **Canadian Accessibility Standards** (ACA)
- 🇺🇸 **Americans with Disabilities Act** (ADA)
- 🇪🇺 **European Accessibility Act** (EAA)
- 🇬🇧 **UK Equality Act 2010**
- 🌐 **WCAG 2.2 Level AA** (International)

---

## Contact

### Accessibility Team
**Email**: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)  
**Subject**: "Accessibility Question" or "Accessibility Issue"

### General Inquiries
- [Contact Page](/contact/) - All contact options
- [FAQ](/faq/) - Frequently asked questions
- [User Guide](/user-guide/) - Comprehensive app guide

---

## Acknowledgments

We thank:
- **Users with disabilities** who provide invaluable feedback
- **Accessibility advocates** who push for better standards
- **Open source community** for accessibility tools and resources
- **WCAG working group** for creating comprehensive guidelines

---

**Statement Date**: {{ site.time | date: '%B %d, %Y' }}  
**Next Review**: Quarterly (every 3 months)  
**Version**: 2.0

This statement is reviewed and updated regularly to reflect our current accessibility status and ongoing improvements.

---

Thank you for helping us build a more accessible web! 💚

*Together, we can ensure everyone has equal access to information and services.*
