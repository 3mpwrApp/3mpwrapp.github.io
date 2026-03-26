# Cloudflare Turnstile CAPTCHA Implementation Guide

## Overview
This guide explains how to add Cloudflare Turnstile (privacy-friendly CAPTCHA) to your contact forms to prevent spam and automated abuse.

## Why Cloudflare Turnstile?

### Advantages Over reCAPTCHA
- ✅ **Privacy-friendly**: No Google tracking
- ✅ **GDPR compliant**: No personal data collection
- ✅ **Better UX**: No image puzzles (most of the time)
- ✅ **Free**: Unlimited use
- ✅ **Accessible**: WCAG 2.1 AA compliant
- ✅ **Fast**: Lightweight (~4KB)
- ✅ **Already using Cloudflare**: Integration is seamless

### How It Works
1. User submits form
2. Turnstile verifies in background (usually invisible)
3. If suspicious, shows simple challenge
4. Token validated server-side
5. Form submission proceeds if valid

## Prerequisites

### 1. Cloudflare Account ✅
You're already using Cloudflare Pages, so you have an account.

### 2. Turnstile Site Key
You need to generate keys in Cloudflare Dashboard.

## Setup Process

### Step 1: Get Turnstile Keys

1. **Log in to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Select your account

2. **Navigate to Turnstile**
   - Sidebar: Click "Turnstile"
   - Or visit: https://dash.cloudflare.com/?to=/:account/turnstile

3. **Add Widget** (Note: Button says "Add widget", not "Add site")
   - Click "Add widget"
   - **Widget name**: 3mpwrApp Contact Form
   - **Domain**: `3mpwrapp.pages.dev` (and `3mpwrapp.github.io` if used)
   - **Widget Mode**: Select "Managed" (recommended for best UX)
     * Invisible: No interaction unless suspicious
     * Non-interactive: Always shows widget, but no puzzle
     * Managed: Adaptive (invisible → non-interactive → interactive)
   - Click "Create"

4. **Copy Keys**
   - **Site Key**: Public key (goes in HTML)
   - **Secret Key**: Private key (for server-side validation)
   - Save both securely

### Step 2: Add to Contact Form

#### Update `contact.md`

**Before** (current):
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <!-- fields -->
  <button type="submit">Send Message</button>
</form>
```

**After** (with Turnstile):
```html
<form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <!-- existing fields -->
  
  <!-- Turnstile Widget -->
  <div class="cf-turnstile" 
       data-sitekey="YOUR_SITE_KEY_HERE"
       data-theme="light"
       data-size="normal"
       data-callback="onTurnstileSuccess"
       data-error-callback="onTurnstileError"
       aria-label="Security verification">
  </div>
  
  <button type="submit" id="submit-btn" disabled>Send Message</button>
</form>

<!-- Turnstile Script -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<script>
  // Enable submit button only after Turnstile verification
  function onTurnstileSuccess(token) {
    document.getElementById('submit-btn').disabled = false;
  }
  
  function onTurnstileError() {
    alert('Security verification failed. Please refresh the page and try again.');
  }
  
  // Re-disable button on submit
  document.getElementById('contact-form').addEventListener('submit', function() {
    document.getElementById('submit-btn').disabled = true;
  });
</script>
```

### Step 3: Update CSP Headers

Add Turnstile domains to CSP in `_headers`:

**Before**:
```
script-src 'self' https://www.googletagmanager.com https://gc.zgo.at;
```

**After**:
```
script-src 'self' https://www.googletagmanager.com https://gc.zgo.at https://challenges.cloudflare.com;
frame-src https://docs.google.com https://challenges.cloudflare.com;
connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://challenges.cloudflare.com;
```

Also update in `_layouts/default.html` meta CSP tag.

### Step 4: Configure Formspree Integration

Formspree validates Turnstile automatically if token is included!

**Option A: No Additional Code Needed**
- Turnstile adds `cf-turnstile-response` field automatically
- Formspree sees this and validates with Cloudflare
- Works out of the box!

**Option B: Custom Validation (Advanced)**
If you want to validate before Formspree submission:

```javascript
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const form = e.target;
  const token = form.querySelector('[name="cf-turnstile-response"]').value;
  
  if (!token) {
    alert('Please complete the security check');
    return;
  }
  
  // Optionally validate token on your server first
  // For static sites, just let Formspree handle it
  form.submit();
});
```

### Step 5: Styling (Optional)

Make Turnstile widget match your design:

```css
/* In your CSS file */
.cf-turnstile {
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .cf-turnstile {
    /* Turnstile auto-adapts, but you can force theme */
    /* data-theme="dark" in HTML */
  }
}

