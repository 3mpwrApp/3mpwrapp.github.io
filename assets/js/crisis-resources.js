// Crisis Resources Page Interactivity

(function() {
  'use strict';

  // Initialize all features
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    initializeCopyButtons();
    enhanceImportantInfo();
    addQuickDialFeatures();
    trackCrisisLineClicks();

    console.log('Crisis Resources page initialized');
  }

  // Enhanced copy functionality for phone numbers
  function initializeCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const numberToCopy = this.getAttribute('data-copy');
        
        try {
          await navigator.clipboard.writeText(numberToCopy);
          
          // Visual feedback
          const originalText = this.textContent;
          const originalBg = this.style.backgroundColor;
          
          this.textContent = '✓ Copied!';
          this.classList.add('copied');
          
          // Announce to screen readers
          announceToScreenReader(`Phone number ${numberToCopy} copied to clipboard`);
          
          setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove('copied');
          }, 2500);
          
        } catch (err) {
          console.error('Failed to copy:', err);
          this.textContent = '✗ Failed';
          
          setTimeout(() => {
            this.textContent = '📋 Copy';
          }, 2000);
          
          announceToScreenReader('Copy failed. Please try manually selecting the number.');
        }
      });
    });
  }

  // Convert "Important Information" section to styled box
  function enhanceImportantInfo() {
    const headers = document.querySelectorAll('h2');
    let targetHeader = null;

    headers.forEach(header => {
      if (header.textContent.includes('Important Information')) {
        targetHeader = header;
      }
    });

    if (!targetHeader) return;

    // Create container
    const container = document.createElement('div');
    container.className = 'important-info';

    // Move header into container
    const newHeader = targetHeader.cloneNode(true);
    container.appendChild(newHeader);

    // Move content until next h2 or hr
    let currentElement = targetHeader.nextElementSibling;
    const elementsToMove = [];

    while (currentElement && !['H2', 'HR'].includes(currentElement.tagName)) {
      elementsToMove.push(currentElement);
      currentElement = currentElement.nextElementSibling;
    }

    elementsToMove.forEach(el => {
      container.appendChild(el);
    });

    // Replace original header with container
    targetHeader.parentNode.replaceChild(container, targetHeader);
  }

  // Add quick-dial features to phone links
  function addQuickDialFeatures() {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      const phoneNumber = link.getAttribute('href').replace('tel:', '');
      link.setAttribute('aria-label', `Call ${phoneNumber}`);
      link.classList.add('phone-link');

      // Add click tracking
      link.addEventListener('click', function() {
        console.log('Crisis line called:', phoneNumber);
        
        // Optional: Send to analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'crisis_line_call', {
            'event_category': 'Crisis Resources',
            'event_label': phoneNumber,
            'value': 1
          });
        }
      });
    });
  }

  // Track crisis line interactions for analytics
  function trackCrisisLineClicks() {
    // Track main crisis alert clicks
    const crisisAlert = document.querySelector('.crisis-alert');
    if (crisisAlert) {
      crisisAlert.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
          const linkText = this.textContent.trim();
          console.log('Crisis alert link clicked:', linkText);
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'crisis_alert_click', {
              'event_category': 'Crisis Resources',
              'event_label': linkText,
              'value': 10
            });
          }
        });
      });
    }

    // Track service card interactions
    document.querySelectorAll('.service-card').forEach(card => {
      const serviceName = card.querySelector('h3')?.textContent || 'Unknown Service';
      
      card.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
          console.log('Service clicked:', serviceName);
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'service_click', {
              'event_category': 'Crisis Resources',
              'event_label': serviceName,
              'value': 5
            });
          }
        });
      });
    });
  }

  // Announce to screen readers
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Add emergency dial shortcut (Ctrl+E)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      
      const mainCrisisNumber = document.querySelector('.crisis-alert a[href^="tel:"]');
      if (mainCrisisNumber) {
        // Confirm before dialing
        const confirmed = confirm('Dial crisis line (1-833-456-4566)?');
        if (confirmed) {
          mainCrisisNumber.click();
        }
      }
    }
  });

  // Add visual indicator for keyboard shortcut
  window.addEventListener('load', function() {
    const crisisAlert = document.querySelector('.crisis-alert');
    if (crisisAlert) {
      const shortcutHint = document.createElement('p');
      shortcutHint.textContent = 'Keyboard shortcut: Ctrl+E to quick-dial crisis line';
      shortcutHint.style.cssText = `
        margin: 1rem 0 0;
        font-size: 0.85rem;
        opacity: 0.8;
        font-style: italic;
      `;
      crisisAlert.appendChild(shortcutHint);
    }
  });

  // Start initialization
  init();
})();
