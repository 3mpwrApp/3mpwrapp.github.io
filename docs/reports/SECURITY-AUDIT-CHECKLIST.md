# 🔒 SECURITY AUDIT CHECKLIST

**Testing Date:** October 20, 2025  
**Target:** 3mpwrapp.pages.dev  
**Duration:** 2 hours  
**Scope:** All 7 pages + API endpoints

---

## ✅ SSL/TLS VERIFICATION (15 minutes)

### Certificate Check
- [ ] Navigate to https://3mpwrapp.pages.dev
- [ ] Click padlock icon
- [ ] Verify "Connection is secure"
- [ ] Check certificate details:
  - [ ] Domain matches
  - [ ] Issuer: Let's Encrypt or Cloudflare
  - [ ] Valid dates (not expired)
  - [ ] No warnings

### HTTPS Enforcement
- [ ] Try http://3mpwrapp.pages.dev
- [ ] Should redirect to https
- [ ] No mixed content warnings
- [ ] All resources loaded via https

### Security Score
- [ ] Use: https://www.ssllabs.com/ssltest/
- [ ] Check rating (aim for A+)
- [ ] Review any warnings

---

## 📋 SECURITY HEADERS (30 minutes)

### Check Headers Method 1: Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on main document request
5. Go to Response Headers
6. Look for security headers

### Check Headers Method 2: Online Tool
- Use: https://securityheaders.com
- Enter: https://3mpwrapp.pages.dev
- Review all security headers

### Content-Security-Policy (CSP)
- [ ] Header present: `Content-Security-Policy`
- [ ] Review policy (should be restrictive)
- [ ] Check for `unsafe-inline` (not ideal but may be needed)
- [ ] Check for `unsafe-eval` (should not be present)
- [ ] Examples of good CSP:
  ```
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  ```

### X-Frame-Options
- [ ] Header present: `X-Frame-Options`
- [ ] Value should be: `DENY` or `SAMEORIGIN`
- [ ] Prevents clickjacking attacks

### X-Content-Type-Options
- [ ] Header present: `X-Content-Type-Options`
- [ ] Value should be: `nosniff`
- [ ] Prevents MIME-sniffing attacks

### Strict-Transport-Security (HSTS)
- [ ] Header present: `Strict-Transport-Security`
- [ ] Max-age should be reasonable (e.g., 31536000 = 1 year)
- [ ] Should include `includeSubDomains`

### Referrer-Policy
- [ ] Header present (optional but good)
- [ ] Value should be: `strict-no-referrer` or `no-referrer`

### Permissions-Policy (Feature-Policy)
- [ ] Header present (optional but good)
- [ ] Restricts browser features
- [ ] Example: `geolocation=(), microphone=(), camera=()`

---

## 🔐 CORS CONFIGURATION (20 minutes)

### Test CORS Headers
1. Open DevTools Console
2. Run test:
```javascript
fetch('https://3mpwrapp.pages.dev/api/curation-latest.json')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:');
    console.log('Access-Control-Allow-Origin:', r.headers.get('Access-Control-Allow-Origin'));
    console.log('Access-Control-Allow-Methods:', r.headers.get('Access-Control-Allow-Methods'));
    return r.json();
  })
  .then(d => console.log('Data:', d))
  .catch(e => console.error('Error:', e));
```

### CORS Verification
- [ ] Check for `Access-Control-Allow-Origin` header
- [ ] Should be:
  - [ ] Specific domain (e.g., `https://mastodon.social`)
  - [ ] Or `*` if public API
  - [ ] NOT empty or missing
- [ ] Check `Access-Control-Allow-Methods`
  - [ ] Should list allowed methods (GET, POST, etc.)
  - [ ] Should NOT include `*` (too permissive)
- [ ] Check `Access-Control-Allow-Credentials`
  - [ ] Should be `false` unless needed
  - [ ] If `true`, `Access-Control-Allow-Origin` must NOT be `*`

### Test from Different Origin
1. Open browser console
2. Try to fetch from different domain
3. Should either:
   - [ ] Return data (if CORS allows)
   - [ ] Show CORS error (if properly restricted)
