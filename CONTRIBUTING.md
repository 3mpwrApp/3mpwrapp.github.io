# Contributing to 3mpowr App Website

Thank you for your interest in contributing to the 3mpowr App website! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)

## Code of Conduct

This project is dedicated to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and inclusive
- Use welcoming and professional language
- Be open to constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your browser/device information

### Suggesting Enhancements

We welcome feature suggestions! Please create an issue with:
- A clear description of the enhancement
- Why this enhancement would be useful
- Any implementation ideas you have

### Content Updates

Help us improve our content:
- Fix typos or grammatical errors
- Improve documentation clarity
- Update outdated information
- Add missing information

### Code Contributions

We welcome code contributions including:
- Bug fixes
- New features
- Performance improvements
- Accessibility enhancements
- Design improvements

## Development Workflow

### Prerequisites

- Git installed on your machine
- Basic knowledge of Markdown
- (Optional) Jekyll for local testing
- (Optional) Ruby 3.1+ if running Jekyll locally

### Local Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/empowr-site.github.io.git
   cd empowr-site.github.io
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/empowrapp08162025/empowr-site.github.io.git
   ```

4. **(Optional) Install Jekyll** for local testing:
   ```bash
   # Install Ruby and Bundler first, then:
   bundle install
   ```

5. **(Optional) Run Jekyll locally**:
   ```bash
   bundle exec jekyll serve
   ```
   Visit `http://localhost:4000` in your browser

### Making Changes

1. **Create a new branch** from main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

   Use descriptive branch names:
   - `feature/add-resource-section`
   - `fix/broken-contact-link`
   - `docs/update-user-guide`
   - `style/improve-mobile-layout`

2. **Make your changes**:
   - Edit files as needed
   - Follow the style guidelines (see below)
   - Test your changes locally if possible

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```

   Write clear commit messages:
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Reference issue numbers if applicable

4. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

1. **Create a Pull Request** on GitHub:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template completely

2. **PR Requirements**:
   - Clear description of changes
   - Reference any related issues
   - Screenshots for visual changes
   - Confirmation that you've tested the changes
   - All CI checks must pass

3. **Review Process**:
   - A maintainer will review your PR
   - Address any requested changes
   - Discussion and feedback are part of the process
   - Be patient and respectful

4. **After Approval**:
   - Maintainers will merge your PR
   - Your changes will be deployed automatically
   - Delete your feature branch:
     ```bash
     git branch -d feature/your-feature-name
     git push origin --delete feature/your-feature-name
     ```

## Style Guidelines

### Markdown Files

- Use ATX-style headers (`#` not underlines)
- Add blank lines around headers and lists
- Use relative links for internal navigation
- Include alt text for all images
- Keep line length reasonable (80-100 characters when possible)

Example:
```markdown
# Main Header

Introduction paragraph.

## Subheader

- List item one
- List item two

[Link text](path/to/page)

![Alt text for image](path/to/image.png)
```

### HTML in Markdown

- Use HTML sparingly, only when Markdown isn't sufficient
- Keep HTML semantic and accessible
- Include ARIA labels when needed

### File Organization

- Keep related files in appropriate directories
- Use lowercase filenames with hyphens: `user-guide.md`
- Place images in `/assets/images/`
- Place styles in `/assets/css/`

### Content Style

- Write in clear, concise language
- Use inclusive and accessible language
- Check spelling and grammar
- Be consistent with existing content style
- Consider accessibility (screen readers, etc.)

## Testing

### Manual Testing Checklist

Before submitting a PR, verify:

- [ ] All links work correctly
- [ ] Images load properly and have alt text
- [ ] Content displays correctly on desktop
- [ ] Content displays correctly on mobile
- [ ] No spelling or grammar errors
- [ ] Changes don't break existing functionality
- [ ] Forms work correctly (if applicable)

### Browser Testing

Test your changes in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility

- Use semantic HTML elements
- Ensure sufficient color contrast
- Provide alt text for images
- Test with keyboard navigation
- Consider screen reader users

## File Structure

```
empowr-site.github.io/
├── .github/                 # GitHub configuration
│   ├── workflows/          # GitHub Actions workflows
│   └── BRANCH_PROTECTION.md
├── _layouts/               # Jekyll layouts
│   └── default.html
├── assets/                 # Static assets
│   ├── css/               # Stylesheets
│   └── images/            # Images
├── blog/                   # Blog pages
├── beta/                   # Beta testing pages
├── contact/                # Contact pages
├── resources/              # Resource pages
├── _config.yml            # Jekyll configuration
├── index.md               # Homepage
├── about.md               # About page
├── contact.md             # Contact page
├── user-guide.md          # User guide
└── CONTRIBUTING.md        # This file
```

## Getting Help

If you need help:

1. Check existing [documentation](README.md)
2. Review [branch protection guide](.github/BRANCH_PROTECTION.md)
3. Search existing [issues](https://github.com/empowrapp08162025/empowr-site.github.io/issues)
4. Create a new issue with your question
5. Contact maintainers via email: empowrapp08162025@gmail.com

## Recognition

All contributors will be recognized for their contributions! We appreciate:
- Code contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Design feedback

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to 3mpowr App! Your efforts help make this platform better for injured workers and persons with disabilities across Canada. 🙏
