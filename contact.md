---
layout: default
title: Contact Us
description: Get in touch with the 3mpwr team for questions, feedback, or collaboration opportunities.
permalink: /contact
---

# Contact Us

<div class="gradient-banner">
  <h2 style="margin: 0 0 1rem; font-size: 1.5rem;">🫂 Everyone Is Welcome to Contact Us</h2>
  <p style="margin: 0.5rem 0; line-height: 1.6;">
    <strong>3mpwrApp is here for:</strong>
  </p>
  <ul style="margin: 0.5rem 0 0 1.5rem; line-height: 1.8;">
    <li>🦽 <strong>Persons with disabilities</strong> seeking platform support or sharing feedback</li>
    <li>🏗️ <strong>Injured workers</strong> navigating compensation systems or needing resources</li>
    <li>💙 <strong>Family supporters and caregivers</strong> helping loved ones</li>
    <li>🤝 <strong>Allies and advocates</strong> wanting to get involved or learn more</li>
    <li>🛠️ <strong>Union members</strong> exploring partnership opportunities</li>
    <li>🏥 <strong>Healthcare providers</strong> interested in patient resources</li>
    <li>⚖️ <strong>Legal advocates</strong> looking for client tools and information</li>
    <li>✊ <strong>Social justice activists</strong> fighting for systemic change</li>
    <li>🏢 <strong>Employers</strong> committed to genuine accessibility</li>
    <li>🌍 <strong>General public</strong> curious about disability justice and social justice</li>
  </ul>
  <p style="margin: 1rem 0 0; font-weight: 600;">
    Whatever your role in the disability rights and social justice movement, we want to hear from you!
  </p>
</div>

We'd love to hear from you! Whether you have questions about 3mpwr, feedback to share, or collaboration opportunities, please reach out.

## Quick Links

