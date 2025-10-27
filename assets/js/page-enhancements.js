// Page Enhancements - Shared JavaScript
// Utilities for interactive elements, smooth scrolling, and accessibility

(function() {
  'use strict';

  // Smooth scroll to anchor links
  function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without jumping
          history.pushState(null, '', targetId);
          
          // Focus target for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      });
    });
  }

  // Copy to clipboard functionality
  function initializeCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(button => {
      button.addEventListener('click', async function() {
        const textToCopy = this.getAttribute('data-copy');
        try {
          await navigator.clipboard.writeText(textToCopy);
          
          // Visual feedback
          const originalText = this.textContent;
          this.textContent = '✓ Copied!';
          this.style.backgroundColor = '#10b981';
          this.style.color = 'white';
          
          setTimeout(() => {
            this.textContent = originalText;
            this.style.backgroundColor = '';
            this.style.color = '';
          }, 2000);
          
          // Announce to screen readers
          announceToScreenReader('Copied to clipboard');
        } catch (err) {
          console.error('Failed to copy:', err);
          announceToScreenReader('Copy failed. Please try again.');
        }
      });
    });
  }

  // Toggle all details/accordion elements
  function initializeToggleAll() {
    const toggleButton = document.querySelector('[data-toggle-all-details]');
    if (!toggleButton) return;

    let allExpanded = false;

    toggleButton.addEventListener('click', function() {
      const details = document.querySelectorAll('details');
      allExpanded = !allExpanded;

      details.forEach(detail => {
        detail.open = allExpanded;
      });

      this.textContent = allExpanded ? 'Collapse All' : 'Expand All';
      this.setAttribute('aria-expanded', allExpanded);
      
      announceToScreenReader(allExpanded ? 'All sections expanded' : 'All sections collapsed');
    });
  }

  // Progress tracker animation
  function initializeProgressIndicators() {
    const indicators = document.querySelectorAll('.progress-indicator');
    
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
      });
    }, observerOptions);

    indicators.forEach(indicator => {
      observer.observe(indicator);
    });
  }

  // Lazy load images with fade-in
  function initializeLazyLoad() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Accordion keyboard navigation
  function enhanceDetailsAccessibility() {
    document.querySelectorAll('details').forEach(detail => {
      const summary = detail.querySelector('summary');
      
      // Add keyboard support
      summary.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          detail.open = !detail.open;
          announceToScreenReader(detail.open ? 'Section expanded' : 'Section collapsed');
        }
      });

      // Track state changes
      detail.addEventListener('toggle', function() {
        const state = this.open ? 'expanded' : 'collapsed';
        this.setAttribute('data-state', state);
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

  // Table of contents generator
  function generateTableOfContents() {
    const tocContainer = document.querySelector('[data-toc]');
    if (!tocContainer) return;

    const headings = document.querySelectorAll('main h2, main h3');
    if (headings.length === 0) return;

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Table of contents');
    nav.className = 'toc-navigation';

    const list = document.createElement('ul');
    list.className = 'toc-list';

    headings.forEach((heading, index) => {
      // Add ID if missing
      if (!heading.id) {
        heading.id = `section-${index + 1}`;
      }

      const listItem = document.createElement('li');
      listItem.className = heading.tagName.toLowerCase() === 'h3' ? 'toc-subitem' : 'toc-item';

      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.className = 'toc-link';

      listItem.appendChild(link);
      list.appendChild(listItem);
    });

    nav.appendChild(list);
    tocContainer.appendChild(nav);
  }

  // Handle feature card filtering (if present)
  function initializeFeatureFilters() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const category = this.getAttribute('data-filter');
        
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Filter cards
        const cards = document.querySelectorAll('[data-category]');
        cards.forEach(card => {
          if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.3s ease';
          } else {
            card.style.display = 'none';
          }
        });

        announceToScreenReader(`Showing ${category === 'all' ? 'all' : category} items`);
      });
    });
  }

  // Phone number formatting
  function formatPhoneNumbers() {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.setAttribute('aria-label', `Call ${link.textContent.trim()}`);
      link.classList.add('phone-link');
    });
  }

  // Initialize all features
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all features
    initializeSmoothScroll();
    initializeCopyButtons();
    initializeToggleAll();
    initializeProgressIndicators();
    initializeLazyLoad();
    enhanceDetailsAccessibility();
    generateTableOfContents();
    initializeFeatureFilters();
    formatPhoneNumbers();

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .toc-navigation {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 2rem 0;
      }

      .toc-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .toc-item {
        margin: 0.5rem 0;
      }

      .toc-subitem {
        margin: 0.25rem 0 0.25rem 1.5rem;
        font-size: 0.95rem;
      }

      .toc-link {
        color: #0066CC;
        text-decoration: none;
        padding: 0.25rem 0.5rem;
        display: inline-block;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .toc-link:hover {
        background-color: #f0f7ff;
        text-decoration: underline;
      }

      .toc-link:focus {
        outline: 3px solid rgba(0, 102, 204, 0.5);
        outline-offset: 2px;
      }

      .phone-link {
        font-weight: 700;
        font-size: 1.2rem;
      }

      img.loaded {
        animation: fadeIn 0.3s ease;
      }

      @media (prefers-color-scheme: dark) {
        .toc-navigation {
          background-color: #2d2d2d;
          border-color: #444;
        }

        .toc-link {
          color: #4DB8FF;
        }

        .toc-link:hover {
          background-color: #1a2a3a;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);

    console.log('Page enhancements initialized');
  }

  // Start initialization
  init();
})();
