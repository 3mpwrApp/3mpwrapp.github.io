# Security Policy

## 🔒 Reporting a Security Vulnerability

The 3mpwrApp team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Email**: empowrapp08162025@gmail.com

**Subject Line**: `SECURITY: [Brief Description]`

### What to Include

Please provide as much information as possible:

1. **Description**: Clear description of the vulnerability
2. **Impact**: What an attacker could do if they exploited this
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Affected Components**: Which parts of the site/repo are affected
5. **Suggested Fix**: If you have ideas for fixing it (optional)
6. **Disclosure Timeline**: When you plan to publicly disclose (if applicable)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution Timeline**: Varies by severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: 1 month

### Our Commitment

We will:
- ✅ Acknowledge your report within 48 hours
- ✅ Keep you informed of our progress
- ✅ Credit you for the discovery (if you wish)
- ✅ Work with you on disclosure timing
- ✅ Fix confirmed vulnerabilities promptly

## 🛡️ Security Measures in Place

### Repository Security
- ✅ All credentials stored in GitHub Secrets
- ✅ Comprehensive .gitignore for sensitive files
- ✅ Clean git history (no exposed secrets)
- ✅ Proper workflow permissions

### Website Security
- ✅ Content Security Policy (CSP)
- ✅ HTTP Strict Transport Security (HSTS)
- ✅ XSS Protection headers
- ✅ Clickjacking prevention
- ✅ MIME sniffing prevention
- ✅ Permissions policy restrictions

### Code Security
- ✅ No hardcoded credentials
- ✅ Environment variable usage
- ✅ Input sanitization (Jekyll auto-escaping)
- ✅ Dependency monitoring

## 📋 Supported Versions

| Component | Version | Supported |
|-----------|---------|-----------|
| Website | Current | ✅ Yes |
| Repository | main branch | ✅ Yes |
| Legacy branches | < 1 year old | ⚠️ Limited |
| Archived versions | > 1 year old | ❌ No |

## 🚫 Out of Scope

Please do **not** report:
- ❌ Issues in third-party dependencies (report to their maintainers)
- ❌ Missing features or enhancements
- ❌ Bugs that don't have security implications
- ❌ Social engineering attacks
- ❌ Physical security issues
- ❌ Denial of Service (DoS) attacks

## 🎖️ Recognition

We appreciate security researchers who:
- Report vulnerabilities responsibly
- Give us reasonable time to fix issues
- Don't exploit vulnerabilities beyond PoC

If you'd like, we can:
- Credit you in our changelog
- Mention you in our security acknowledgments
- Provide a reference/testimonial

## 📞 Contact

**Security Email**: empowrapp08162025@gmail.com  
**Response Time**: Within 48 hours  
**PGP Key**: Available upon request

## 🔐 Responsible Disclosure

We follow coordinated vulnerability disclosure:

1. **You report** the vulnerability privately
2. **We confirm** and begin working on a fix
3. **We deploy** the fix to production
4. **We notify** affected users (if any)
5. **We coordinate** with you on public disclosure timing
6. **We credit** you publicly (if you wish)

### Timeline Example:
- **Day 0**: You report vulnerability
- **Day 2**: We confirm and begin fix
- **Day 7**: Fix deployed to production
- **Day 14**: Coordinated public disclosure

Thank you for helping keep 3mpwrApp secure! 🛡️💚

---

**Last Updated**: October 28, 2025  
**Policy Version**: 1.0