- **Email:** [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)
- **GitHub:** [github.com/3mpowrApp](https://github.com/3mpowrApp)
- **Documentation:** [Read our user guide](/user-guide)
- **Report a Bug:** [GitHub Issues](https://github.com/3mpowrApp/3mpwrapp.github.io/issues)

### Legal & Privacy
- **[Privacy Policy](/privacy/)** - How we handle your data
- **[Terms of Service](/terms/)** - Terms and disclaimers
- **[Community Guidelines](/community/guidelines/)** - Community standards
- **[Legal Disclaimers](/legal/disclaimers/)** - All disclaimers

## Contact Form

Please fill out the form below and we'll get back to you within 24 hours:

<!-- Form success/error messages -->
<div id="form-messages" role="alert" aria-live="polite" class="form-messages" style="display: none;"></div>

<form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" class="contact-form" novalidate>
  <fieldset>
    <legend>Send us a message</legend>
    
    <div class="form-group">
      <label for="name">
        Your Name *
        <span class="required-indicator" aria-label="required">*</span>
      </label>
      <input 
        id="name" 
        name="name" 
        type="text" 
        required
        aria-required="true"
        aria-invalid="false"
        aria-describedby="name-help name-error"
        autocomplete="name">
      <small id="name-help" class="field-help">Enter your full name</small>
      <small id="name-error" class="error-message" role="alert" style="display: none;"></small>
    </div>

    <div class="form-group">
      <label for="email">
        Email Address *
        <span class="required-indicator" aria-label="required">*</span>
      </label>
      <input 
        id="email" 
        name="email" 
        type="email" 
        required
        aria-required="true"
        aria-invalid="false"
        aria-describedby="email-help email-error"
        autocomplete="email">
      <small id="email-help" class="field-help">We'll only use this to respond to your message</small>
      <small id="email-error" class="error-message" role="alert" style="display: none;"></small>
    </div>

    <div class="form-group">
      <label for="subject">
        Subject *
        <span class="required-indicator" aria-label="required">*</span>
      </label>
      <select 
        id="subject" 
        name="subject" 
        required
        aria-required="true"
        aria-invalid="false"
        aria-describedby="subject-help subject-error">
        <option value="">-- Select a subject --</option>
        <option value="general">General Inquiry</option>
        <option value="accessibility">Accessibility Issue or Suggestion</option>
        <option value="injured-worker">Injured Worker Support Question</option>
        <option value="disability">Disability Rights or Advocacy</option>
        <option value="social-justice">Social Justice Partnership</option>
        <option value="union">Union/Labour Organization Partnership</option>
        <option value="healthcare">Healthcare Provider Inquiry</option>
        <option value="legal">Legal Advocate Resources</option>
        <option value="employer">Employer Accessibility Partnership</option>
        <option value="bug">Technical Bug Report</option>
        <option value="feature">Feature Request</option>
        <option value="feedback">General Feedback</option>
        <option value="volunteer">I Want to Get Involved</option>
        <option value="media">Media/Research Inquiry</option>
        <option value="other">Other</option>
      </select>
      <small id="subject-help" class="field-help">Choose the topic that best describes your message</small>
      <small id="subject-error" class="error-message" role="alert" style="display: none;"></small>
    </div>

    <div class="form-group">
      <label for="message">
        Message *
        <span class="required-indicator" aria-label="required">*</span>
      </label>
      <textarea 
        id="message" 
        name="message" 
        rows="6" 
        required
        aria-required="true"
        aria-invalid="false"
        placeholder="Please tell us what's on your mind..."
        aria-describedby="message-help message-error message-count">
      </textarea>
      <small id="message-help" class="field-help">Be as detailed as possible to help us assist you better</small>
      <small id="message-count" class="character-count" aria-live="polite">0 characters</small>
      <small id="message-error" class="error-message" role="alert" style="display: none;"></small>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary" id="submit-btn">
        <span class="btn-text">Send Message</span>
        <span class="btn-spinner" style="display: none;" aria-hidden="true">⏳</span>
      </button>
      <button type="reset" class="btn btn-secondary">Clear Form</button>
    </div>
  </fieldset>
</form>

<script>
// Enhanced form validation and submission
(function() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formMessages = document.getElementById('form-messages');
  const messageTextarea = document.getElementById('message');
  const messageCount = document.getElementById('message-count');
  
  // Character counter
  if (messageTextarea && messageCount) {
    messageTextarea.addEventListener('input', function() {
      const count = this.value.length;
      messageCount.textContent = count + ' character' + (count !== 1 ? 's' : '');
    });
  }
  
  // Real-time validation
  const fields = ['name', 'email', 'subject', 'message'];
  fields.forEach(fieldName => {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    field.addEventListener('blur', function() {
      validateField(this);
    });
    
    field.addEventListener('input', function() {
      if (this.getAttribute('aria-invalid') === 'true') {
        validateField(this);
      }
    });
  });
  
  function validateField(field) {
    const errorElement = document.getElementById(field.id + '-error');
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    } else if (field.tagName === 'SELECT' && !field.value) {
      isValid = false;
      errorMessage = 'Please select an option';
    }
    
    if (!isValid) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('field-error');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
    } else {
      field.setAttribute('aria-invalid', 'false');
      field.classList.remove('field-error');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }
    
    return isValid;
  }
  
  // Form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate all fields
      let isFormValid = true;
      fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !validateField(field)) {
          isFormValid = false;
        }
      });
      
      if (!isFormValid) {
        showMessage('Please correct the errors before submitting', 'error');
        // Focus first error
        const firstError = form.querySelector('[aria-invalid="true"]');
        if (firstError) firstError.focus();
        return;
      }
      
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Sending...';
      submitBtn.querySelector('.btn-spinner').style.display = 'inline';
      
      // Submit form via AJAX
      const formData = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          showMessage('✅ Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
          form.reset();
          messageCount.textContent = '0 characters';
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(error => {
        showMessage('❌ Oops! There was a problem sending your message. Please try again or email us directly at empowrapp08162025@gmail.com', 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Send Message';
        submitBtn.querySelector('.btn-spinner').style.display = 'none';
      });
    });
  }
  
  function showMessage(message, type) {
    if (!formMessages) return;
    formMessages.textContent = message;
    formMessages.className = 'form-messages ' + type;
    formMessages.style.display = 'block';
    formMessages.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide success messages after 10 seconds
    if (type === 'success') {
      setTimeout(() => {
        formMessages.style.display = 'none';
      }, 10000);
    }
  }
})();
</script>

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
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .form-messages.error {
    background-color: #f8d7da;
    color: #721c24;
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
    color: #d32f2f;
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
    border-color: #d32f2f;
  }

  .form-group input.field-error:focus,
  .form-group select.field-error:focus,
  .form-group textarea.field-error:focus {
    border-color: #d32f2f;
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
    color: #d32f2f;
    font-weight: 600;
  }

  .character-count {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #666);
    font-style: italic;
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
    .form-messages.success {
      background-color: #1b4332;
      color: #d8f3dc;
      border-color: #2d6a4f;
    }

    .form-messages.error {
      background-color: #4a1c1c;
      color: #ffcdd2;
      border-color: #721c24;
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
      border-color: #4DB8FF;
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

## Other Ways to Reach Us

### Social Media
- **GitHub:** [@3mpowrApp](https://github.com/3mpowrApp)

### Accessibility
If you have accessibility issues viewing or using this form, please email us directly at [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com) and we'll assist you promptly.

### Response Time
We aim to respond to all inquiries within 24 hours during business days (Monday-Friday, 9 AM-5 PM UTC).

---

**Note:** This form requires JavaScript to function. If you're having issues, you can email us directly at [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com).
