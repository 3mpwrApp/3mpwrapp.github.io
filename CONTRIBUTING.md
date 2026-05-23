# Contributing to 3mpwrApp

Thank you for your interest in contributing to 3mpwrApp! This project is built **by injured workers, for injured workers** (and the broader disability community), and we welcome contributions from anyone who shares our mission.

---

## 🌟 Our Mission & Values

Before contributing, please understand what we're building:

- **Free & Accessible:** No paywalls, no premium features, no "pro" versions
- **Privacy-First:** BYOC (Bring Your Own Cloud) architecture—users own their data, we collect NOTHING
- **Community-Led:** Decisions guided by injured workers and disabled people, not corporations
- **Disability Justice:** Intersectional, anti-ableist, pro-labor, pro-accessibility
- **Open Source:** AGPL-3.0 licensed, transparent development

**If you believe in these values, we'd love your help!**

---

## 💻 Ways to Contribute

### **1. Code Contributions**
- Fix bugs (check [GitHub Issues](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/issues))
- Add features (propose in issue first)
- Improve accessibility (WCAG 2.2 AAA compliance)
- Optimize performance (bundle size, load times)
- Write tests (Jest for app, Pa11y for website)

### **2. Content Contributions**
- Improve documentation (guides, tutorials, FAQs)
- Translate content (French, Spanish, Indigenous languages)
- Write blog posts (lived experience, advocacy stories)
- Create tribunal decision summaries (plain language)
- Add crisis resources (regional hotlines, clinics)

### **3. Research & Data**
- Analyze tribunal decisions (WSIAT, CanLII, ONSBT)
- Document WSIB policies and procedures
- Map legal clinics and advocacy organizations
- Track legislative changes (WSIA, AODA, etc.)

### **4. Design & UX**
- Improve UI/UX (especially for disabled users)
- Create graphics, infographics, illustrations
- Design accessible forms and workflows
- Test with assistive technologies (screen readers, voice control)

### **5. Community Support**
- Answer questions in forums and Discord
- Beta test new features
- Provide feedback on user experience
- Share 3mpwrApp with your network

### **6. Advocacy & Outreach**
- Promote 3mpwrApp to injured worker communities
- Connect us with legal clinics, unions, advocacy groups
- Write testimonials or case studies
- Speak at events or conferences

---

## 🚀 Getting Started

### **For Website Contributions (Jekyll):**

1. **Fork the repository:**
   ```bash
   git clone https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io.git
   cd 3mpwrapp.github.io
   ```

2. **Install dependencies:**
   ```bash
   # Ruby dependencies
   bundle install
   
   # Node.js dependencies (for scripts)
   npm install
   ```

3. **Run locally:**
   ```bash
   bundle exec jekyll serve
   # Visit http://localhost:4000
   ```

4. **Make your changes:**
   - Content: Edit markdown files in root or subdirectories
   - Styles: Edit `_sass/` files
   - Scripts: Add to `scripts/` (use subdirectories: `scripts/audit/`, `scripts/scraping/`, etc.)

5. **Test your changes:**
   ```bash
   # Run accessibility scan
   npm run a11y:scan
   
   # Check for broken links
   .\scripts\audit\find-broken-links.ps1
   ```

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: describe your change"
   git push origin main
   ```

7. **Open a Pull Request:**
   - Go to GitHub and click "New Pull Request"
   - Describe your changes and why they're needed
   - Link to relevant issues

### **For Mobile App Contributions (React Native / Expo):**

See [`empowrapp-new` repository](https://github.com/S0vryn9-C011ect1ve/empowrapp-new) for app-specific contribution guide.

---

## 📝 Pull Request Guidelines

### **Before Submitting:**
- [ ] Test your changes locally
- [ ] Run accessibility checks (`npm run a11y:scan`)
- [ ] Follow existing code style (see below)
- [ ] Write clear commit messages
- [ ] Update documentation if needed
- [ ] Add yourself to `CONTRIBUTORS.md` (optional)

### **PR Description Should Include:**
- **What:** What does this PR do?
- **Why:** Why is this change needed?
- **How:** How did you implement it?
- **Testing:** How did you test it?
- **Screenshots:** (if UI changes)

### **Review Process:**
1. Automated checks run (accessibility, linting, build)
2. Founder or maintainer reviews (usually within 7 days)
3. Feedback provided (if changes needed)
4. Approved and merged (once ready)

---

## 📐 Code Style Guidelines

### **Markdown (Content):**
- Use ATX-style headers (`# Header` not `Header\n======`)
- One sentence per line (makes diffs easier)
- Use reference-style links for readability
- Always include alt text for images