4. Error is good (means CORS working)

---

## 🍪 COOKIE SECURITY (15 minutes)

### Cookie Check via DevTools
1. Open DevTools
2. Go to Application tab
3. Click Cookies (left sidebar)
4. Select domain: 3mpwrapp.pages.dev

### For Each Cookie, Verify:
- [ ] Name: (what is it?)
- [ ] Value: (does not contain sensitive data)
- [ ] Domain: (correct domain)
- [ ] Path: (appropriate path)
- [ ] Expires/Max-Age: (reasonable duration)
- [ ] **HttpOnly:** ✅ Should be checked (prevents JS access)
- [ ] **Secure:** ✅ Should be checked (HTTPS only)
- [ ] **SameSite:** Should be:
  - [ ] `Strict` (most secure - recommended)
  - [ ] Or `Lax` (good compromise)
  - [ ] NOT `None` without Secure flag

### Test Cookie Security
```javascript
// In console, check cookie flags:
document.cookie
// Should show cookies (if any are not HttpOnly)

// Try to set insecure cookie (should fail in HTTPS):
document.cookie = "test=value"; 
// This will work but shown as problem if not Secure/SameSite
```

### Recommendations
- [ ] All sensitive cookies have HttpOnly flag
- [ ] All cookies have Secure flag (HTTPS only)
- [ ] All cookies have SameSite=Strict or Lax
- [ ] No sensitive data in cookie values
- [ ] Reasonable expiration times

---

## 📝 FORM SECURITY (20 minutes)

### CSRF Protection
- [ ] Look for contact/comment forms
- [ ] Check for hidden CSRF token field
- [ ] Open DevTools → Elements tab
- [ ] Inspect form:
```html
<form ...>
  <input type="hidden" name="csrf_token" value="...">
  <!-- or -->
  <input type="hidden" name="_token" value="...">
</form>
```

### Form Validation
1. Try each form on the site
2. For each form field:
   - [ ] Try submitting empty
   - [ ] Try invalid data (e.g., bad email)
   - [ ] Try HTML/script injection: `<script>alert('xss')</script>`
   - [ ] Try SQL injection: `'; DROP TABLE users; --`
3. Verify:
   - [ ] Client-side validation works
   - [ ] Error messages are clear
   - [ ] Dangerous input is rejected

### File Upload (if applicable)
- [ ] Try uploading executable (.exe, .sh, etc.)
- [ ] Should be rejected
- [ ] Try uploading image with HTML extension
- [ ] Should be rejected or served as download
- [ ] File type validation working

---

## 🔍 XSS VULNERABILITY CHECK (20 minutes)

### Test Injection Points
1. Search/input fields
2. URL parameters
3. Comments (if applicable)
4. User submissions

### Test Cases for Each Field
Try these payloads:
```
<!-- Test 1: Basic alert -->
<script>alert('XSS')</script>

<!-- Test 2: Event handler -->
<img src=x onerror="alert('XSS')">

<!-- Test 3: SVG -->
<svg onload="alert('XSS')">

<!-- Test 4: Data attribute -->
<div data-x="alert('XSS')">Test</div>

<!-- Test 5: HTML entity -->
&#60;script&#62;alert('XSS')&#60;/script&#62;
```

### Expected Results
- [ ] Payloads are NOT executed
- [ ] Payloads are either:
  - [ ] Encoded as text (safe)
  - [ ] Rejected
  - [ ] Stripped of dangerous parts
- [ ] No console errors
- [ ] No alerts/popups

---

## 💉 SQL INJECTION CHECK (15 minutes)

### SQL Injection Tests
Try these in search/input fields:
```
<!-- Basic test -->
' OR '1'='1

<!-- Union test -->
' UNION SELECT NULL, NULL, NULL --

<!-- Comment test -->
' OR 1=1 --

<!-- Boolean test -->
' AND 1=1
' AND 1=2
```

### Expected Results
- [ ] No SQL errors in response
- [ ] No database data leaked
- [ ] Query results unaffected
- [ ] Fields sanitized/parameterized
- [ ] Injection attempts logged (ideally)

