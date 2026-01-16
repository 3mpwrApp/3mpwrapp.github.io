/* ================================================
   Accessibility Toolbar - Full Functionality
   ================================================ */

(function() {
  'use strict';
  
  // State
  let textSize = 100;
  let lineSpacing = 'normal';
  let dyslexiaFont = false;
  let readingMask = false;
  let colorFilter = 'none';
  let spoonCount = 5;
  let emergencyMode = false;
  let breakInterval = 0;
  let breakTimer = null;
  let lastBreakTime = Date.now();
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToolbar);
  } else {
    initToolbar();
  }
  
  function initToolbar() {
    const toolbar = document.querySelector('.accessibility-toolbar');
    const toggleBtn = document.getElementById('toolbarToggle');
    const toolbarContent = document.getElementById('toolbar-content');
    
    if (!toolbar || !toggleBtn || !toolbarContent) {
      return; // Toolbar not present on this page
    }
    
    // Load saved preferences
    loadPreferences();
    
    // Check if user wants toolbar expanded
    const isExpanded = localStorage.getItem('toolbarExpanded') !== 'false'; // Default to expanded
    
    // Set initial state
    if (isExpanded) {
      expandToolbar();
    } else {
      collapseToolbar();
    }
    
    // Toggle on button click
    toggleBtn.addEventListener('click', function() {
      const currentlyExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      
      if (currentlyExpanded) {
        collapseToolbar();
      } else {
        expandToolbar();
      }
    });
    
    // Keyboard support - Space and Enter should toggle
    toggleBtn.addEventListener('keydown', function(e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleBtn.click();
      }
    });
    
    // Setup all toolbar controls
    setupSpoonCounter();
    setupEmergencySimplify();
    setupBreakReminders();
    setupTextSizeControls();
    setupLineSpacingControls();
    setupDyslexiaToggle();
    setupReadingMask();
    setupColorFilters();
    
    function expandToolbar() {
      toolbar.classList.remove('collapsed');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toolbarContent.hidden = false;
      localStorage.setItem('toolbarExpanded', 'true');
      announceToScreenReader('Accessibility tools expanded');
    }
    
    function collapseToolbar() {
      toolbar.classList.add('collapsed');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toolbarContent.hidden = true;
      localStorage.setItem('toolbarExpanded', 'false');
      announceToScreenReader('Accessibility tools collapsed');
    }
  }
  
  // ============================================================================
  // INNOVATIVE FEATURES - Never Been Done Before
  // ============================================================================
  
  // Spoon Counter (Chronic Illness Energy Management)
  function setupSpoonCounter() {
    const useBtn = document.getElementById('spoon-use');
    const restBtn = document.getElementById('spoon-rest');
    const resetBtn = document.getElementById('spoon-reset');
    const display = document.querySelector('.spoon-display');
    const countEl = document.getElementById('spoon-count');
    
    if (!useBtn || !restBtn || !resetBtn) return;
    
    useBtn.addEventListener('click', function() {
      if (spoonCount > 0) {
        spoonCount--;
        updateSpoonDisplay();
        announceToScreenReader(`Energy used. ${spoonCount} spoons remaining`);
        
        // Suggest break if low energy
        if (spoonCount === 1) {
          announceToScreenReader('Warning: Low energy. Consider taking a break.');
        } else if (spoonCount === 0) {
          announceToScreenReader('No energy remaining. Please rest.');
        }
      }
    });
    
    restBtn.addEventListener('click', function() {
      if (spoonCount < 10) {
        spoonCount++;
        updateSpoonDisplay();
        announceToScreenReader(`Rested. ${spoonCount} spoons available`);
      }
    });
    
    resetBtn.addEventListener('click', function() {
      spoonCount = 5;
      updateSpoonDisplay();
      announceToScreenReader('Spoon counter reset to 5');
    });
    
    function updateSpoonDisplay() {
      if (countEl) {
        countEl.textContent = spoonCount;
      }
      
      if (display) {
        if (spoonCount <= 1) {
          display.classList.add('low-energy');
        } else {
          display.classList.remove('low-energy');
        }
      }
      
      localStorage.setItem('spoonCount', spoonCount);
    }
    
    // Load saved count
    spoonCount = parseInt(localStorage.getItem('spoonCount')) || 5;
    updateSpoonDisplay();
  }
  
  // Emergency Simplify (Bad Day Mode)
  function setupEmergencySimplify() {
    const btn = document.getElementById('emergency-simplify');
    if (!btn) return;
    
    btn.addEventListener('click', function() {
      emergencyMode = !emergencyMode;
      applyEmergencyMode();
      btn.setAttribute('aria-pressed', emergencyMode);
      
      if (emergencyMode) {
        announceToScreenReader('Emergency simplification activated. Page simplified for easier reading.', 'assertive');
      } else {
        announceToScreenReader('Emergency mode deactivated. Full page restored.');
      }
    });
  }
  
  function applyEmergencyMode() {
    if (emergencyMode) {
      document.body.classList.add('emergency-mode');
    } else {
      document.body.classList.remove('emergency-mode');
    }
    localStorage.setItem('emergencyMode', emergencyMode);
  }
  
  // Break Reminders
  function setupBreakReminders() {
    const select = document.getElementById('break-interval');
    const statusEl = document.getElementById('break-status');
    
    if (!select) return;
    
    select.addEventListener('change', function() {
      breakInterval = parseInt(this.value);
      updateBreakReminder();
      localStorage.setItem('breakInterval', breakInterval);
      
      if (breakInterval > 0) {
        announceToScreenReader(`Break reminders set to every ${breakInterval} minutes`);
      } else {
        announceToScreenReader('Break reminders disabled');
      }
    });
    
    function updateBreakReminder() {
      if (breakTimer) {
        clearInterval(breakTimer);
        breakTimer = null;
      }
      
      if (breakInterval > 0) {
        const ms = breakInterval * 60 * 1000;
        lastBreakTime = Date.now();
        
        if (statusEl) {
          updateBreakStatus();
          setInterval(updateBreakStatus, 60000); // Update every minute
        }
        
        breakTimer = setInterval(showBreakReminder, ms);
      } else {
        if (statusEl) {
          statusEl.textContent = 'Break reminders off';
        }
      }
    }
    
    function updateBreakStatus() {
      if (!statusEl || breakInterval === 0) return;
      
      const elapsed = Math.floor((Date.now() - lastBreakTime) / 60000);
      const remaining = breakInterval - elapsed;
      
      if (remaining > 0) {
        statusEl.textContent = `Next break in ${remaining} min`;
      } else {
        statusEl.textContent = 'Break due now';
      }
    }
    
    function showBreakReminder() {
      lastBreakTime = Date.now();
      
      // Create modal
      const overlay = document.createElement('div');
      overlay.className = 'break-reminder-overlay';
      
      const modal = document.createElement('div');
      modal.className = 'break-reminder-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'break-modal-title');
      modal.setAttribute('aria-modal', 'true');
      
      modal.innerHTML = `
        <h2 id="break-modal-title">🌿 Time for a Break</h2>
        <p>You've been focused for ${breakInterval} minutes. Take a moment to rest, stretch, or hydrate.</p>
        <div class="modal-actions">
          <button type="button" id="break-taken" autofocus>I'll Take a Break</button>
          <button type="button" id="break-snooze">Remind Me in 5 min</button>
        </div>
      `;
      
      document.body.appendChild(overlay);
      document.body.appendChild(modal);
      
      // Focus modal
      modal.querySelector('button').focus();
      
      // Announce to screen readers
      announceToScreenReader('Break time reminder. You have been working for ${breakInterval} minutes.', 'assertive');
      
      // Handle buttons
      document.getElementById('break-taken').addEventListener('click', function() {
        overlay.remove();
        modal.remove();
        updateBreakStatus();
        announceToScreenReader('Break acknowledged. Timer reset.');
      });
      
      document.getElementById('break-snooze').addEventListener('click', function() {
        overlay.remove();
        modal.remove();
        setTimeout(showBreakReminder, 5 * 60 * 1000);
        announceToScreenReader('Snoozed for 5 minutes.');
      });
      
      // Close on overlay click
      overlay.addEventListener('click', function() {
        overlay.remove();
        modal.remove();
      });
      
      // Close on Escape
      document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
          overlay.remove();
          modal.remove();
          document.removeEventListener('keydown', handleEscape);
        }
      });
    }
    
    // Load saved preference
    breakInterval = parseInt(localStorage.getItem('breakInterval')) || 0;
    if (select && breakInterval > 0) {
      select.value = breakInterval;
    }
    updateBreakReminder();
  }
  
  // Text Size Controls
  function setupTextSizeControls() {
    const decreaseBtn = document.getElementById('text-decrease');
    const resetBtn = document.getElementById('text-reset');
    const increaseBtn = document.getElementById('text-increase');
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', function() {
        textSize = Math.max(80, textSize - 10);
        applyTextSize();
        announceToScreenReader(`Text size decreased to ${textSize}%`);
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        textSize = 100;
        applyTextSize();
        announceToScreenReader('Text size reset to default');
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', function() {
        textSize = Math.min(150, textSize + 10);
        applyTextSize();
        announceToScreenReader(`Text size increased to ${textSize}%`);
      });
    }
  }
  
  function applyTextSize() {
    document.documentElement.style.fontSize = textSize + '%';
    localStorage.setItem('textSize', textSize);
  }
  
  // Line Spacing Controls
  function setupLineSpacingControls() {
    const normalBtn = document.getElementById('spacing-normal');
    const looseBtn = document.getElementById('spacing-loose');
    
    if (normalBtn) {
      normalBtn.addEventListener('click', function() {
        lineSpacing = 'normal';
        applyLineSpacing();
        updateLineSpacingButtons();
        announceToScreenReader('Line spacing set to normal');
      });
    }
    
    if (looseBtn) {
      looseBtn.addEventListener('click', function() {
        lineSpacing = 'loose';
        applyLineSpacing();
        updateLineSpacingButtons();
        announceToScreenReader('Line spacing set to loose');
      });
    }
  }
  
  function applyLineSpacing() {
    if (lineSpacing === 'loose') {
      document.body.style.lineHeight = '1.8';
    } else {
      document.body.style.lineHeight = '';
    }
    localStorage.setItem('lineSpacing', lineSpacing);
  }
  
  function updateLineSpacingButtons() {
    const normalBtn = document.getElementById('spacing-normal');
    const looseBtn = document.getElementById('spacing-loose');
    
    if (normalBtn) normalBtn.setAttribute('aria-pressed', lineSpacing === 'normal');
    if (looseBtn) looseBtn.setAttribute('aria-pressed', lineSpacing === 'loose');
  }
  
  // Dyslexia Font Toggle
  function setupDyslexiaToggle() {
    const btn = document.getElementById('dyslexia-toggle');
    if (!btn) return;
    
    btn.addEventListener('click', function() {
      dyslexiaFont = !dyslexiaFont;
      applyDyslexiaFont();
      btn.setAttribute('aria-pressed', dyslexiaFont);
      announceToScreenReader(dyslexiaFont ? 'Dyslexia-friendly font enabled' : 'Dyslexia-friendly font disabled');
    });
  }
  
  function applyDyslexiaFont() {
    if (dyslexiaFont) {
      document.body.classList.add('dyslexia-font-active');
    } else {
      document.body.classList.remove('dyslexia-font-active');
    }
    localStorage.setItem('dyslexiaFont', dyslexiaFont);
  }
  
  // Reading Mask
  function setupReadingMask() {
    const btn = document.getElementById('reading-mask-toggle');
    if (!btn) return;
    
    btn.addEventListener('click', function() {
      readingMask = !readingMask;
      applyReadingMask();
      btn.setAttribute('aria-pressed', readingMask);
      announceToScreenReader(readingMask ? 'Reading mask enabled' : 'Reading mask disabled');
    });
  }
  
  function applyReadingMask() {
    let mask = document.querySelector('.reading-mask');
    
    if (readingMask && !mask) {
      mask = document.createElement('div');
      mask.className = 'reading-mask';
      document.body.appendChild(mask);
      document.body.classList.add('reading-mask-active');
      
      // Update mask position on mouse move
      document.addEventListener('mousemove', updateMaskPosition);
    } else if (!readingMask && mask) {
      mask.remove();
      document.body.classList.remove('reading-mask-active');
      document.removeEventListener('mousemove', updateMaskPosition);
    }
    
    localStorage.setItem('readingMask', readingMask);
  }
  
  function updateMaskPosition(e) {
    const mask = document.querySelector('.reading-mask');
    if (mask) {
      const y = e.clientY;
      mask.style.background = `linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.6) calc(${y}px - 60px),
        transparent calc(${y}px - 30px),
        transparent calc(${y}px + 30px),
        rgba(0, 0, 0, 0.6) calc(${y}px + 60px),
        rgba(0, 0, 0, 0.6) 100%
      )`;
    }
  }
  
  // Color Filters
  function setupColorFilters() {
    const noneBtn = document.getElementById('filter-none');
    const grayscaleBtn = document.getElementById('filter-grayscale');
    const invertBtn = document.getElementById('filter-invert');
    
    if (noneBtn) {
      noneBtn.addEventListener('click', function() {
        colorFilter = 'none';
        applyColorFilter();
        updateColorFilterButtons();
        announceToScreenReader('Color filter removed');
      });
    }
    
    if (grayscaleBtn) {
      grayscaleBtn.addEventListener('click', function() {
        colorFilter = 'grayscale';
        applyColorFilter();
        updateColorFilterButtons();
        announceToScreenReader('Grayscale filter applied');
      });
    }
    
    if (invertBtn) {
      invertBtn.addEventListener('click', function() {
        colorFilter = 'invert';
        applyColorFilter();
        updateColorFilterButtons();
        announceToScreenReader('Colors inverted');
      });
    }
  }
  
  function applyColorFilter() {
    if (colorFilter === 'grayscale') {
      document.documentElement.style.filter = 'grayscale(100%)';
    } else if (colorFilter === 'invert') {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
    } else {
      document.documentElement.style.filter = '';
    }
    localStorage.setItem('colorFilter', colorFilter);
  }
  
  function updateColorFilterButtons() {
    const noneBtn = document.getElementById('filter-none');
    const grayscaleBtn = document.getElementById('filter-grayscale');
    const invertBtn = document.getElementById('filter-invert');
    
    if (noneBtn) noneBtn.setAttribute('aria-pressed', colorFilter === 'none');
    if (grayscaleBtn) grayscaleBtn.setAttribute('aria-pressed', colorFilter === 'grayscale');
    if (invertBtn) invertBtn.setAttribute('aria-pressed', colorFilter === 'invert');
  }
  
  // Load saved preferences
  function loadPreferences() {
    textSize = parseInt(localStorage.getItem('textSize')) || 100;
    lineSpacing = localStorage.getItem('lineSpacing') || 'normal';
    dyslexiaFont = localStorage.getItem('dyslexiaFont') === 'true';
    readingMask = localStorage.getItem('readingMask') === 'true';
    colorFilter = localStorage.getItem('colorFilter') || 'none';
    spoonCount = parseInt(localStorage.getItem('spoonCount')) || 5;
    emergencyMode = localStorage.getItem('emergencyMode') === 'true';
    
    applyTextSize();
    applyLineSpacing();
    applyDyslexiaFont();
    applyReadingMask();
    applyColorFilter();
    applyEmergencyMode();
    
    // Update button states
    setTimeout(function() {
      updateLineSpacingButtons();
      updateColorFilterButtons();
      
      const dyslexiaBtn = document.getElementById('dyslexia-toggle');
      if (dyslexiaBtn) dyslexiaBtn.setAttribute('aria-pressed', dyslexiaFont);
      
      const maskBtn = document.getElementById('reading-mask-toggle');
      if (maskBtn) maskBtn.setAttribute('aria-pressed', readingMask);
      
      const emergencyBtn = document.getElementById('emergency-simplify');
      if (emergencyBtn) emergencyBtn.setAttribute('aria-pressed', emergencyMode);
      
      const spoonDisplay = document.querySelector('.spoon-display');
      const spoonCountEl = document.getElementById('spoon-count');
      if (spoonCountEl) spoonCountEl.textContent = spoonCount;
      if (spoonDisplay && spoonCount <= 1) spoonDisplay.classList.add('low-energy');
    }, 100);
  }
  
  // Helper function to announce changes to screen readers
  function announceToScreenReader(message) {
    const announcer = document.getElementById('toolbar-announcer');
    if (announcer) {
      announcer.textContent = message;
    } else {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.classList.add('sr-only');
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(function() {
        if (announcement.parentNode) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    }
    
    function trackFeatureUsage(featureId) {
      if (!featureId) return;
      
      // Get usage count from localStorage
      const usageKey = 'toolbar_usage_' + featureId;
      const currentCount = parseInt(localStorage.getItem(usageKey) || '0');
      localStorage.setItem(usageKey, (currentCount + 1).toString());
      
      // Optional: Show which features are most used
      console.log('Feature used:', featureId, 'Total uses:', currentCount + 1);
    }
  }
  
})();