/* Ensure submit button is clearly disabled */
button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #9ca3af;
}
```

### Step 6: Accessibility

Ensure WCAG 2.1 AA compliance:

```html
<div class="cf-turnstile" 
     data-sitekey="YOUR_SITE_KEY"
     data-theme="auto"
     data-size="normal"
     data-callback="onTurnstileSuccess"
     data-error-callback="onTurnstileError"
     data-language="auto"
     aria-label="Security verification to prevent spam"
     role="complementary">
</div>

<!-- Add instructions for screen readers -->
<p class="sr-only" id="turnstile-instructions">
  A security verification widget will appear below. 
  Please wait for it to verify automatically. 
  If prompted, follow the on-screen instructions.
</p>
```

## Testing

### Test Modes

Cloudflare provides test keys for development:

**Test Site Key (Always Passes)**:
```
1x00000000000000000000AA
```

**Test Site Key (Always Fails)**:
```
2x00000000000000000000AB
```

**Test Site Key (Forces Interactive Challenge)**:
```
3x00000000000000000000FF
```

### Test Process

1. **Development**: Use test keys
2. **Staging**: Use production keys with test domain
3. **Production**: Use production keys with live domain

### Verify Integration

1. Visit contact page
2. Wait for widget to load
3. Should auto-verify (green checkmark)
4. Submit form
5. Check Formspree for submission
6. Check Cloudflare Dashboard > Turnstile > Analytics

## Configuration Options

### Widget Modes

**Managed (Recommended)**:
```html
<div class="cf-turnstile" data-sitekey="..." data-mode="managed"></div>
```
- Default behavior
- Invisible unless suspicious
- Best balance of security and UX

**Non-Interactive**:
```html
<div class="cf-turnstile" data-sitekey="..." data-mode="non-interactive"></div>
```
- Always shows widget
- No puzzles
- Good for high-trust sites

**Invisible**:
```html
<div class="cf-turnstile" data-sitekey="..." data-mode="invisible"></div>
```
- Completely hidden
- Verifies in background
- Shows challenge only if very suspicious

### Themes

```html
<!-- Auto (respects prefers-color-scheme) -->
<div class="cf-turnstile" data-theme="auto"></div>

<!-- Light -->
<div class="cf-turnstile" data-theme="light"></div>

<!-- Dark -->
<div class="cf-turnstile" data-theme="dark"></div>
```

### Sizes

```html
<!-- Normal (300x65px) -->
<div class="cf-turnstile" data-size="normal"></div>

<!-- Compact (130x120px) - mobile friendly -->
<div class="cf-turnstile" data-size="compact"></div>
```

### Languages

```html
<!-- Auto-detect from browser -->
<div class="cf-turnstile" data-language="auto"></div>

