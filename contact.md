---
layout: default
title: Contact Us
description: Get in touch with the 3mpwr team for questions, feedback, or collaboration opportunities.
permalink: /contact
---


{%- include status-banner.html -%}

<link rel="stylesheet" href="{{ '/assets/css/page-enhancements.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/contact.css' | relative_url }}">

# Contact Us

<div class="welcome-banner">
  <h2>🫂 Everyone Is Welcome to Contact Us</h2>
  <p class="banner-intro">
    <strong>3mpwrApp is here for:</strong>
  </p>
  <div class="audience-grid">
    <div class="audience-item">🦽 <strong>Persons with disabilities</strong> seeking platform support or sharing feedback</div>
    <div class="audience-item">🏗️ <strong>Injured workers</strong> navigating compensation systems or needing resources</div>
    <div class="audience-item">💙 <strong>Family supporters and caregivers</strong> helping loved ones</div>
    <div class="audience-item">🤝 <strong>Allies and advocates</strong> wanting to get involved or learn more</div>
    <div class="audience-item">🛠️ <strong>Union members</strong> exploring partnership opportunities</div>
    <div class="audience-item">🏥 <strong>Healthcare providers</strong> interested in patient resources</div>
    <div class="audience-item">⚖️ <strong>Legal advocates</strong> looking for client tools and information</div>
    <div class="audience-item">✊ <strong>Social justice activists</strong> fighting for systemic change</div>
    <div class="audience-item">🏢 <strong>Employers</strong> committed to genuine accessibility</div>
    <div class="audience-item">🌍 <strong>General public</strong> curious about disability justice and social justice</div>
  </div>
  <p class="banner-footer">
    Whatever your role in the disability rights and social justice movement, we want to hear from you!
  </p>
</div>

We'd love to hear from you! Whether you have questions about 3mpwr, feedback to share, or collaboration opportunities, please reach out.

## Quick Links

<div class="quick-links-grid">
  <a href="mailto:empowrapp08162025@gmail.com" class="quick-link-card email">
    <span class="link-icon">📧</span>
    <strong>Email Us</strong>
    <span class="link-detail">empowrapp08162025@gmail.com</span>
  </a>
  <a href="https://github.com/3mpowrApp" class="quick-link-card github">
    <span class="link-icon">💻</span>
    <strong>GitHub</strong>
    <span class="link-detail">View our code & projects</span>
  </a>
  <a href="/user-guide" class="quick-link-card docs">
    <span class="link-icon">📖</span>
    <strong>Documentation</strong>
    <span class="link-detail">Read our user guide</span>
  </a>
  <a href="https://github.com/3mpowrApp/3mpwrapp.github.io/issues" class="quick-link-card bug">
    <span class="link-icon">🐛</span>
    <strong>Report a Bug</strong>
    <span class="link-detail">GitHub Issues</span>
  </a>
</div>

### Legal & Privacy

<div class="resource-links">
  <a href="/privacy/" class="resource-link">
    <span class="link-text">🔒 Privacy Policy - How we handle your data</span>
    <span class="link-arrow">→</span>
  </a>
  <a href="/terms/" class="resource-link">
    <span class="link-text">📄 Terms of Service - Terms and disclaimers</span>
    <span class="link-arrow">→</span>
  </a>
  <a href="/community/guidelines/" class="resource-link">
    <span class="link-text">👥 Community Guidelines - Community standards</span>
    <span class="link-arrow">→</span>
  </a>
  <a href="/legal/disclaimers/" class="resource-link">
    <span class="link-text">⚖️ Legal Disclaimers - All disclaimers</span>
    <span class="link-arrow">→</span>
  </a>
</div>

## Contact Form

Please fill out the form below and we'll get back to you within 24 hours:

{%- include contact-form-aaa.html -%}

