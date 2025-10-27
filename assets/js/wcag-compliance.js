/**
 * 3mpwrApp - WCAG 2.2 AA+ Compliance JavaScript
 * Enhanced accessibility features for maximum compliance
 * Last updated: October 27, 2025
 */

(function() {
  'use strict';

  // ============================================
  // KEYBOARD NAVIGATION DETECTION
  // ============================================
  function handleFirstTab(e) {
    if (e.keyCode === 9) {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
      window.addEventListener('mousedown', handleMouseDownOnce);
    }
  }

  function handleMouseDownOnce() {
    document.body.classList.remove('user-is-tabbing');
    window.removeEventListener('mousedown', handleMouseDownOnce);
    window.addEventListener('keydown', handleFirstTab);
  }

  window.addEventListener('keydown', handleFirstTab);

  // ============================================
  // DYSLEXIA-FRIENDLY FONT TOGGLE
  // ============================================
  const dyslexicFontToggle = document.getElementById('dyslexic-font-toggle');
  
  if (dyslexicFontToggle) {
    // Check saved preference
    if (localStorage.getItem('dyslexicFont') === 'true') {
      document.body.setAttribute('data-font', 'dyslexic');
      dyslexicFontToggle.checked = true;
    }

    dyslexicFontToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.setAttribute('data-font', 'dyslexic');
        localStorage.setItem('dyslexicFont', 'true');
        announce('Dyslexia-friendly font enabled');
      } else {
        document.body.removeAttribute('data-font');
        localStorage.setItem('dyslexicFont', 'false');
        announce('Default font restored');
      }
    });
  }

  // ============================================
  // READING GUIDE/RULER
  // ============================================
  const readingGuideToggle = document.getElementById('reading-guide-toggle');
  let readingRuler = null;

  if (readingGuideToggle) {
    readingGuideToggle.addEventListener('change', function() {
      if (this.checked) {
        // Create reading ruler
        if (!readingRuler) {
          readingRuler = document.createElement('div');
          readingRuler.className = 'reading-ruler';
          readingRuler.setAttribute('aria-hidden', 'true');
          document.body.appendChild(readingRuler);
        }
        
        document.body.setAttribute('data-reading-guide', 'ruler');
        
        // Track mouse movement
        document.addEventListener('mousemove', updateRulerPosition);
        localStorage.setItem('readingGuide', 'true');
        announce('Reading guide enabled - ruler follows your mouse');
      } else {
        document.body.removeAttribute('data-reading-guide');
        document.removeEventListener('mousemove', updateRulerPosition);
        if (readingRuler) readingRuler.style.display = 'none';
        localStorage.setItem('readingGuide', 'false');
        announce('Reading guide disabled');
      }
    });

    // Restore preference
    if (localStorage.getItem('readingGuide') === 'true') {
      readingGuideToggle.checked = true;
      readingGuideToggle.dispatchEvent(new Event('change'));
    }
  }

  function updateRulerPosition(e) {
    if (readingRuler) {
      readingRuler.style.top = e.clientY + 'px';
    }
  }

  // ============================================
  // BIONIC READING MODE
  // ============================================
  const bionicReadingToggle = document.getElementById('bionic-reading-toggle');
  
  if (bionicReadingToggle) {
    bionicReadingToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.setAttribute('data-reading', 'bionic');
        localStorage.setItem('bionicReading', 'true');
        announce('Bionic reading enabled - first letters emphasized');
      } else {
        document.body.removeAttribute('data-reading');
        localStorage.setItem('bionicReading', 'false');
        announce('Bionic reading disabled');
      }
    });

    // Restore preference
    if (localStorage.getItem('bionicReading') === 'true') {
      bionicReadingToggle.checked = true;
      bionicReadingToggle.dispatchEvent(new Event('change'));
    }
  }

  // ============================================
  // LINE FOCUS MODE
  // ============================================
  const lineFocusToggle = document.getElementById('line-focus-toggle');
  
  if (lineFocusToggle) {
    lineFocusToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.setAttribute('data-reading', 'line-focus');
        localStorage.setItem('lineFocus', 'true');
        announce('Line focus mode enabled - hover over text to highlight');
      } else {
        document.body.removeAttribute('data-reading');
        localStorage.setItem('lineFocus', 'false');
        announce('Line focus mode disabled');
      }
    });

    // Restore preference
    if (localStorage.getItem('lineFocus') === 'true') {
      lineFocusToggle.checked = true;
      lineFocusToggle.dispatchEvent(new Event('change'));
    }
  }

  // ============================================
  // VOICE COMMAND LABELS
  // ============================================
  const voiceLabelsToggle = document.getElementById('voice-labels-toggle');
  
  if (voiceLabelsToggle) {
    voiceLabelsToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.setAttribute('data-show-voice-labels', 'true');
        localStorage.setItem('voiceLabels', 'true');
        announce('Voice command labels enabled');
      } else {
        document.body.removeAttribute('data-show-voice-labels');
        localStorage.setItem('voiceLabels', 'false');
        announce('Voice command labels disabled');
      }
    });

    // Restore preference
    if (localStorage.getItem('voiceLabels') === 'true') {
      voiceLabelsToggle.checked = true;
      voiceLabelsToggle.dispatchEvent(new Event('change'));
    }
  }

  // ============================================
  // FORM VALIDATION ENHANCEMENTS
  // ============================================
  function enhanceFormAccessibility() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
      // Add ARIA labels to all form fields
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(function(input) {
        // Add describedby for helper text
        const label = form.querySelector('label[for="' + input.id + '"]');
        if (label && !input.hasAttribute('aria-label')) {
          input.setAttribute('aria-labelledby', label.id || generateId('label'));
          if (!label.id) label.id = input.getAttribute('aria-labelledby');
        }

        // Real-time validation feedback
        input.addEventListener('blur', function() {
          if (input.validity.valid) {
            input.setAttribute('aria-invalid', 'false');
            input.classList.remove('form-error');
            input.classList.add('form-success');
            removeErrorMessage(input);
          } else {
            input.setAttribute('aria-invalid', 'true');
            input.classList.add('form-error');
            input.classList.remove('form-success');
            showErrorMessage(input);
          }
        });

        // Clear error on focus
        input.addEventListener('focus', function() {
          input.classList.remove('form-error', 'form-success');
          removeErrorMessage(input);
        });
      });

      // Prevent accidental form submission
      form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let allValid = true;
        
        requiredFields.forEach(function(field) {
          if (!field.validity.valid) {
            allValid = false;
            field.setAttribute('aria-invalid', 'true');
            field.classList.add('form-error');
            showErrorMessage(field);
          }
        });

        if (!allValid) {
          e.preventDefault();
          announce('Please fix the errors in the form before submitting');
          // Focus first error
          const firstError = form.querySelector('.form-error');
          if (firstError) firstError.focus();
        }
      });
    });
  }

  function showErrorMessage(input) {
    removeErrorMessage(input); // Remove existing
    
    const errorText = document.createElement('div');
    errorText.className = 'error-message-text';
    errorText.id = input.id + '-error';
    errorText.setAttribute('role', 'alert');
    
    if (input.validity.valueMissing) {
      errorText.textContent = 'This field is required';
    } else if (input.validity.typeMismatch) {
      errorText.textContent = 'Please enter a valid ' + input.type;
    } else if (input.validity.tooShort) {
      errorText.textContent = 'Please enter at least ' + input.minLength + ' characters';
    } else if (input.validity.tooLong) {
      errorText.textContent = 'Please enter no more than ' + input.maxLength + ' characters';
    } else {
      errorText.textContent = 'Please check this field';
    }
    
    input.setAttribute('aria-describedby', errorText.id);
    input.parentNode.insertBefore(errorText, input.nextSibling);
  }

  function removeErrorMessage(input) {
    const existingError = document.getElementById(input.id + '-error');
    if (existingError) {
      existingError.remove();
      input.removeAttribute('aria-describedby');
    }
  }

  function generateId(prefix) {
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize form enhancements
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceFormAccessibility);
  } else {
    enhanceFormAccessibility();
  }

  // ============================================
  // SKIP NAVIGATION ENHANCEMENTS
  // ============================================
  const skipLinks = document.querySelectorAll('.skip-link');
  
  skipLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      
      if (target) {
        // Ensure target can receive focus
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        announce('Skipped to ' + (target.getAttribute('aria-label') || targetId));
      }
    });
  });

  // ============================================
  // TIMEOUT MANAGEMENT
  // ============================================
  let timeoutId = null;
  const TIMEOUT_DURATION = 20 * 60 * 1000; // 20 minutes
  const WARNING_DURATION = 2 * 60 * 1000; // 2 minutes before timeout

  function resetTimeout() {
    clearTimeout(timeoutId);
    
    // Start new timeout
    timeoutId = setTimeout(function() {
      showTimeoutWarning();
    }, TIMEOUT_DURATION - WARNING_DURATION);
  }

  function showTimeoutWarning() {
    const warning = document.createElement('div');
    warning.className = 'timeout-warning';
    warning.setAttribute('role', 'alert');
    warning.setAttribute('aria-live', 'assertive');
    warning.innerHTML = `
      <p>Your session will expire in 2 minutes due to inactivity.</p>
      <button id="extend-session" type="button">Continue working (stay logged in)</button>
    `;
    
    document.body.appendChild(warning);
    
    document.getElementById('extend-session').addEventListener('click', function() {
      warning.remove();
      resetTimeout();
      announce('Session extended. You can continue working.');
    });

    // Auto-logout after 2 minutes if no action
    setTimeout(function() {
      if (document.body.contains(warning)) {
        // In a real app, this would log out the user
        announce('Session expired due to inactivity');
        warning.remove();
      }
    }, WARNING_DURATION);
  }

  // Reset timeout on user activity
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(function(event) {
    document.addEventListener(event, resetTimeout);
  });

  // Start initial timeout
  resetTimeout();

  // ============================================
  // ARIA LIVE REGION ANNOUNCER
  // ============================================
  window.announce = function(message, priority) {
    priority = priority || 'polite';
    
    let announcer = document.getElementById('aria-live-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'aria-live-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }
    
    // Clear previous announcement
    announcer.textContent = '';
    
    // Add new announcement (slight delay ensures screen reader picks it up)
    setTimeout(function() {
      announcer.textContent = message;
    }, 100);

    // Log to console for debugging
    console.log('[Accessibility] Announced:', message);
  };

  // ============================================
  // FOCUS MANAGEMENT FOR MODALS
  // ============================================
  function enhanceModalAccessibility() {
    const modals = document.querySelectorAll('[role="dialog"], .modal');
    
    modals.forEach(function(modal) {
      const openButton = document.querySelector('[data-opens="' + modal.id + '"]');
      let previouslyFocused = null;
      
      // Trap focus within modal when open
      modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeModal(modal);
          return;
        }
        
        if (e.key === 'Tab') {
          trapFocus(modal, e);
        }
      });

      // Store previously focused element
      if (openButton) {
        openButton.addEventListener('click', function() {
          previouslyFocused = document.activeElement;
        });
      }

      // Return focus when modal closes
      const closeButtons = modal.querySelectorAll('[data-closes], .modal-close');
      closeButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          closeModal(modal);
        });
      });

      function closeModal(modal) {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        if (previouslyFocused) {
          previouslyFocused.focus();
        }
        announce('Dialog closed');
      }
    });
  }

  function trapFocus(container, e) {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  }

  // Initialize modal enhancements
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceModalAccessibility);
  } else {
    enhanceModalAccessibility();
  }

  // ============================================
  // KEYBOARD SHORTCUTS PANEL
  // ============================================
  const keyboardShortcutsBtn = document.getElementById('keyboard-shortcuts-btn');
  
  if (keyboardShortcutsBtn) {
    keyboardShortcutsBtn.addEventListener('click', function() {
      const panel = document.createElement('div');
      panel.className = 'shortcuts-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-labelledby', 'shortcuts-title');
      panel.innerHTML = `
        <div class="shortcuts-content">
          <h2 id="shortcuts-title">⌨️ Keyboard Shortcuts</h2>
          <button class="close-shortcuts" aria-label="Close shortcuts panel">×</button>
          <dl>
            <dt>Alt + B</dt>
            <dd>Take a break (5-minute timer)</dd>
            
            <dt>Alt + P</dt>
            <dd>Toggle pain flare mode</dd>
            
            <dt>Alt + O</dt>
            <dd>Toggle overwhelmed mode</dd>
            
            <dt>Alt + S</dt>
            <dd>Reset energy counter</dd>
            
            <dt>Tab</dt>
            <dd>Move to next interactive element</dd>
            
            <dt>Shift + Tab</dt>
            <dd>Move to previous interactive element</dd>
            
            <dt>Enter / Space</dt>
            <dd>Activate buttons and links</dd>
            
            <dt>Escape</dt>
            <dd>Close modals and dialogs</dd>
            
            <dt>Arrow keys</dt>
            <dd>Navigate through menus and lists</dd>
          </dl>
        </div>
      `;
      
      document.body.appendChild(panel);
      panel.querySelector('.close-shortcuts').focus();
      
      panel.querySelector('.close-shortcuts').addEventListener('click', function() {
        panel.remove();
        keyboardShortcutsBtn.focus();
      });
      
      panel.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          panel.remove();
          keyboardShortcutsBtn.focus();
        }
      });
    });
  }

  // Show keyboard shortcuts hint on first visit
  if (!localStorage.getItem('keyboardShortcutsHintShown')) {
    setTimeout(function() {
      announce('Press Alt + B for break mode, Alt + P for pain flare mode, Alt + O for overwhelmed mode');
      localStorage.setItem('keyboardShortcutsHintShown', 'true');
    }, 5000);
  }

  // ============================================
  // EMERGENCY MODE TOGGLE
  // ============================================
  window.toggleEmergencyMode = function() {
    const isEmergency = document.body.getAttribute('data-emergency') === 'true';
    
    if (!isEmergency) {
      document.body.setAttribute('data-emergency', 'true');
      announce('Emergency mode activated', 'assertive');
    } else {
      document.body.removeAttribute('data-emergency');
      announce('Emergency mode deactivated');
    }
  };

  console.log('✅ WCAG 2.2 AA+ Compliance Features Loaded');
  console.log('Dyslexia fonts, reading guides, bionic reading, line focus, voice labels, enhanced forms, and more');

})();
