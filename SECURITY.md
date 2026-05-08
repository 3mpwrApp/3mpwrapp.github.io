---
layout: page
title: Security Policy
permalink: /security/
---

# 3mpwrApp Security Policy

The 3mpwrApp team is committed to providing enterprise-grade security for all users. Our multi-layered security architecture protects your data, privacy, and ensures safe, reliable service.

* * *

## Comprehensive Security Measures

### 8-Layer Defense-in-Depth Architecture

3mpwrApp implements a comprehensive security strategy with **8 distinct layers of protection**:

1. **CloudFlare Protection** - DDoS mitigation, bot detection, edge security
2. **Rate Limiting** - Prevents abuse and automated attacks
3. **Firebase App Check** - Verifies requests come from authentic app instances
4. **Firebase Authentication** - Industry-standard user authentication & authorization
5. **Firebase Security Rules** - Server-side data access control
6. **Input Validation** - All user input sanitized and validated
7. **Security Monitoring** - Real-time threat detection and alerting
8. **Supply Chain Security** - Protects against compromised dependencies

* * *

## Authentication & Access Control

### Firebase Authentication
- **Multi-factor authentication** available for all users
- **OAuth 2.0** integration (Google, Apple, Facebook)
- **Email/password** with secure password requirements
- **Guest mode** for privacy-conscious users
- **Role-based access control** (RBAC) for admin features
- **Session management** with automatic timeout
- **Super admin sovereignty**: empowrapp08162025@gmail.com (founder control)

### Security Rules
- **Authentication required** for all write operations
- **User data isolation** - Users can only access their own data (UID-based)
- **Admin operations** require custom Firebase claims
- **Read/write limits** enforced at database level
- **Validation rules** reject malformed data
- **Public rules** committed to repository (Firebase best practice)

* * *

## Supply Chain Security (March 2026)

### Socket.dev Protection

**Real-time monitoring for:**
- âœ… **Compromised packages** (e.g., axios 1.14.0/1.14.1/0.30.4 attack)
- âœ… **Typosquatting attacks** (e.g., plain-crypto-js mimicking crypto-js)
- âœ… **Install script malware** detection
- âœ… **Network/filesystem/shell access** monitoring during installs
- âœ… **Obfuscated code** detection
- âœ… **Publisher reputation** tracking
- âœ… **Deprecated packages** alerts

**Scanning frequency:**
- **Daily**: Automated security audit (9 AM UTC)
- **Every push**: Automatic scan on all commits
- **Every PR**: Scan before merge approval
- **Pre-commit hooks**: Optional local scanning (enable with SOCKET_SCAN=1)

**Automated response:**
- **Critical/High severity**: Auto-created GitHub issue + email alert
- **Build failure**: Blocks deployment if critical vulnerabilities detected
- **SARIF reports**: Integration with GitHub Security tab
- **Emergency runbook**: Documented procedures for rapid response

### Current Protection Status
âœ… **0 Vulnerabilities** - All dependencies scanned and safe 
âœ… **axios 1.13.6** - Protected from March 2026 compromise (1.14.0/1.14.1/0.30.4) 
âœ… **legitimate crypto-js** - No typosquatting attacks present 
âœ… **Socket.dev active** - Continuous monitoring enabled

* * *

## Data Security & Privacy

### Data Encryption
- **At rest**: All Firebase data encrypted by default (AES-256)
- **In transit**: TLS 1.3 for all network communications
- **End-to-end**: Evidence uploads encrypted before transmission
- **Key management**: Google-managed encryption keys (FIPS 140-2)