<style>
  .contact-form {
    max-width: 600px;
    margin: 2rem 0;
  }

  .form-messages {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 4px;
    font-weight: 600;
  }

  .form-messages.success {
    background-color: var(--success-bg);
    color: var(--success-text);
    border: 1px solid #c3e6cb;
  }

  .form-messages.error {
    background-color: var(--error-bg);
    color: var(--error-text);
    border: 1px solid #f5c6cb;
  }

  .form-group {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-primary, #333);
  }

  .required-indicator {
    color: var(--error-text);
    margin-left: 0.25rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.75rem;
    border: 2px solid var(--border-color, #ddd);
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    min-height: 44px;  /* Mobile-friendly touch target */
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--focus-color, #0066CC);
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
  }

  .form-group input.field-error,
  .form-group select.field-error,
  .form-group textarea.field-error {
    border-color: var(--error-text);
  }

  .form-group input.field-error:focus,
  .form-group select.field-error:focus,
  .form-group textarea.field-error:focus {
    border-color: var(--error-text);
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.2);
  }

  .form-group textarea {
    min-height: 150px;
    resize: vertical;
  }

  .field-help {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #666);
  }

  .error-message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--error-text);
    font-weight: 600;
  }

  .character-count {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #666);
    font-style: italic;
  }

  /* Turnstile CAPTCHA widget */
  .cf-turnstile {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
  }

  .captcha-placeholder {
    padding: 1rem;
    background-color: var(--bg-tertiary);
    border: 2px dashed #ccc;
    border-radius: 4px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .captcha-placeholder p {
    margin: 0;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn {
    padding: 0.875rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    min-height: 44px;  /* Mobile-friendly touch target */
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background-color: var(--button-bg, #0066CC);
    color: var(--button-text, white);
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--button-hover-bg, #0052a3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
  }

  .btn-primary:focus {
    outline: 3px solid var(--focus-color, #0066CC);
    outline-offset: 2px;
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-secondary {
    background-color: transparent;
    color: var(--text-primary, #333);
    border: 2px solid var(--border-color, #ddd);
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: var(--bg-secondary, #f5f5f5);
    border-color: var(--text-secondary, #666);
  }

  .btn-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (prefers-color-scheme: dark) {
    .captcha-placeholder {
      background-color: var(--bg-primary);
      border-color: var(--border-medium);
      color: var(--text-secondary);
    }

    .form-messages.success {
      background-color: var(--success-bg);
      color: var(--success-text);
      border-color: var(--success-border);
    }

    .form-messages.error {
      background-color: var(--error-bg);
      color: var(--error-text);
      border-color: var(--error-text);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      background-color: var(--input-bg-dark, #2d2d2d);
      color: var(--text-dark, #e0e0e0);
      border-color: var(--border-dark, #444);
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      background-color: var(--input-bg-focus-dark, #1a2a3a);
      border-color: var(--info-border);
      box-shadow: 0 0 0 3px rgba(77, 184, 255, 0.2);
    }

    .field-help,
    .character-count {
      color: var(--text-secondary-dark, #aaa);
    }

    .btn-secondary {
      color: var(--text-dark, #e0e0e0);
      border-color: var(--border-dark, #555);
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: var(--bg-secondary-dark, #3a3a3a);
      border-color: var(--text-secondary-dark, #aaa);
    }

    /* CRITICAL: Button primary needs explicit colors in dark mode */
    .btn-primary {
      background-color: var(--info-bg) !important;
      color: var(--text-primary) !important;
    }

    .btn-primary .btn-text,
    .btn-primary .btn-spinner {
      color: var(--text-primary) !important;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: var(--info-bg) !important;
      color: var(--text-primary) !important;
    }
  }

  /* CRITICAL: [data-theme="dark"] overrides MUST come after @media to take precedence */
  [data-theme="dark"] .btn-primary {
    background-color: var(--info-bg) !important;
    color: var(--text-primary) !important;
  }

  [data-theme="dark"] .btn-primary .btn-text,
  [data-theme="dark"] .btn-primary .btn-spinner {
    color: var(--text-primary) !important;
  }

  [data-theme="dark"] .btn-primary:hover:not(:disabled) {
    background-color: var(--info-bg) !important;
    color: var(--text-primary) !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .btn,
    .form-group input,
    .form-group select,
    .form-group textarea {
      transition: none;
    }

    .btn-spinner {
      animation: none;
    }
  }

  @media (max-width: 600px) {
    .contact-form {
      margin: 1rem 0;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>

<!-- Cloudflare Turnstile Script - Lazy Loaded -->
<script>
  // Global variables for Turnstile
  let turnstileVerified = false;
  let turnstileLoaded = false;
  let formInteracted = false;

  // Lazy load Turnstile when user interacts with form
  function loadTurnstile() {
    if (turnstileLoaded) return;
    
    turnstileLoaded = true;
    const placeholder = document.querySelector('.captcha-placeholder');
    if (placeholder) {
      placeholder.innerHTML = '<p>⏳ Loading security verification...</p>';
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = function() {
      if (placeholder) {
        placeholder.remove();
      }
    };
    script.onerror = function() {
      if (placeholder) {
        placeholder.innerHTML = '<p style="color: var(--error-text);">⚠️ Failed to load verification. Please refresh the page.</p>';
      }
    };
    document.head.appendChild(script);
  }

  // Detect form interaction
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Disable submit button initially
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-label', 'Send Message - Please start filling the form');
    }

    // Load Turnstile on first interaction with any form field
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        if (!formInteracted) {
          formInteracted = true;
          loadTurnstile();
          if (submitBtn) {
            submitBtn.setAttribute('aria-label', 'Send Message - Loading security verification');
          }
        }
      }, { once: true });
    });

    // Also load on first input
    inputs.forEach(input => {
      input.addEventListener('input', function() {
        if (!formInteracted) {
          formInteracted = true;
          loadTurnstile();
        }
      }, { once: true });
    });
  });
</script>

<script>
  // Turnstile callback functions
  // Note: turnstileVerified is now declared above in the lazy-load script

  function onTurnstileSuccess(token) {
    turnstileVerified = true;
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.setAttribute('aria-label', 'Send Message - Verification complete');
    }
    
    // Track successful verification in analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'turnstile_success', {
        'event_category': 'security',
        'event_label': 'contact_form'
      });
    }
  }

  function onTurnstileError() {
    turnstileVerified = false;
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-label', 'Send Message - Verification failed');
    }
    
    alert('Security verification failed. Please refresh the page and try again.');
    
    // Track failures in analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'turnstile_error', {
        'event_category': 'security',
        'event_label': 'contact_form'
      });
    }
  }

  function onTurnstileExpired() {
    turnstileVerified = false;
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-label', 'Send Message - Verification expired');
    }
    
    alert('Security verification expired. Please verify again.');
  }
</script>

<script src="{{ '/assets/js/contact.js' | relative_url }}" defer></script>

## Other Ways to Reach Us

### Social Media

Connect with us and use **#3mpwrApp** to join the conversation!

- **GitHub:** [@3mpowrApp](https://github.com/3mpowrApp)
- **X (Twitter):** [@3mpwrApp0816](https://x.com/3mpwrApp0816)
- **Facebook:** [@3mpowrapp](https://www.facebook.com/3mpowrapp/)
- **Instagram:** [@3mpowrapp](https://www.instagram.com/3mpowrapp/)
- **TikTok:** [@3mpwrapp](https://www.tiktok.com/@3mpwrapp)
- **Mastodon:** [@3mpwrApp@mastodon.social](https://mastodon.social/@3mpwrApp)

### Accessibility
If you have accessibility issues viewing or using this form, please email us directly at [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com) and we'll assist you promptly.

### Response Time
We aim to respond to all inquiries within 24 hours during business days (Monday-Friday, 9 AM-5 PM UTC).

---

**Note:** This form requires JavaScript to function. If you're having issues, you can email us directly at [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com).

{%- include page-feedback.html -%}
