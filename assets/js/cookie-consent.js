/**
 * Cookie Consent Banner
 * GDPR-compliant cookie consent implementation
 * Stores user preference in localStorage
 * 
 * @version 1.0.0
 * @license MIT
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'empwrapp-cookie-consent';
  const CONSENT_VERSION = '1.0';
  const ANALYTICS_ENABLED_KEY = 'empwrapp-analytics-enabled';

  /**
   * Check if user has already given consent
   */
  function hasConsent() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      if (data.version !== CONSENT_VERSION) return null;
      
      return data.consent;
    } catch (e) {
      console.error('Cookie consent: Storage error', e);
      return null;
    }
  }

  /**
   * Save user consent preference
   */
  function saveConsent(accepted) {
    try {
      const data = {
        version: CONSENT_VERSION,
        consent: accepted,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(ANALYTICS_ENABLED_KEY, accepted ? 'true' : 'false');
      return true;
    } catch (e) {
      console.error('Cookie consent: Failed to save preference', e);
      return false;
    }
  }

  /**
   * Enable/disable analytics based on consent
   */
  function updateAnalytics(enabled) {
    if (typeof gtag !== 'undefined') {
      // Disable Google Analytics if consent not given
      if (!enabled) {
        gtag('consent', 'update', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied'
        });
      } else {
        gtag('consent', 'update', {
          'analytics_storage': 'granted',
          'ad_storage': 'denied' // Still deny ad storage
        });
      }
    }
  }

  /**
   * Create and show the consent banner
   */
  function showBanner() {
    // Check if banner already exists
    if (document.getElementById('cookie-consent-banner')) return;

    // Create banner HTML
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-consent-title');
    banner.setAttribute('aria-describedby', 'cookie-consent-description');
    banner.setAttribute('aria-live', 'polite');

    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-text">
          <h2 id="cookie-consent-title" class="cookie-consent-title">
            🍪 Cookie Notice
          </h2>
          <p id="cookie-consent-description" class="cookie-consent-description">
            We use essential cookies to make our site work and optional analytics cookies 
            to understand how you use our site. Analytics help us improve your experience. 
            You can accept or decline optional cookies.
            <a href="/privacy/" class="cookie-consent-link">Learn more in our Privacy Policy</a>
          </p>
        </div>
        <div class="cookie-consent-actions">
          <button type="button" id="cookie-consent-accept" class="cookie-consent-btn cookie-consent-accept">
            Accept All
          </button>
          <button type="button" id="cookie-consent-essential" class="cookie-consent-btn cookie-consent-essential">
            Essential Only
          </button>
          <button type="button" id="cookie-consent-manage" class="cookie-consent-btn cookie-consent-manage">
            Manage Preferences
          </button>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(banner);

    // Add event listeners
    const acceptBtn = document.getElementById('cookie-consent-accept');
    const essentialBtn = document.getElementById('cookie-consent-essential');
    const manageBtn = document.getElementById('cookie-consent-manage');

    acceptBtn.addEventListener('click', function() {
      saveConsent(true);
      updateAnalytics(true);
      hideBanner();
      announceToScreenReader('All cookies accepted');
    });

    essentialBtn.addEventListener('click', function() {
      saveConsent(false);
      updateAnalytics(false);
      hideBanner();
      announceToScreenReader('Only essential cookies accepted');
    });

    manageBtn.addEventListener('click', function() {
      window.location.href = '/cookies/';
    });

    // Focus management
    setTimeout(function() {
      acceptBtn.focus();
    }, 100);

    // Keyboard navigation (trap focus within banner)
    banner.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        // Pressing Escape = Essential only (conservative default)
        essentialBtn.click();
      } else if (e.key === 'Tab') {
        trapFocus(e, banner);
      }
    });

    // Show banner with animation
    setTimeout(function() {
      banner.classList.add('cookie-consent-visible');
    }, 100);
  }

  /**
   * Hide and remove the consent banner
   */
  function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (!banner) return;

    banner.classList.remove('cookie-consent-visible');
    setTimeout(function() {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 300);
  }

  /**
   * Trap focus within an element (for accessibility)
   */
  function trapFocus(e, container) {
    const focusable = container.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusable);
    const firstFocusable = focusableArray[0];
    const lastFocusable = focusableArray[focusableArray.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  /**
   * Announce to screen readers
   */
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(function() {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Initialize consent management
   */
  function init() {
    // Check existing consent
    const consent = hasConsent();

    if (consent === null) {
      // No consent stored - show banner
      // Wait for page to load first
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
      } else {
        showBanner();
      }
    } else {
      // Consent already given - apply preference
      updateAnalytics(consent);
    }
  }

  // Initialize on script load
  init();

  // Expose global API for settings page
  window.EmpwrAppCookieConsent = {
    hasConsent: hasConsent,
    saveConsent: saveConsent,
    showBanner: showBanner,
    updateAnalytics: updateAnalytics
  };

})();
