// Accessibility Statement Page Interactivity

(function() {
  'use strict';

  // Initialize all features
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    animateComplianceBadge();
    addAccordionEnhancements();
    trackComplianceClicks();

    console.log('Accessibility Statement page initialized');
  }

  // Animate compliance badge on scroll
  function animateComplianceBadge() {
    const badge = document.querySelector('.compliance-badge');
    if (!badge) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInScale 0.8s ease forwards';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });

    observer.observe(badge);

    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Enhanced accordion functionality
  function addAccordionEnhancements() {
    // Add expand/collapse all button for WCAG criteria sections
    const firstDetail = document.querySelector('details');
    if (!firstDetail) return;

    // Find the parent section
    let detailsParent = firstDetail.parentElement;
    while (detailsParent && !['H2', 'H3', 'H4'].includes(detailsParent.previousElementSibling?.tagName)) {
      detailsParent = detailsParent.parentElement;
    }

    if (!detailsParent) return;

    // Insert toggle button before first details
    const toggleContainer = document.createElement('div');
    toggleContainer.style.cssText = 'margin: 1rem 0; text-align: center;';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Expand All WCAG Criteria';
    toggleButton.className = 'wcag-toggle-btn';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.style.cssText = `
      background: linear-gradient(135deg, #0066CC 0%, #4DB8FF 100%);
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
    `;

    toggleButton.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 6px 16px rgba(0, 102, 204, 0.4)';
    });

    toggleButton.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.3)';
    });

    let allExpanded = false;

    toggleButton.addEventListener('click', function() {
      const allDetails = document.querySelectorAll('details');
      allExpanded = !allExpanded;

      allDetails.forEach(detail => {
        detail.open = allExpanded;
      });

      this.textContent = allExpanded ? 'Collapse All WCAG Criteria' : 'Expand All WCAG Criteria';
      this.setAttribute('aria-expanded', allExpanded);

      announceToScreenReader(
        allExpanded ? 'All WCAG criteria sections expanded' : 'All WCAG criteria sections collapsed'
      );
    });

    toggleContainer.appendChild(toggleButton);
    firstDetail.parentNode.insertBefore(toggleContainer, firstDetail);
  }

  // Track compliance-related clicks
  function trackComplianceClicks() {
    // Track report link clicks
    document.querySelectorAll('.report-link').forEach(link => {
      link.addEventListener('click', function() {
        console.log('Accessibility report link clicked');
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'view_accessibility_report', {
            'event_category': 'Accessibility',
            'event_label': 'Full Report',
            'value': 1
          });
        }
      });
    });

    // Track resource link clicks
    document.querySelectorAll('.resource-link').forEach(link => {
      link.addEventListener('click', function() {
        const linkText = this.querySelector('.link-text')?.textContent || 'Unknown';
        console.log('Resource link clicked:', linkText);
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'accessibility_resource_click', {
            'event_category': 'Accessibility',
            'event_label': linkText,
            'value': 1
          });
        }
      });
    });

    // Track WCAG accordion opens
    document.querySelectorAll('details').forEach(detail => {
      detail.addEventListener('toggle', function() {
        if (this.open) {
          const summary = this.querySelector('summary')?.textContent || 'Unknown section';
          console.log('WCAG section opened:', summary);
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'wcag_section_open', {
              'event_category': 'Accessibility',
              'event_label': summary,
              'value': 1
            });
          }
        }
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

  // Add keyboard shortcut (Ctrl+A) to jump to accessibility settings
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.shiftKey) {
      e.preventDefault();
      
      const settingsLink = document.querySelector('a[href*="accessibility-settings"]');
      if (settingsLink) {
        const confirmed = confirm('Navigate to Accessibility Settings page?');
        if (confirmed) {
          window.location.href = settingsLink.href;
        }
      }
    }
  });

  // Start initialization
  init();
})();
