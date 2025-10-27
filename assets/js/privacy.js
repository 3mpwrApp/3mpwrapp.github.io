// Privacy Policy Page Interactivity

(function() {
  'use strict';

  // Initialize all features
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    enhanceTLDRBox();
    addReadingProgress();
    trackPrivacyInteractions();

    console.log('Privacy Policy page initialized');
  }

  // Enhance TL;DR box animations
  function enhanceTLDRBox() {
    const tldrBox = document.querySelector('.tldr-box');
    if (!tldrBox) return;

    // Add open/close tracking
    tldrBox.addEventListener('toggle', function() {
      if (this.open) {
        console.log('TL;DR expanded');
        
        // Animate items
        const items = this.querySelectorAll('.tldr-item');
        items.forEach((item, index) => {
          item.style.animation = `fadeInUp 0.4s ease ${index * 0.1}s forwards`;
          item.style.opacity = '0';
        });

        // Add animation CSS
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `;
        if (!document.querySelector('style[data-tldr-anim]')) {
          style.setAttribute('data-tldr-anim', 'true');
          document.head.appendChild(style);
        }
      }
    });
  }

  // Add reading progress indicator
  function addReadingProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-label', 'Reading progress');
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 4px;
      background: linear-gradient(90deg, #0066CC 0%, #4DB8FF 100%);
      z-index: 9999;
      transition: width 0.1s ease;
    `;

    document.body.appendChild(progressBar);

    // Update progress on scroll
    function updateProgress() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

      progressBar.style.width = Math.min(scrollPercent, 100) + '%';
      progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();
  }

  // Track privacy-related interactions
  function trackPrivacyInteractions() {
    // Track privacy mode link clicks
    document.querySelectorAll('.privacy-link').forEach(link => {
      link.addEventListener('click', function() {
        console.log('Privacy mode link clicked');
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'privacy_mode_learn_more', {
            'event_category': 'Privacy',
            'event_label': 'Learn More',
            'value': 1
          });
        }
      });
    });

    // Track format downloads
    document.querySelectorAll('.format-link').forEach(link => {
      link.addEventListener('click', function() {
        const format = this.textContent.trim();
        console.log('Privacy policy format requested:', format);
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'privacy_policy_format', {
            'event_category': 'Privacy',
            'event_label': format,
            'value': 1
          });
        }
      });
    });

    // Track crisis resources clicks
    const crisisLinks = document.querySelectorAll('.crisis-resources a');
    crisisLinks.forEach(link => {
      link.addEventListener('click', function() {
        const linkText = this.textContent.trim();
        console.log('Crisis resources link clicked from privacy page:', linkText);
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'crisis_link_privacy_page', {
            'event_category': 'Privacy',
            'event_label': linkText,
            'value': 10
          });
        }
      });
    });

    // Track feedback submissions
    document.querySelectorAll('.feedback-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const feedbackType = this.classList.contains('feedback-yes') ? 'helpful' :
                             this.classList.contains('feedback-no') ? 'not-helpful' : 'suggestion';
        
        console.log('Privacy policy feedback:', feedbackType);
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'privacy_page_feedback', {
            'event_category': 'Privacy',
            'event_label': feedbackType,
            'value': 1
          });
        }
      });
    });
  }

  // Add keyboard shortcut (Ctrl+P) for print-friendly version
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p' && e.shiftKey) {
      e.preventDefault();
      
      const printLink = document.querySelector('a[href*="/print/privacy"]');
      if (printLink) {
        const confirmed = confirm('Open print-friendly version of privacy policy?');
        if (confirmed) {
          window.location.href = printLink.href;
        }
      } else {
        window.print();
      }
    }
  });

  // Highlight sections on hash navigation
  window.addEventListener('hashchange', function() {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        // Remove previous highlights
        document.querySelectorAll('.section-highlight').forEach(el => {
          el.classList.remove('section-highlight');
        });

        // Add highlight to current section
        target.classList.add('section-highlight');
        
        // Add temporary highlight style
        const style = document.createElement('style');
        style.textContent = `
          .section-highlight {
            animation: highlightSection 2s ease;
          }
          @keyframes highlightSection {
            0% { background-color: rgba(0, 102, 204, 0.2); }
            100% { background-color: transparent; }
          }
        `;
        if (!document.querySelector('style[data-section-highlight]')) {
          style.setAttribute('data-section-highlight', 'true');
          document.head.appendChild(style);
        }

        // Remove highlight class after animation
        setTimeout(() => {
          target.classList.remove('section-highlight');
        }, 2000);
      }
    }
  });

  // Estimate reading time
  function addReadingTime() {
    const content = document.querySelector('main') || document.body;
    const text = content.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/min

    const timeElement = document.querySelector('[role="main"] p:first-of-type');
    if (timeElement && timeElement.textContent.includes('minute read')) {
      // Already has reading time
      return;
    }

    console.log(`Estimated reading time: ${readingTime} minutes`);
  }

  // Start initialization
  init();
  addReadingTime();
})();
