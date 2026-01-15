/**
 * Complexity Mode Toggle
 * Allows users to switch between Simple, Standard, and Detailed content views
 * Respects user preferences via localStorage
 * WCAG 2.2 AAA compliant (reduces cognitive load for users with brain fog, fatigue)
 */

(function() {
  'use strict';

  // Configuration
  const MODES = {
    SIMPLE: 'simple',
    STANDARD: 'standard',
    DETAILED: 'detailed'
  };

  const STORAGE_KEY = 'complexity-mode-preference';
  const DEFAULT_MODE = MODES.STANDARD;

  // State
  let currentMode = DEFAULT_MODE;

  /**
   * Initialize Complexity Mode
   */
  function init() {
    // Load saved preference
    currentMode = loadPreference();
    
    // Apply mode to page
    applyMode(currentMode, false);
    
    // Setup toggle button
    setupToggleButton();
    
    // Announce to screen readers
    announceMode(currentMode, true);
  }

  /**
   * Load user preference from localStorage
   */
  function loadPreference() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && Object.values(MODES).includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not load complexity mode preference:', e);
    }
    return DEFAULT_MODE;
  }

  /**
   * Save user preference to localStorage
   */
  function savePreference(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Could not save complexity mode preference:', e);
    }
  }

  /**
   * Apply complexity mode to page
   */
  function applyMode(mode, announce = true) {
    currentMode = mode;
    
    // Update body class
    document.body.classList.remove(
      `complexity-${MODES.SIMPLE}`,
      `complexity-${MODES.STANDARD}`,
      `complexity-${MODES.DETAILED}`
    );
    document.body.classList.add(`complexity-${mode}`);
    
    // Update toggle button state
    updateToggleButton(mode);
    
    // Show/hide content based on mode
    toggleContent(mode);
    
    // Save preference
    savePreference(mode);
    
    // Announce change
    if (announce) {
      announceMode(mode, false);
    }
  }

  /**
   * Toggle content visibility based on mode
   */
  function toggleContent(mode) {
    // Simple mode: Hide detailed content, show summaries
    const detailedElements = document.querySelectorAll('.content-detailed, [data-complexity="detailed"]');
    const simpleElements = document.querySelectorAll('.content-simple, [data-complexity="simple"]');
    const standardElements = document.querySelectorAll('.content-standard, [data-complexity="standard"]');
    
    detailedElements.forEach(el => {
      el.hidden = (mode === MODES.SIMPLE);
      el.setAttribute('aria-hidden', mode === MODES.SIMPLE);
    });
    
    simpleElements.forEach(el => {
      el.hidden = (mode !== MODES.SIMPLE);
      el.setAttribute('aria-hidden', mode !== MODES.SIMPLE);
    });
    
    // Standard mode shows both simple and some detailed
    if (mode === MODES.STANDARD) {
      // Collapse detailed sections by default
      const detailsElements = document.querySelectorAll('details.auto-collapse');
      detailsElements.forEach(details => {
        details.removeAttribute('open');
      });
    } else if (mode === MODES.DETAILED) {
      // Expand everything in detailed mode
      const detailsElements = document.querySelectorAll('details.auto-collapse');
      detailsElements.forEach(details => {
        details.setAttribute('open', '');
      });
    }
  }

  /**
   * Setup toggle button
   */
  function setupToggleButton() {
    const button = document.getElementById('complexity-toggle');
    if (!button) {
      console.warn('Complexity toggle button not found');
      return;
    }
    
    button.addEventListener('click', cycleMode);
    updateToggleButton(currentMode);
  }

  /**
   * Update toggle button text and state
   */
  function updateToggleButton(mode) {
    const button = document.getElementById('complexity-toggle');
    if (!button) return;
    
    const modeLabels = {
      [MODES.SIMPLE]: 'Simple Language',
      [MODES.STANDARD]: 'Standard View',
      [MODES.DETAILED]: 'Detailed View'
    };
    
    const modeIcons = {
      [MODES.SIMPLE]: '📝',
      [MODES.STANDARD]: '📖',
      [MODES.DETAILED]: '🔬'
    };
    
    const nextMode = getNextMode(mode);
    const nextLabel = modeLabels[nextMode];
    
    button.innerHTML = `
      <span class="complexity-icon" aria-hidden="true">${modeIcons[mode]}</span>
      <span class="complexity-label">${modeLabels[mode]}</span>
      <span class="complexity-hint">Click for ${nextLabel}</span>
    `;
    
    button.setAttribute('aria-label', `Content view: ${modeLabels[mode]}. Click to switch to ${nextLabel}`);
  }

  /**
   * Cycle to next mode
   */
  function cycleMode() {
    const nextMode = getNextMode(currentMode);
    applyMode(nextMode, true);
  }

  /**
   * Get next mode in cycle
   */
  function getNextMode(currentMode) {
    const cycle = [MODES.SIMPLE, MODES.STANDARD, MODES.DETAILED];
    const currentIndex = cycle.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % cycle.length;
    return cycle[nextIndex];
  }

  /**
   * Announce mode change to screen readers
   */
  function announceMode(mode, isInitial) {
    const announcer = document.getElementById('complexity-announcer');
    if (!announcer) return;
    
    const messages = {
      [MODES.SIMPLE]: isInitial 
        ? 'Simple language mode active. Content simplified for easier reading.'
        : 'Switched to simple language mode. Less detail, easier reading.',
      [MODES.STANDARD]: isInitial
        ? 'Standard view active. Balanced content with expandable details.'
        : 'Switched to standard view. Balanced detail level.',
      [MODES.DETAILED]: isInitial
        ? 'Detailed view active. Full comprehensive information displayed.'
        : 'Switched to detailed view. All information expanded.'
    };
    
    announcer.textContent = messages[mode];
  }

  /**
   * Keyboard shortcuts
   */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Alt+C to cycle complexity mode
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        cycleMode();
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Expose for external access if needed
  window.ComplexityMode = {
    setMode: applyMode,
    getMode: () => currentMode,
    MODES: MODES
  };
})();
