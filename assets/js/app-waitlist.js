// App Waitlist Page Interactivity

(function() {
  'use strict';

  // Initialize all waitlist features
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize features
    convertOnboardingStepsToList();
    convertRoleListToCheckmarks();
    animateStatsOnView();
    trackCTAClicks();
    initializeDetailsToggle();

    console.log('App Waitlist page initialized');
  }

  // Convert numbered onboarding sections into styled list
  function convertOnboardingStepsToList() {
    // Find the "What to Expect After Signing Up:" section
    const headers = document.querySelectorAll('h3');
    let targetHeader = null;

    headers.forEach(header => {
      if (header.textContent.includes('What to Expect After Signing Up')) {
        targetHeader = header;
      }
    });

    if (!targetHeader) return;

    // Create ordered list structure
    const steps = [];
    let currentElement = targetHeader.nextElementSibling;
    let currentStep = null;

    while (currentElement && currentElement.tagName !== 'HR' && currentElement.tagName !== 'H2') {
      if (currentElement.tagName === 'OL') {
        // Already structured as a list, skip
        return;
      }

      if (currentElement.textContent.match(/^\d+\./)) {
        if (currentStep) {
          steps.push(currentStep);
        }
        currentStep = {
          title: currentElement.textContent,
          content: []
        };
      } else if (currentStep && currentElement.tagName === 'UL') {
        currentStep.content.push(currentElement.cloneNode(true));
      }

      const next = currentElement.nextElementSibling;
      if (currentStep && currentElement !== targetHeader) {
        currentElement.remove();
      }
      currentElement = next;
    }

    if (currentStep) {
      steps.push(currentStep);
    }

    // Create styled list
    if (steps.length > 0) {
      const ol = document.createElement('ol');
      ol.className = 'onboarding-steps';

      steps.forEach(step => {
        const li = document.createElement('li');
        
        const h3 = document.createElement('h3');
        h3.textContent = step.title.replace(/^\d+\.\s*/, '');
        li.appendChild(h3);

        step.content.forEach(content => {
          li.appendChild(content);
        });

        ol.appendChild(li);
      });

      targetHeader.parentNode.insertBefore(ol, targetHeader.nextSibling);
    }
  }

  // Convert role list to checkmarked items
  function convertRoleListToCheckmarks() {
    // Find "Your Role:" section
    const headers = document.querySelectorAll('h3');
    let targetHeader = null;

    headers.forEach(header => {
      if (header.textContent.includes('Your Role')) {
        targetHeader = header;
      }
    });

    if (!targetHeader) return;

    // Find all lists after this header until next h2/h3
    let currentElement = targetHeader.nextElementSibling;

    while (currentElement && !['H2', 'H3', 'HR'].includes(currentElement.tagName)) {
      if (currentElement.tagName === 'UL' || currentElement.tagName === 'OL') {
        currentElement.className = 'role-list';
      }
      currentElement = currentElement.nextElementSibling;
    }
  }

  // Animate stats when they come into view
  function animateStatsOnView() {
    const statsContainer = document.querySelector('.stats-grid');
    if (!statsContainer) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStatNumbers(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    observer.observe(statsContainer);
  }

  // Animate stat numbers counting up
  function animateStatNumbers(container) {
    const statValues = container.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
      const text = stat.textContent.trim();
      const hasNumber = text.match(/\d+/);
      
      if (hasNumber) {
        const targetNumber = parseInt(hasNumber[0]);
        const prefix = text.substring(0, text.indexOf(hasNumber[0]));
        const suffix = text.substring(text.indexOf(hasNumber[0]) + hasNumber[0].length);
        
        let current = 0;
        const increment = Math.ceil(targetNumber / 50);
        const duration = 1500;
        const stepTime = duration / (targetNumber / increment);

        const timer = setInterval(() => {
          current += increment;
          if (current >= targetNumber) {
            current = targetNumber;
            clearInterval(timer);
          }
          stat.textContent = prefix + current + suffix;
        }, stepTime);
      }
    });
  }

  // Track CTA button clicks for analytics
  function trackCTAClicks() {
    document.querySelectorAll('.btn-primary, .cta-button').forEach(button => {
      button.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        
        // Log to console (can be replaced with actual analytics)
        console.log('CTA clicked:', buttonText);
        
        // Optional: Send to analytics service
        if (typeof gtag !== 'undefined') {
          gtag('event', 'click', {
            'event_category': 'CTA',
            'event_label': buttonText,
            'value': 1
          });
        }
      });
    });
  }

  // Toggle all details elements
  function initializeDetailsToggle() {
    const faqSection = document.querySelector('h2#-frequently-asked-questions, h2:has(+ details)');
    if (!faqSection) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-all-btn';
    toggleBtn.textContent = 'Expand All FAQs';
    toggleBtn.setAttribute('data-toggle-all-details', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.style.cssText = `
      background: #0066CC;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem 0;
      transition: all 0.2s ease;
    `;

    toggleBtn.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#0052a3';
    });

    toggleBtn.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '#0066CC';
    });

    faqSection.parentNode.insertBefore(toggleBtn, faqSection.nextSibling);
  }

  // Start initialization
  init();
})();