### Privacy Protections
- **No tracking pixels** - Zero third-party analytics trackers
- **Firebase-only analytics** - First-party, privacy-preserving metrics
- **Guest mode** - Use app without creating account
- **Data minimization** - Only collect what's needed
- **User data export** - Download your data anytime
- **Right to deletion** - Delete account and all data: [3mpwrapp.pages.dev/delete-data](https://3mpwrapp.ca/delete-data)
- **GDPR/CCPA compliance** - Full data protection compliance
- **No selling data** - Your data is yours, not a product

### Secure Data Storage
- **Firebase Firestore** - Google Cloud infrastructure
- **Isolated by user** - UID-based data separation
- **Automatic backups** - Daily backups with point-in-time recovery
- **Geographic redundancy** - Multi-region data replication
- **Access logs** - Audit trail for all data access

* * *

## Security Monitoring & Response

### Automated Monitoring

| Tool | Coverage | Frequency | Action |
|------|----------|-----------|--------|
| **Socket.dev** | Supply chain attacks, malware | Daily + every push/PR | Auto-issue + block build |
| **npm audit** | Known CVEs in dependencies | Weekly Monday 9 AM UTC | Report + auto-patch |
| **GitHub CodeQL** | SAST code scanning | Weekly Monday 9 AM UTC | Report + review |
| **Dependabot** | Outdated vulnerable packages | Continuous | Auto-PR creation |
| **Firebase Monitoring** | Runtime errors, crashes | Real-time | Alert + error tracking |

### Incident Response
- **Emergency runbook**: Documented procedures for all scenarios
- **24/7 monitoring**: Automated alerts for critical issues
- **Rapid patching**: Critical vulnerabilities fixed within 24-48 hours
- **Transparent communication**: Users notified of security events
- **Post-incident reviews**: Learn and improve from every incident

* * *

## Network & Infrastructure Security

### CloudFlare Protection
- **DDoS mitigation** - Distributed denial-of-service protection
- **Bot detection** - Automated attack prevention
- **WAF (Web Application Firewall)** - Blocks common web attacks
- **Rate limiting** - Prevents brute force and abuse
- **Edge caching** - CDN reduces attack surface
- **SSL/TLS** - Automatic HTTPS with modern ciphers

### API Security
- **Authentication required** - All sensitive endpoints protected
- **CORS properly configured** - Prevents cross-origin attacks
- **Input validation** - All user data sanitized
- **Output encoding** - XSS attack prevention
- **SQL injection prevention** - Parameterized queries (Firestore)
- **Rate limiting** - Per-user and per-IP limits

* * *

## Code Security

### Secure Development Practices
- âœ… **No hardcoded secrets** - All credentials in environment variables
- âœ… **Security linting** - ESLint rules catch dangerous patterns
- âœ… **Dependency scanning** - Automated vulnerability checks
- âœ… **Code review required** - All PRs reviewed before merge
- âœ… **Automated testing** - 744 test cases, 3,446 assertions
- âœ… **No eval() usage** - Zero dynamic code execution
- âœ… **TypeScript strict mode** - Type safety prevents bugs
- âœ… **Git history clean** - No secrets in commit history

### Open Source Security
- **Public repository** - Community security review
- **Transparent security** - All measures documented
- **Bug bounty friendly** - Responsible disclosure encouraged
- **Security changelog** - Track all security updates
- **Firebase rules public** - Follows Google best practices

* * *

## Reporting a Security Vulnerability

### How to Report

**Email**: empowrapp08162025@gmail.com 
**Subject Line**: SECURITY: [Brief Description]

### What to Include

1. **Description**: Clear description of the vulnerability
2. **Impact**: What an attacker could do if they exploited this
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Affected Components**: Which parts of the app/site are affected
5. **Suggested Fix**: If you have ideas for fixing it (optional)
6. **Disclosure Timeline**: When you plan to publicly disclose (if applicable)

### What to Expect

- âœ… **Initial Response**: Within 48 hours
- âœ… **Status Update**: Within 7 days
- âœ… **Resolution Timeline**:
 - Critical: 24-48 hours
 - High: 1 week
 - Medium: 2 weeks
 - Low: 1 month

### Our Commitment

We will:
- âœ… Acknowledge your report within 48 hours
- âœ… Keep you informed of our progress
- âœ… Credit you for the discovery (if you wish)
- âœ… Work with you on disclosure timing
- âœ… Fix confirmed vulnerabilities promptly
- âœ… Notify affected users if necessary

* * *

## Security Resources

### For Developers
- **GitHub Repository**: [github.com/empowrapp](https://github.com/empowrapp)
- **Security Documentation**: Contact empowrapp08162025@gmail.com
- **Incident Response Runbook**: Emergency procedures documented
- **Socket.dev Dashboard**: Real-time dependency monitoring

### For Users
- **Privacy Policy**: [3mpwrapp.pages.dev/privacy](https://3mpwrapp.ca/privacy)
- **Delete Your Data**: [3mpwrapp.pages.dev/delete-data](https://3mpwrapp.ca/delete-data)
- **Terms of Service**: [3mpwrapp.pages.dev/terms](https://3mpwrapp.ca/terms)
- **Security Updates**: Check our [blog](https://3mpwrapp.ca/) for announcements

* * *

## Security Certifications & Standards

- **Firebase Security**: Google Cloud Platform infrastructure
- **OAuth 2.0**: Industry-standard authentication
- **HTTPS/TLS 1.3**: Modern encryption standards
- **GDPR Compliant**: European data protection regulation
- **CCPA Compliant**: California consumer privacy act
- **WCAG 2.1 AA**: Accessibility and usable security
- **Open Source**: Transparent, community-reviewed security

* * *

## Security Metrics (March 2026)

- **Active Vulnerabilities**: 0
- **Days Since Last Security Incident**: [Counter updated daily]
- **Dependencies Monitored**: 100% (all packages scanned)
- **Code Coverage**: 148 test files, 744 test cases
- **Uptime**: 99.9%+ (CloudFlare + Firebase)
- **Supply Chain Attacks Blocked**: 1 (axios March 2026)

* * *

## Continuous Improvement

Security is not a one-time effort. We continuously improve through:

- **Weekly audits**: Automated security scanning
- **Quarterly reviews**: Manual penetration testing
- **User feedback**: Security suggestions welcome
- **Industry monitoring**: Stay current with latest threats
- **Proactive patching**: Fix before exploits published
- **Transparency**: Public security changelog

* * *

**Last Updated**: March 31, 2026 
**Next Review**: April 30, 2026

Questions or concerns? Email us at **empowrapp08162025@gmail.com**
