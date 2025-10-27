// Contact Form Enhancement Script
// Handles form validation, auto-save, and submission for the Contact page

(function() {
  'use strict';

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formMessages = document.getElementById('form-messages');
  const messageTextarea = document.getElementById('message');
  const messageCount = document.getElementById('message-count');
  
  // Auto-save configuration
  const AUTOSAVE_KEY = '3mpwr_contact_form_draft';
  const AUTOSAVE_INTERVAL = 10000; // 10 seconds
  let autosaveTimeout;
  let hasUnsavedChanges = false;
  
  // Initialize character counter
  function initCharCounter() {
    if (messageTextarea && messageCount) {
      messageTextarea.addEventListener('input', function() {
        const count = this.value.length;
        messageCount.textContent = count + ' character' + (count !== 1 ? 's' : '');
      });
    }
  }
  
  // Auto-save functionality
  function saveFormDraft() {
    if (!form) return;
    
    const formData = {
      name: document.getElementById('name')?.value || '',
      email: document.getElementById('email')?.value || '',
      subject: document.getElementById('subject')?.value || '',
      message: document.getElementById('message')?.value || '',
      timestamp: new Date().toISOString()
    };
    
    // Only save if there's actual content
    if (formData.name || formData.email || formData.message) {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
        hasUnsavedChanges = true;
        showAutoSaveIndicator();
      } catch (e) {
        console.warn('Could not save form draft:', e);
      }
    }
  }
  
  function loadFormDraft() {
    const savedData = localStorage.getItem(AUTOSAVE_KEY);
    if (!savedData) return;
    
    try {
      const formData = JSON.parse(savedData);
      const savedDate = new Date(formData.timestamp);
      const now = new Date();
      const hoursSince = (now - savedDate) / (1000 * 60 * 60);
      
      // Only restore if saved within last 24 hours
      if (hoursSince > 24) {
        localStorage.removeItem(AUTOSAVE_KEY);
        return;
      }
      
      // Ask user if they want to restore
      if (confirm('We found a saved draft of your message from ' + savedDate.toLocaleString() + '. Would you like to restore it?')) {
        document.getElementById('name').value = formData.name || '';
        document.getElementById('email').value = formData.email || '';
        document.getElementById('subject').value = formData.subject || '';
        document.getElementById('message').value = formData.message || '';
        
        // Update character count
        if (messageTextarea && messageCount) {
          const count = messageTextarea.value.length;
          messageCount.textContent = count + ' character' + (count !== 1 ? 's' : '');
        }
        
        showMessage('✅ Draft restored successfully!', 'success');
        setTimeout(() => {
          if (formMessages) formMessages.style.display = 'none';
        }, 3000);
      } else {
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    } catch (e) {
      console.warn('Could not load form draft:', e);
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  }
  
  function showAutoSaveIndicator() {
    // Create temporary indicator
    const indicator = document.createElement('div');
    indicator.className = 'autosave-indicator';
    indicator.textContent = '💾 Draft saved';
    indicator.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #4caf50; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1000; animation: fadeInOut 2s ease;';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.remove();
    }, 2000);
  }
  
  // Initialize auto-save on input change
  function initAutoSave() {
    if (!form) return;
    
    const formInputs = form.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
      input.addEventListener('input', function() {
        clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(saveFormDraft, AUTOSAVE_INTERVAL);
      });
    });
  }
  
  // Real-time field validation
  function initValidation() {
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
  }
  
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
  
  // Form submission handler
  function initFormSubmit() {
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate all fields
      const fields = ['name', 'email', 'subject', 'message'];
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
          if (messageCount) messageCount.textContent = '0 characters';
          
          // Clear saved draft
          localStorage.removeItem(AUTOSAVE_KEY);
          hasUnsavedChanges = false;
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(error => {
        console.error('Form submission error:', error);
        showMessage('❌ Oops! There was a problem sending your message. Please try again or email us directly at empowrapp08162025@gmail.com', 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Send Message';
        submitBtn.querySelector('.btn-spinner').style.display = 'none';
      });
    });
    
    // Clear draft on form reset
    form.addEventListener('reset', function() {
      localStorage.removeItem(AUTOSAVE_KEY);
      hasUnsavedChanges = false;
      
      // Clear validation states
      const fields = ['name', 'email', 'subject', 'message'];
      fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
          field.setAttribute('aria-invalid', 'false');
          field.classList.remove('field-error');
          const errorElement = document.getElementById(field.id + '-error');
          if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
          }
        }
      });
      
      if (messageCount) messageCount.textContent = '0 characters';
    });
  }
  
  // Warn before leaving with unsaved changes
  function initBeforeUnload() {
    window.addEventListener('beforeunload', function(e) {
      if (hasUnsavedChanges) {
        // Save one last time
        saveFormDraft();
      }
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
  
  // Add fade in/out animation for auto-save indicator
  function initAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize all functionality
  function init() {
    if (!form) {
      console.warn('Contact form not found on page');
      return;
    }
    
    initCharCounter();
    initAutoSave();
    initValidation();
    initFormSubmit();
    initBeforeUnload();
    initAnimations();
    
    // Load any saved draft
    loadFormDraft();
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
