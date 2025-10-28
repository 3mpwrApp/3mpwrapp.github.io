/**
 * Skip Link Focus Management
 * Ensures skip links properly move focus to their target elements
 * for improved keyboard navigation accessibility
 * 
 * @version 1.0.0
 */

(function() {
  'use strict';

  /**
   * Focus a target element and ensure it can receive focus
   */
  function focusTarget(target) {
    if (!target) return;
    
    // Ensure element can be programmatically focused
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    
    // Focus with small delay to ensure DOM is ready
    setTimeout(function() {
      try {
        target.focus();
      } catch(e) {
        console.warn('Skip link: Could not focus target', e);
      }
    }, 0);
  }

  /**
   * Initialize skip link functionality
   */
  function init() {
    // Find all skip links (anchor links starting with #)
    var links = document.querySelectorAll('.skip-link[href^="#"]');
    
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        
        if (target) {
          focusTarget(target);
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