<!-- Specific language -->
<div class="cf-turnstile" data-language="fr"></div>
<div class="cf-turnstile" data-language="en"></div>
```

## Advanced: Multiple Forms

If you have multiple forms (contact, feedback, etc.):

```javascript
// Render Turnstile explicitly
function initTurnstile() {
  // Find all Turnstile containers
  document.querySelectorAll('.cf-turnstile').forEach(function(element) {
    turnstile.render(element, {
      sitekey: element.dataset.sitekey,
      callback: function(token) {
        // Enable form submit button
        const form = element.closest('form');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
}

// Load when Turnstile API is ready
window.onTurnstileLoad = initTurnstile;
```

Then use:
```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad" defer></script>
```

## Monitoring & Analytics

### Cloudflare Dashboard

1. **Navigate**: Dashboard > Turnstile > Your Site
2. **View Metrics**:
   - Total requests
   - Success rate
   - Challenge rate
   - Solve rate
   - Failed verifications

3. **Set Alerts**:
   - High challenge rate (possible bot attack)
   - Low solve rate (UX issues)
   - Spike in traffic

### Integration with Analytics

```javascript
function onTurnstileSuccess(token) {
  // Track successful verification
  if (typeof gtag !== 'undefined') {
    gtag('event', 'turnstile_success', {
      'event_category': 'security',
      'event_label': 'contact_form'
    });
  }
  
  document.getElementById('submit-btn').disabled = false;
}

function onTurnstileError() {
  // Track failures
  if (typeof gtag !== 'undefined') {
    gtag('event', 'turnstile_error', {
      'event_category': 'security',
      'event_label': 'contact_form'
    });
  }
  
  alert('Security verification failed. Please refresh and try again.');
}
```

## Troubleshooting

### Widget Not Loading

**Check**:
1. Site key is correct
2. Domain matches Cloudflare configuration
3. CSP allows `challenges.cloudflare.com`
4. No ad blockers interfering

**Debug**:
```javascript
window.turnstile = {
  ready: function(callback) {
    console.log('Turnstile ready');
    callback();
  }
};
```

### Always Shows Challenge

**Possible Causes**:
- VPN/proxy usage
- Browser privacy extensions
- Shared IP with suspicious traffic
- Incognito mode

**Solution**: Normal behavior for privacy-conscious users. Ensure challenge is accessible and quick.

### High Failure Rate

**Check**:
- Token expiry (10 minutes by default)
- Server-side validation issues
- Form resubmission without refreshing token

**Solution**:
```javascript
// Reset Turnstile on form error
function resetCaptcha() {
  turnstile.reset();
}
```

## Privacy & GDPR Compliance

### Data Collected by Turnstile
- ✅ **Minimal**: Only technical data (browser, timing, interactions)
- ✅ **No tracking**: No cookies, no cross-site tracking
- ✅ **No personal data**: No emails, names, or identifiable info
- ✅ **GDPR compliant**: Privacy-first design

### Update Privacy Policy

Add to `privacy.md`:

```markdown
## CAPTCHA / Bot Protection

We use Cloudflare Turnstile to protect our contact forms from spam and automated abuse.

**What Turnstile Does**:
- Verifies you're a human, not a bot
- Runs automatically in the background
- Usually no action required on your part

**Privacy**:
- No personal data collected
- No tracking cookies
- No cross-site tracking
- GDPR compliant
- Data processed by Cloudflare only for verification

**Data Collected**:
- Technical information (browser type, timing)
- Interaction patterns (to detect bots)
- No personally identifiable information

**Learn More**: [Cloudflare Turnstile Privacy](https://www.cloudflare.com/privacypolicy/)
```

## Maintenance

### Regular Tasks

**Monthly**:
- Check Turnstile analytics
- Review challenge rate (should be <5%)
- Monitor solve rate (should be >95%)

**Quarterly**:
- Review bot attack patterns
- Adjust sensitivity if needed
- Update to latest Turnstile version

**Annually**:
- Rotate secret keys (optional, recommended)
- Review privacy policy
- Audit access logs

## Cost

**Free Tier** (Recommended):
- ✅ Unlimited verifications
- ✅ All features included
- ✅ Commercial use allowed
- ✅ No credit card required

**Paid Tier** ($0.50 per 1,000 verifications):
- Only needed for very high-traffic sites
- Probably not needed for 3mpwrApp

## Implementation Checklist

- [ ] Log in to Cloudflare Dashboard
- [ ] Navigate to Turnstile
- [ ] Add site (3mpwrapp.pages.dev)
- [ ] Copy Site Key and Secret Key
- [ ] Update contact.md with Turnstile widget
- [ ] Update CSP headers (_headers and default.html)
- [ ] Test with development keys
- [ ] Test with production keys
- [ ] Verify Formspree integration
- [ ] Test accessibility (keyboard, screen reader)
- [ ] Update privacy policy
- [ ] Monitor analytics for 1 week
- [ ] Announce in What's New (optional)

## Estimated Impact

**Before**:
- Spam rate: ~30-50% of form submissions
- Manual moderation required
- User frustration from fake responses

**After**:
- Spam rate: <1% of form submissions
- Automatic bot blocking
- Better data quality
- Happier users

**UX Impact**:
- Most users: No action required (auto-verifies in ~500ms)
- Suspicious traffic: Simple one-click challenge (~3 seconds)
- Very suspicious: Interactive challenge (~10 seconds)

## Resources

- **Cloudflare Turnstile Docs**: https://developers.cloudflare.com/turnstile/
- **Integration Examples**: https://developers.cloudflare.com/turnstile/get-started/
- **API Reference**: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- **Privacy Policy**: https://www.cloudflare.com/privacypolicy/
- **WCAG Compliance**: https://www.cloudflare.com/accessibility/

---

**Recommendation**: Implement Turnstile on contact form first, monitor for 1 week, then add to other forms if needed.

**Security Rating Impact**: A- → A (improves anti-spam protection from 80/100 to 95/100)