/* ================================================
   Smooth Scroll for Skip Links
   ================================================ */

(function() {
  'use strict';
  
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  
  skipLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      // Prevent default jump
      e.preventDefault();
      
      // Smooth scroll to target
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Set focus to target for keyboard users
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
      
      // Update URL without jumping
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  });
  
})();

/* ================================================
   Focus Visible Polyfill (for older browsers)
   ================================================ */

(function() {
  'use strict';
  
  // Check if browser supports :focus-visible
  try {
    document.querySelector(':focus-visible');
  } catch (e) {
    // Add polyfill class
    let hadKeyboardEvent = true;
    let hadFocusVisibleRecently = false;
    let hadFocusVisibleRecentlyTimeout = null;
    
    const inputTypesWhitelist = {
      text: true,
      search: true,
      url: true,
      tel: true,
      email: true,
      password: true,
      number: true,
      date: true,
      month: true,
      week: true,
      time: true,
      datetime: true,
      'datetime-local': true
    };
    
    function onKeyDown(e) {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      hadKeyboardEvent = true;
    }
    
    function onPointerDown() {
      hadKeyboardEvent = false;
    }
    
    function onFocus(e) {
      if (e.target.classList.contains('focus-visible')) {
        return;
      }
      
      if (hadKeyboardEvent || focusTriggersKeyboardModality(e.target)) {
        e.target.classList.add('focus-visible');
        hadFocusVisibleRecently = true;
        clearTimeout(hadFocusVisibleRecentlyTimeout);
        hadFocusVisibleRecentlyTimeout = setTimeout(function() {
          hadFocusVisibleRecently = false;
        }, 100);
      }
    }
    
    function onBlur(e) {
      if (e.target.classList.contains('focus-visible')) {
        e.target.classList.remove('focus-visible');
      }
    }
    
    function focusTriggersKeyboardModality(el) {
      const type = el.type;
      const tagName = el.tagName;
      
      if (tagName === 'INPUT' && inputTypesWhitelist[type] && !el.readOnly) {
        return true;
      }
      
      if (tagName === 'TEXTAREA' && !el.readOnly) {
        return true;
      }
      
      if (el.isContentEditable) {
        return true;
      }
      
      return false;
    }
    
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('focus', onFocus, true);
    document.addEventListener('blur', onBlur, true);
  }
  
})();

