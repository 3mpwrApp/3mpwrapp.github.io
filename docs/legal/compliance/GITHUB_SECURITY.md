# Security Policy

## Supported Versions

We actively support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest - 1 minor | :white_check_mark: |
| < Latest - 2 minor | :x: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow responsible disclosure:

### Do NOT:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it's fixed
- Exploit the vulnerability beyond what's necessary to demonstrate it

### Do:
1. **Email us directly** at: security@empowrapp.org (or your security email)
2. **Include detailed information:**
   - Type of vulnerability (XSS, injection, authentication bypass, etc.)
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect:
- **Acknowledgment**: Within 48 hours of your report
- **Status Update**: Within 7 days with our assessment
- **Resolution Timeline**: 
  - Critical: 24-72 hours
  - High: 7-14 days
  - Medium: 30 days
  - Low: 90 days

### Recognition
We appreciate security researchers who help keep our users safe. With your permission, we'll acknowledge your contribution in our security advisories.

## Security Measures

### Code Security
- **CodeQL Analysis**: Automated security scanning on every PR
- **Dependency Scanning**: Daily Dependabot security updates
- **Secret Scanning**: GitHub secret scanning enabled
- **SAST**: Static Application Security Testing via CodeQL

### Infrastructure Security
- **Branch Protection**: Main branch requires PR reviews and passing CI
- **Signed Commits**: Encouraged for all contributors
- **Access Control**: Principle of least privilege for all access
- **Audit Logging**: GitHub audit logs enabled

### Data Security
- **Encryption**: All data encrypted in transit (TLS 1.3)
- **Firebase Security Rules**: Strict Firestore access rules
- **No Sensitive Data in Logs**: Strict logging policies
- **Regular Security Audits**: Periodic security reviews

### Dependency Management
- **Automated Updates**: Dependabot for npm and GitHub Actions
- **Vulnerability Alerts**: Immediate notifications for CVEs
- **Lock Files**: package-lock.json committed and verified
- **npm audit**: Run on every CI build

## Security Best Practices for Contributors

### When Contributing Code:
1. Never commit secrets, API keys, or credentials
2. Use environment variables for sensitive configuration
3. Validate and sanitize all user inputs
4. Follow OWASP security guidelines
5. Keep dependencies up to date
6. Write security-aware tests

### When Reviewing Code:
1. Check for hardcoded secrets
2. Verify input validation
3. Review authentication/authorization logic
4. Check for injection vulnerabilities
5. Verify secure data handling

## Compliance

This project aims to comply with:
- OWASP Top 10 security practices
- React Native security best practices
- Firebase Security Rules best practices
- WCAG 2.1 accessibility standards

## Contact

For security concerns: security@empowrapp.org
For general questions: Open a GitHub Discussion

---

Last updated: December 2024
