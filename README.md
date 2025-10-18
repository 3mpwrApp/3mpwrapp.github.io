# 3mpowr App Website

[![Accessibility (pa11y-ci)](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/a11y-pa11y.yml/badge.svg)](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/a11y-pa11y.yml)
[![Accessibility (axe-core)](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/accessibility-axe.yml/badge.svg)](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/accessibility-axe.yml)
[![Links](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/links.yml/badge.svg)](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/links.yml)
[![Lighthouse](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/lighthouse.yml)
[![Pages build](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/jekyll.yml)

> ⚠️ WEBSITE NOT LIVE YET? → See the Activation Guide: [ACTIVATION.md](ACTIVATION.md) (2–5 minutes)

This is the official website repository for the 3mpowr App — a community‑driven platform for injured workers and persons with disabilities across Canada.

🌐 Live Site: [https://3mpwrapp.github.io](https://3mpwrapp.github.io)

---

## 🚀 First Time Here? Activate Your Website

If your website isn’t live yet, follow our step‑by‑step guide to enable GitHub Pages:

👉 [ACTIVATION.md](ACTIVATION.md) — Enable your website in minutes

The guide includes:
- ✅ Simple step‑by‑step instructions
- ✅ Visual diagrams
- ✅ Troubleshooting tips
- ✅ What to do after activation

---

## 💡 What is 3mpwr?

3mpwr App provides practical tools and a vibrant community to help people connect, advocate for their rights, and access valuable resources. This repository contains the source code for our informational website.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting any changes.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test locally (optional: `bundle exec jekyll serve`)
5. Submit a pull request

For detailed instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Workflow

This repository currently allows direct pushes to `main` for maintainers. CI will still run on push for visibility.

If you want to enforce stricter controls in the future, see our optional [Branch Protection Guide](.github/BRANCH_PROTECTION.md).

### Automated Curation and Checks

- Daily Curator: `.github/workflows/daily-curator.yml`
	- Runs at 1pm America/Toronto every day. Implementation: schedule at 17:00 and 18:00 UTC with a time-gate that only proceeds when local Toronto time is 13:00.
	- Produces `_curation/YYYY-MM-DD-curation.md` and, if items meet scoring, `_posts/YYYY-MM-DD-daily-curation.md`.
	- Configuration: `_data/curator.json`
		- `rssFeeds`: list of sources to pull
		- `keywords`, `tags`: scoring terms
		- `minScore`, `maxItems`, `postDaily`: volume control

- Accessibility (pa11y): `.github/workflows/a11y-pa11y.yml`
	- Runs on push/PR and Mon+Thu early UTC.
	- Uploads a JSON report and prints quick stats to the run summary; the job fails if any page has issues.

## Development

### Local Setup

This is a Jekyll‑based static site. To run it locally:

```bash
# Install dependencies
bundle install

# Run local server
bundle exec jekyll serve

# Visit http://localhost:4000
```

Prerequisites:
- Ruby and Bundler installed (see https://jekyllrb.com/docs/ for details)

### Project Structure

```
├── .github/          # GitHub configuration and workflows
├── _layouts/         # Jekyll layout templates
├── assets/           # CSS, images, and other static files
├── blog/             # Blog pages
├── beta/             # Beta testing information
├── contact/          # Contact pages
├── resources/        # Resource pages
├── index.md          # Homepage
└── _config.yml       # Jekyll configuration
```

## Deployment

This site is automatically deployed to GitHub Pages when changes are merged to the `main` branch. The deployment workflow is defined in `.github/workflows/jekyll.yml`.

Note: For the site to live at the root (https://3mpwrapp.github.io/), the repository name must be exactly `3mpwrapp.github.io`. If the repo name differs, GitHub will publish it under `https://3mpwrapp.github.io/<repo-name>/` and CI should point to that path.

## Subscribe to updates

- What’s New RSS: https://3mpwrapp.github.io/whats-new/feed.xml

## Support

- 📧 Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- 📘 Documentation: [CONTRIBUTING.md](CONTRIBUTING.md)
- 🔒 Branch Protection Guide: [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md)

## Connect With Us

- [Facebook](https://www.facebook.com/3mpowrapp/)
- [X (Twitter)](https://x.com/3mpowrapp0816)
- [Instagram](https://www.instagram.com/3mpwrapp/)

## License

  
---

© 2025 3mpwr App. All rights reserved.

---

Stay informed, empowered, and connected!