/* ================================================
   Accessibility Announcements Helper
   ================================================ */

window.announceToScreenReader = function(message, priority) {
  priority = priority || 'polite'; // 'polite' or 'assertive'
  
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.classList.add('sr-only');
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(function() {
    document.body.removeChild(announcement);
  }, 1000);
};

/* ================================================
   Form Validation Helper
   ================================================ */

(function() {
  'use strict';
  
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      const isValid = validateForm(form);
      
      if (!isValid) {
        e.preventDefault();
        
        // Focus first invalid field
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(function(input) {
      input.addEventListener('blur', function() {
        validateField(input);
      });
    });
  });
  
  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(function(input) {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  function validateField(field) {
    const value = field.value.trim();
    const required = field.hasAttribute('required');
    const type = field.getAttribute('type');
    let isValid = true;
    let errorMessage = '';
    
    // Check required
    if (required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    
    // Check email
    if (type === 'email' && value && !isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
    
    // Check URL
    if (type === 'url' && value && !isValidUrl(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid URL';
    }
    
    // Update ARIA attributes
    field.setAttribute('aria-invalid', isValid ? 'false' : 'true');
    
    // Show/hide error message
    const errorId = field.id + '-error';
    let errorElement = document.getElementById(errorId);
    
    if (!isValid) {
      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.id = errorId;
        errorElement.className = 'error-message';
        errorElement.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorElement);
        field.setAttribute('aria-describedby', errorId);
      }
      errorElement.textContent = errorMessage;
      errorElement.hidden = false;
    } else if (errorElement) {
      errorElement.hidden = true;
    }
    
    return isValid;
  }
  
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
})();

/* ================================================
   Auto-save Form Progress (for long forms)
   ================================================ */

(function() {
  'use strict';
  
  const forms = document.querySelectorAll('form[data-autosave]');
  
  forms.forEach(function(form) {
    const formId = form.id || 'form_' + Math.random().toString(36).substr(2, 9);
    
    // Load saved data
    loadFormData(form, formId);
    
    // Save on input
    form.addEventListener('input', function() {
      saveFormData(form, formId);
    });
    
    // Clear on submit
    form.addEventListener('submit', function() {
      clearFormData(formId);
    });
  });
  
  function saveFormData(form, formId) {
    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(function(input) {
      if (input.type === 'password') return; // Never save passwords
      if (input.name) {
        data[input.name] = input.value;
      }
    });
    
    localStorage.setItem('formData_' + formId, JSON.stringify(data));
    
    // Show autosave indicator
    showAutosaveIndicator();
  }
  
  function loadFormData(form, formId) {
    const savedData = localStorage.getItem('formData_' + formId);
    if (!savedData) return;
    
    try {
      const data = JSON.parse(savedData);
      
      Object.keys(data).forEach(function(name) {
        const input = form.querySelector('[name="' + name + '"]');
        if (input && input.type !== 'password') {
          input.value = data[name];
        }
      });
      
      // Announce restoration
      announceToScreenReader('Form progress restored');
    } catch (e) {
      console.error('Error loading form data:', e);
    }
  }
  
  function clearFormData(formId) {
    localStorage.removeItem('formData_' + formId);
  }
  
  function showAutosaveIndicator() {
    let indicator = document.getElementById('autosave-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'autosave-indicator';
      indicator.className = 'autosave-indicator';
      indicator.textContent = '✓ Saved';
      indicator.setAttribute('role', 'status');
      indicator.setAttribute('aria-live', 'polite');
      document.body.appendChild(indicator);
    }
    
    indicator.classList.add('visible');
    
    setTimeout(function() {
      indicator.classList.remove('visible');
    }, 2000);
  }
  
})();

/* ================================================
   Accessible Modal/Dialog Helper
   ================================================ */

window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Store last focused element
  modal.dataset.lastFocus = document.activeElement.id || '';
  
  // Show modal
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  
  // Trap focus
  trapFocus(modal);
  
  // Focus first focusable element
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) {
    firstFocusable.focus();
  }
  
  // Close on Escape
  document.addEventListener('keydown', handleModalEscape);
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Hide modal
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  
  // Restore focus
  const lastFocusId = modal.dataset.lastFocus;
  if (lastFocusId) {
    const lastFocus = document.getElementById(lastFocusId);
    if (lastFocus) {
      lastFocus.focus();
    }
  }
  
  // Remove escape listener
  document.removeEventListener('keydown', handleModalEscape);
};

function handleModalEscape(e) {
  if (e.key === 'Escape') {
    const openModal = document.querySelector('[role="dialog"]:not([hidden])');
    if (openModal) {
      closeModal(openModal.id);
    }
  }
}

function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
}

console.log('✅ Accessibility enhancements loaded');
