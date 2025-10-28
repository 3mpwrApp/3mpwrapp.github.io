/**
 * Mobile Menu Toggle
 * Accessible mobile navigation with keyboard support and focus management
 * 
 * Features:
 * - Toggle menu open/close
 * - ESC key to close
 * - Focus trap when open
 * - Focus management
 * - ARIA attributes
 * 
 * @version 1.0.0
 */

(function() {
  'use strict';

  /**
   * Set menu open/closed state
   */
  function setOpen(toggle, nav, open) {
    nav.classList.toggle('is-open', !!open);
    toggle.setAttribute('aria-expanded', !!open);
    
    if (open) {
      // Move focus to first nav link
      var first = nav.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      if (first && first.focus) {
        first.focus();
      }
    } else {
      // Return focus to toggle
      if (toggle && toggle.focus) {
        toggle.focus();
      }
    }
  }

  /**
   * Trap focus within navigation when open
   */
  function trapFocus(e, nav) {
    var focusables = nav.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    // Filter to only visible elements
    focusables = Array.prototype.filter.call(focusables, function(el) {
      return el.offsetParent !== null;
    });
    
    if (focusables.length === 0) return;
    
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    var active = document.activeElement;
    
    if (e.shiftKey && (active === first || !nav.contains(active))) {
      // Shift+Tab on first element or outside - focus last
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !nav.contains(active))) {
      // Tab on last element or outside - focus first
      e.preventDefault();
      first.focus();
    }
  }

  /**
   * Initialize mobile menu
   */
  function init() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.getElementById('primary-nav');
    
    if (!toggle || !nav) return;
    
    // Toggle button click
    toggle.addEventListener('click', function() {
      var open = nav.classList.contains('is-open');
      setOpen(toggle, nav, !open);
    });
    
    // Close on ESC when open
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(toggle, nav, false);
      }
    });
    
    // Focus trap within nav when open
    document.addEventListener('keydown', function(e) {
      if (!nav.classList.contains('is-open') || e.key !== 'Tab') return;
      trapFocus(e, nav);
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(toggle, nav, false);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
