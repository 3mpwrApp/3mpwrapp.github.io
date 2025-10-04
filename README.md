# 3mpowr App Website

> ⚠️ WEBSITE NOT LIVE YET? → See the Activation Guide: [ACTIVATION.md](ACTIVATION.md) (2–5 minutes)

This is the official website repository for the 3mpowr App — a community‑driven platform for injured workers and persons with disabilities across Canada.

🌐 Live Site: [https://3mpowrapp.github.io](https://3mpowrapp.github.io)

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

## About

3mpowr App provides practical tools and a vibrant community to help people connect, advocate for their rights, and access valuable resources. This repository contains the source code for our informational website.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting any changes.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test locally (optional: `bundle exec jekyll serve`)
5. Submit a pull request

For detailed instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Branch Protection

The main branch is protected to ensure code quality and stability. Please read our [Branch Protection Guide](.github/BRANCH_PROTECTION.md) to understand the workflow and requirements.

Key points:
- Direct pushes to `main` are not allowed
- All changes must go through pull requests
- Pull requests require approval before merging
- CI checks must pass before merging

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

Note: For the site to live at the root (https://3mpowrapp.github.io/), the repository name must be exactly `3mpowrapp.github.io`. If the repo name differs, GitHub will publish it under `https://3mpowrapp.github.io/<repo-name>/` and CI should point to that path.

## Support

- 📧 Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- 📘 Documentation: [CONTRIBUTING.md](CONTRIBUTING.md)
- 🔒 Branch Protection Guide: [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md)

## Connect With Us

- [Facebook](https://www.facebook.com/3mpowrapp)
- [X (Twitter)](https://x.com/3mpowrApp0816)
- [Instagram](https://www.instagram.com/3mpowrapp/)

## License

© 2025 3mpowr App. All rights reserved.

---

Stay informed, empowered, and connected!
