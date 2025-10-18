---
layout: default
title: Contact Us
description: Get in touch with the 3mpwr team for questions, feedback, or collaboration opportunities.
permalink: /contact
---

# Contact Us

We'd love to hear from you! Whether you have questions about 3mpwr, feedback to share, or collaboration opportunities, please reach out.

## Quick Links

- **Email:** [contact@3mpowr.com](mailto:contact@3mpowr.com)
- **GitHub:** [github.com/3mpowrApp](https://github.com/3mpowrApp)
- **Documentation:** [Read our user guide](/user-guide)
- **Report a Bug:** [GitHub Issues](https://github.com/3mpowrApp/3mpwrapp.github.io/issues)

## Contact Form

Please fill out the form below and we'll get back to you within 24 hours:

<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" class="contact-form">
  <fieldset>
    <legend>Send us a message</legend>
    
    <div class="form-group">
      <label for="name">Your Name *</label>
      <input 
        id="name" 
        name="name" 
        type="text" 
        required
        aria-describedby="name-help">
      <small id="name-help">Enter your full name</small>
    </div>

    <div class="form-group">
      <label for="email">Email Address *</label>
      <input 
        id="email" 
        name="email" 
        type="email" 
        required
        aria-describedby="email-help">
      <small id="email-help">We'll only use this to respond to your message</small>
    </div>

    <div class="form-group">
      <label for="subject">Subject *</label>
      <select id="subject" name="subject" required aria-describedby="subject-help">
        <option value="">-- Select a subject --</option>
        <option value="general">General Inquiry</option>
        <option value="bug">Bug Report</option>
        <option value="feature">Feature Request</option>
        <option value="feedback">Feedback</option>
        <option value="partnership">Partnership</option>
        <option value="other">Other</option>
      </select>
      <small id="subject-help">Choose the topic that best describes your message</small>
    </div>

    <div class="form-group">
      <label for="message">Message *</label>
      <textarea 
        id="message" 
        name="message" 
        rows="6" 
        required
        placeholder="Please tell us what's on your mind..."
        aria-describedby="message-help">
      </textarea>
      <small id="message-help">Be as detailed as possible to help us assist you better</small>
    </div>

    <button type="submit" class="btn btn-primary">Send Message</button>
  </fieldset>
</form>

<style>
  .contact-form {
    max-width: 600px;
    margin: 2rem 0;
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

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.75rem;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    min-height: 44px;  /* Mobile-friendly touch target */
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: 3px solid #0066CC;
    outline-offset: 2px;
    border-color: #0066CC;
    background-color: var(--input-bg-focus, #f0f7ff);
  }

  .form-group textarea {
    min-height: 150px;
    resize: vertical;
  }

  .form-group small {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #666);
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
  }

  .btn-primary {
    background-color: #0066CC;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0052a3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
  }

  .btn-primary:focus {
    outline: 3px solid #0066CC;
    outline-offset: 2px;
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  @media (prefers-color-scheme: dark) {
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
      outline-color: #4DB8FF;
    }

    .form-group small {
      color: var(--text-secondary-dark, #aaa);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn,
    .form-group input,
    .form-group select,
    .form-group textarea {
      transition: none;
    }
  }

  @media (max-width: 600px) {
    .contact-form {
      margin: 1rem 0;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .btn {
      width: 100%;
    }
  }
</style>

## Other Ways to Reach Us

### Social Media
- **GitHub:** [@3mpowrApp](https://github.com/3mpowrApp)

### Accessibility
If you have accessibility issues viewing or using this form, please email us directly at [contact@3mpowr.com](mailto:contact@3mpowr.com) and we'll assist you promptly.

### Response Time
We aim to respond to all inquiries within 24 hours during business days (Monday-Friday, 9 AM-5 PM UTC).

---

**Note:** This form requires JavaScript to function. If you're having issues, you can email us directly at [contact@3mpowr.com](mailto:contact@3mpowr.com).