### How to Verify
1. Check if response changes based on payload
2. If response is identical for all payloads: ✅ Good (injection prevented)
3. If response changes: ❌ Problem (may be vulnerable)

---

## 🔐 AUTHENTICATION & AUTHORIZATION (10 minutes)

### Check Authentication
- [ ] Sensitive pages require login (if applicable)
- [ ] Try accessing without credentials
- [ ] Should redirect to login or show 401
- [ ] Try accessing with wrong credentials
- [ ] Should reject or show 403

### Session Management
- [ ] Log in to any protected page
- [ ] Check session token (in cookies or local storage)
- [ ] Verify token:
  - [ ] Is cryptographically random
  - [ ] Has reasonable expiration
  - [ ] Is HttpOnly (if cookie)
  - [ ] Is Secure (HTTPS only)

### API Authentication
- [ ] Check if API endpoints require authentication
- [ ] Try accessing without credentials
- [ ] Should return 401 Unauthorized
- [ ] Try accessing with invalid token
- [ ] Should return 401 or 403

---

## 📊 VULNERABILITY SCANNING (15 minutes)

### Online Scanning Tools
Use these free online tools:

**Option 1: OWASP ZAP**
- Download: https://www.zaproxy.org/
- Run basic scan against https://3mpwrapp.pages.dev
- Review findings

**Option 2: Nikto**
- Online: Various online Nikto services
- Or command line: `nikto -h 3mpwrapp.pages.dev`

**Option 3: Burp Suite Community**
- Download: https://portswigger.net/burp/communitydownload
- Run passive scan

**Option 4: Quick Online Scan**
- Use: https://www.codeql.github.com/ (for GitHub)
- Or: https://observatory.mozilla.org/

### Review Findings
- [ ] Note any vulnerabilities
- [ ] Categorize by severity
- [ ] Document remediation steps
- [ ] Create issues if needed

---

## 🎯 SECURITY CHECKLIST SUMMARY

### Essential (Must Pass) ✅
- [ ] SSL/TLS certificate valid
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No XSS vulnerabilities
- [ ] No SQL injection
- [ ] Cookies secure (HttpOnly, Secure, SameSite)
- [ ] CSRF protection present
- [ ] No sensitive data exposure

### Important (Should Pass) ✅
- [ ] CSP properly configured
- [ ] CORS appropriately restricted
- [ ] Strong authentication (if needed)
- [ ] Session management secure
- [ ] No directory listing
- [ ] Error messages don't leak info

### Nice to Have (Good to Have) ✅
- [ ] HSTS header present
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured
- [ ] Security headers scan grade A+
- [ ] No third-party vulnerabilities

---

## 📝 SCORING

| Category | Status | Score |
|----------|--------|-------|
| SSL/TLS | ✅/❌ | /15 |
| Headers | ✅/❌ | /20 |
| CORS | ✅/❌ | /15 |
| Cookies | ✅/❌ | /15 |
| Forms | ✅/❌ | /15 |
| XSS | ✅/❌ | /10 |
| SQL Injection | ✅/❌ | /10 |
| **TOTAL** | | **/100 |

**Target Score:** 90+  
**Passing Score:** 85+  
**Needs Work:** < 85

---

## 🚨 ISSUES FOUND

Document any issues:

**Issue #1: [Title]**
- Severity: Critical / High / Medium / Low
- Description: [What was found]
- Location: [Where in application]
- Reproduction: [How to reproduce]
- Recommendation: [How to fix]
- Status: Open / Fixed / Deferred

---

## ✅ AUDIT SIGN-OFF

- [ ] All essential checks passed
- [ ] All important checks passed
- [ ] All documentation completed
- [ ] Issues documented and tracked
- [ ] Remediation plan created (if needed)

**Auditor:** _______________  
**Date:** _______________  
**Result:** ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL

---

**This checklist should take approximately 2 hours to complete.**

Save findings in: `SECURITY-AUDIT-RESULTS-OCT20.md`