### **JavaScript (Scripts):**
- Use ES6+ syntax (const, let, arrow functions)
- Add JSDoc comments for functions
- Handle errors gracefully (try/catch)
- Log progress for long-running scripts

### **CSS/SCSS:**
- Follow BEM naming convention (`.block__element--modifier`)
- Mobile-first responsive design
- Use CSS custom properties for colors/spacing
- Test with high contrast mode

### **Accessibility:**
- WCAG 2.2 AAA compliance (target)
- Semantic HTML (proper heading hierarchy)
- Keyboard navigation support
- Color contrast ratio ≥7:1
- Screen reader testing

---

## 🐛 Reporting Bugs

**Found a bug?** Thank you for reporting it!

### **Where to Report:**
- **Security vulnerabilities:** Email empowrapp08162025@gmail.com (private)
- **Other bugs:** [GitHub Issues](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/issues)

### **Bug Report Template:**
```markdown
**Describe the bug:**
[Clear description of what's wrong]

**To Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior:**
[What should have happened?]

**Screenshots:**
[If applicable]

**Environment:**
- Device: [Desktop/Mobile/Tablet]
- OS: [Windows/macOS/Linux/iOS/Android]
- Browser: [Chrome/Firefox/Safari/Edge]
- Screen reader: [NVDA/JAWS/VoiceOver/TalkBack] (if applicable)

**Additional context:**
[Anything else relevant]
```

---

## 💡 Proposing New Features

**Have an idea?** We'd love to hear it!

### **Before Proposing:**
1. **Check existing issues** (might already be planned)
2. **Consider scope** (does it fit our mission?)
3. **Think about accessibility** (can disabled users use it?)

### **Feature Request Template:**
```markdown
**Problem:**
[What user need does this solve?]

**Proposed Solution:**
[How would this feature work?]

**Alternatives Considered:**
[What other approaches did you consider?]

**Who Benefits:**
[Which users would this help?]

**Implementation Complexity:**
[Simple/Medium/Complex—your best guess]

**Accessibility Considerations:**
[How will this work with screen readers, keyboard-only, etc.?]
```

---

## 🤝 Code of Conduct

### **Expected Behavior:**
- ✅ Be respectful and inclusive
- ✅ Use welcoming language
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the community
- ✅ Show empathy toward other contributors

### **Unacceptable Behavior:**
- ❌ Harassment, discrimination, or hate speech
- ❌ Trolling, insulting, or derogatory comments
- ❌ Personal or political attacks
- ❌ Publishing others' private information
- ❌ Ableist language or assumptions

### **Enforcement:**
- **First offense:** Warning + explanation
- **Second offense:** Temporary ban (7-30 days)
- **Severe/repeated offenses:** Permanent ban

**Report violations:** empowrapp08162025@gmail.com (confidential)

---

## 📜 License & Copyright

### **Code License:**
All code contributions are licensed under **AGPL-3.0** (GNU Affero General Public License v3.0).

**What this means:**
- ✅ Your code can be used, modified, and distributed freely
- ✅ Anyone using your code MUST share their modifications publicly (copyleft)
- ✅ Prevents commercial closed-source exploitation
- ✅ Protects 3mpwrApp™ from being copied and monetized without community benefit
- ❌ Cannot be used in proprietary software without releasing source

### **Content License:**
Documentation, guides, and website content are licensed under **CC BY-SA 4.0** (Creative Commons Attribution-ShareAlike 4.0 International).

**What this means:**
- ✅ Your content can be shared and adapted
- ✅ Must give credit to you and 3mpwrApp™
- ✅ Adaptations must use same license
- ❌ Cannot be used without attribution

### **Trademark:**
"3mpwrApp™" is a trademark. Using the name or logo requires permission.

**By Contributing:**
You agree that your contributions will be licensed under these terms.

**For more details:** See [LICENSE](LICENSE) file and [GOVERNANCE.md](GOVERNANCE.md)

---

## 🎓 Learning Resources

**New to open source?**
- [First Timers Only](https://www.firsttimersonly.com/)
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [GitHub's Guide to Pull Requests](https://docs.github.com/en/pull-requests)

**Accessibility Resources:**
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

**Jekyll/Static Sites:**
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Markdown Guide](https://www.markdownguide.org/)

---

## 🙏 Thank You!

Every contribution—no matter how small—makes a difference. Whether you fix a typo, report a bug, or build a new feature, you're helping injured workers and disabled people access justice.

**We couldn't do this without you.** 💙

---

## 📬 Questions?

- **Email:** empowrapp08162025@gmail.com
- **GitHub Issues:** [Ask a question](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/issues/new?labels=question)
- **Discord:** Coming soon

---

**Last Updated:** May 23, 2026
