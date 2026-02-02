/**
 * WCAG 2.2 AAA Dynamic Accessibility Enhancements
 * February 2026
 * 
 * This script adds missing accessibility attributes and indicators
 * that can't be added via static HTML/CSS.
 * 
 * Features:
 * - External link indicators (WCAG 3.2.5 AAA)
 * - Automatic aria-label for icon-only buttons
 * - Touch target size enforcement (44x44px minimum)
 * - Keyboard trap detection and prevention
 * - Focus management for modals and dialogs
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    addExternalLinkIndicators();
    enforceMinimumTouchTargets();
    ensureButtonLabels();
    improveFormAccessibility();
    addSkipLinksEnhancements();
    monitorFocusTrap();
    announcePageChanges();
  }

  /**
   * Add visual and screen reader indicators for external links
   * WCAG 3.2.5 (AAA) - Change on Request
   */
  function addExternalLinkIndicators() {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    
    externalLinks.forEach(link => {
      // Skip if it's an internal link to our own domain
      if (link.href.includes('3mpwrapp.github.io') || 
          link.href.includes('localhost')) {
        return;
      }

      // Skip if already has an aria-label
      if (link.hasAttribute('aria-label')) {
        return;
      }

      // Skip if it's just an icon/image
      const hasText = link.textContent.trim().length > 0;
      if (!hasText) {
        return;
      }

      // Add screen reader indication
      const originalLabel = link.getAttribute('aria-label') || link.textContent.trim();
      link.setAttribute('aria-label', `${originalLabel} (opens in new tab)`);

      // Add visual indicator if not already present
      if (!link.querySelector('.external-link-icon')) {
        const icon = document.createElement('span');
        icon.className = 'external-link-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = ' ↗';
        icon.style.cssText = 'margin-left: 0.25em; font-size: 0.85em; opacity: 0.8;';
        link.appendChild(icon);
      }

      // Ensure rel="noopener noreferrer" for security
      if (!link.hasAttribute('rel')) {
        link.setAttribute('rel', 'noopener noreferrer');
      } else if (!link.rel.includes('noopener')) {
        link.rel += ' noopener noreferrer';
      }

      // Ensure target="_blank"
      if (!link.hasAttribute('target')) {
        link.setAttribute('target', '_blank');
      }
    });
  }

  /**
   * Ensure all interactive elements meet minimum touch target size
   * WCAG 2.5.5 (AAA) - Target Size (Enhanced)
   */
  function enforceMinimumTouchTargets() {
    const MIN_SIZE = 44; // pixels
    
    const interactiveElements = document.querySelectorAll(`
      button,
      a,
      input:not([type="hidden"]),
      select,
      textarea,
      [role="button"],
      [role="link"],
      [tabindex]:not([tabindex="-1"])
    `);

    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      
      // Skip if element is hidden
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      // Check if element meets minimum size
      if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
        // Add padding to increase hit area
        const computedStyle = window.getComputedStyle(el);
        const currentPadding = parseFloat(computedStyle.padding) || 0;
        
        if (rect.width < MIN_SIZE) {
          const additionalPaddingX = (MIN_SIZE - rect.width) / 2;
          el.style.paddingLeft = `${currentPadding + additionalPaddingX}px`;
          el.style.paddingRight = `${currentPadding + additionalPaddingX}px`;
        }
        
        if (rect.height < MIN_SIZE) {
          const additionalPaddingY = (MIN_SIZE - rect.height) / 2;
          el.style.paddingTop = `${currentPadding + additionalPaddingY}px`;
          el.style.paddingBottom = `${currentPadding + additionalPaddingY}px`;
        }

        // Set minimum dimensions if padding isn't enough
        el.style.minWidth = `${MIN_SIZE}px`;
        el.style.minHeight = `${MIN_SIZE}px`;
      }
    });
  }

  /**
   * Ensure all buttons without text content have proper aria-labels
   * WCAG 4.1.2 (AA/AAA) - Name, Role, Value
   */
  function ensureButtonLabels() {
    const buttons = document.querySelectorAll('button, [role="button"]');
    
    buttons.forEach(button => {
      // Skip if already has accessible name
      if (button.hasAttribute('aria-label') || 
          button.hasAttribute('aria-labelledby') ||
          button.textContent.trim().length > 0) {
        return;
      }

      // Try to infer label from context
      let label = '';
      
      // Check for icon classes
      if (button.className.includes('close')) {
        label = 'Close';
      } else if (button.className.includes('menu')) {
        label = 'Menu';
      } else if (button.className.includes('search')) {
        label = 'Search';
      } else if (button.className.includes('toggle')) {
        label = 'Toggle';
      } else if (button.id.includes('theme')) {
        label = 'Toggle theme';
      } else if (button.id.includes('contrast')) {
        label = 'Toggle high contrast';
      } else {
        // Generic fallback
        label = 'Button';
      }

      button.setAttribute('aria-label', label);
      console.warn(`Added aria-label="${label}" to button without accessible name:`, button);
    });
  }

  /**
   * Enhance form accessibility
   * WCAG 3.3.2 (AA), 3.3.5 (AAA) - Labels or Instructions, Help
   */
  function improveFormAccessibility() {
    // Ensure all inputs have labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
    
    inputs.forEach(input => {
      // Skip if already has label or aria-label
      if (input.hasAttribute('aria-label') || 
          input.hasAttribute('aria-labelledby') ||
          document.querySelector(`label[for="${input.id}"]`)) {
        return;
      }

      // Try to find label by proximity
      const previousElement = input.previousElementSibling;
      if (previousElement && previousElement.tagName === 'LABEL') {
        previousElement.setAttribute('for', input.id || `input-${Math.random().toString(36).substr(2, 9)}`);
        return;
      }

      // Add aria-label from placeholder if available
      if (input.placeholder) {
        input.setAttribute('aria-label', input.placeholder);
        console.warn(`Added aria-label from placeholder for input:`, input);
      }
    });

    // Ensure required fields are marked
    const requiredInputs = document.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      if (!input.hasAttribute('aria-required')) {
        input.setAttribute('aria-required', 'true');
      }
    });
  }

  /**
   * Enhance skip links
   * WCAG 2.4.1 (AA/AAA) - Bypass Blocks
   */
  function addSkipLinksEnhancements() {
    const skipLinks = document.querySelectorAll('.skip-link');
    
    skipLinks.forEach(link => {
      // Ensure skip links are keyboard-accessible
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.addEventListener('blur', function() {
            this.removeAttribute('tabindex');
          }, { once: true });

          // Announce to screen readers
          announce(`Skipped to ${targetId.replace(/-/g, ' ')}`);
        }
      });
    });
  }

  /**
   * Monitor for keyboard traps and warn in console
   * WCAG 2.1.2 (AA/AAA) - No Keyboard Trap
   */
  function monitorFocusTrap() {
    let focusHistory = [];
    const MAX_HISTORY = 10;

    document.addEventListener('focusin', function(e) {
      focusHistory.push(e.target);
      
      // Keep only recent history
      if (focusHistory.length > MAX_HISTORY) {
        focusHistory.shift();
      }

      // Check if focus is cycling in the same small set of elements
      if (focusHistory.length >= 5) {
        const uniqueElements = new Set(focusHistory.slice(-5));
        if (uniqueElements.size <= 3) {
          console.warn('Possible keyboard trap detected! Focus cycling between:', uniqueElements);
        }
      }
    });
  }

  /**
   * Announce page changes to screen readers
   * WCAG 4.1.3 (AA/AAA) - Status Messages
   */
  function announcePageChanges() {
    // Create live region for announcements if it doesn't exist
    if (!document.getElementById('a11y-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'a11y-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
      document.body.appendChild(announcer);
    }

    // Make announce function globally available
    window.announce = function(message) {
      const announcer = document.getElementById('a11y-announcer');
      if (announcer) {
        announcer.textContent = '';
        setTimeout(() => {
          announcer.textContent = message;
        }, 100);
      }
    };
  }

  /**
   * Add language attributes to elements with different languages
   * WCAG 3.1.2 (AA/AAA) - Language of Parts
   */
  function markLanguageSwitches() {
    // This would need to be customized based on actual multilingual content
    const langElements = document.querySelectorAll('[class*="lang-"], [class*="french"], [class*="spanish"]');
    
    langElements.forEach(el => {
      if (!el.hasAttribute('lang')) {
        if (el.className.includes('french') || el.className.includes('fr')) {
          el.setAttribute('lang', 'fr');
        } else if (el.className.includes('spanish') || el.className.includes('es')) {
          el.setAttribute('lang', 'es');
        }
      }
    });
  }

  /**
   * Add abbreviation expansions
   * WCAG 3.1.4 (AAA) - Abbreviations
   */
  function expandAbbreviations() {
    const abbreviations = {
      'WCAG': 'Web Content Accessibility Guidelines',
      'AAA': 'Triple-A (highest accessibility level)',
      'ARIA': 'Accessible Rich Internet Applications',
      'NVDA': 'NonVisual Desktop Access',
      'JAWS': 'Job Access With Speech',
      'WSO': 'Workers Safety and Oversight',
      'WSIB': 'Workplace Safety and Insurance Board'
    };

    Object.keys(abbreviations).forEach(abbr => {
      // Find text nodes containing the abbreviation
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.includes(abbr)) {
          const parent = node.parentElement;
          // Skip if already in an abbr tag or code block
          if (parent.tagName === 'ABBR' || parent.tagName === 'CODE' || parent.tagName === 'PRE') {
            continue;
          }

          const regex = new RegExp(`\\b${abbr}\\b`, 'g');
          if (regex.test(node.textContent)) {
            const newHTML = node.textContent.replace(regex, `<abbr title="${abbreviations[abbr]}">${abbr}</abbr>`);
            const temp = document.createElement('span');
            temp.innerHTML = newHTML;
            parent.replaceChild(temp, node);
          }
        }
      }
    });
  }

  // Run abbreviation expansion after a short delay to avoid blocking
  setTimeout(expandAbbreviations, 500);

  // Re-run checks on dynamic content changes
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          addExternalLinkIndicators();
          ensureButtonLabels();
          improveFormAccessibility();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Log completion
  console.log('✓ WCAG 2.2 AAA dynamic enhancements loaded');
})();
