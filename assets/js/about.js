// About Page Enhancement Script
// Adds scroll animations and interactions

(function() {
  'use strict';

  // Intersection Observer for fade-in animations
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
      '.funding-card, .difference-card, .privacy-feature, .disclaimer-card'
    );
    
    if (!animatedElements.length) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the animation
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 50);
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Set initial state and observe
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }
  
  // Enhance mission statement with subtle pulse
  function enhanceMissionStatement() {
    const missionStatement = document.querySelector('.mission-statement');
    if (!missionStatement) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    // Add subtle pulse effect on hover
    missionStatement.addEventListener('mouseenter', () => {
      missionStatement.style.transform = 'scale(1.02)';
      missionStatement.style.transition = 'transform 0.3s ease';
    });
    
    missionStatement.addEventListener('mouseleave', () => {
      missionStatement.style.transform = 'scale(1)';
    });
  }
  
  // Add counter animation to funding cards
  function initFundingCards() {
    const fundingCards = document.querySelectorAll('.funding-card');
    if (!fundingCards.length) return;
    
    fundingCards.forEach(card => {
      // Add accessible tooltip on focus
      card.setAttribute('tabindex', '0');
      
      card.addEventListener('focus', () => {
        card.style.outline = '3px solid #667eea';
        card.style.outlineOffset = '2px';
      });
      
      card.addEventListener('blur', () => {
        card.style.outline = 'none';
      });
    });
  }
  
  // Enhance disclaimer cards with icon animation
  function enhanceDisclaimerCards() {
    const disclaimerCards = document.querySelectorAll('.disclaimer-card');
    if (!disclaimerCards.length) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    disclaimerCards.forEach(card => {
      const icon = card.querySelector('.disclaimer-icon');
      if (!icon) return;
      
      card.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.2) rotate(5deg)';
        icon.style.transition = 'transform 0.3s ease';
      });
      
      card.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1) rotate(0deg)';
      });
    });
  }
  
  // Add keyboard navigation enhancements
  function enhanceKeyboardNav() {
    const cards = document.querySelectorAll(
      '.funding-card, .difference-card, .privacy-feature, .disclaimer-card'
    );
    
    cards.forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const link = card.querySelector('a');
          if (link) {
            e.preventDefault();
            link.click();
          }
        }
      });
    });
  }
  
  // Add smooth scroll behavior to resource links
  function enhanceResourceLinks() {
    const resourceLinks = document.querySelectorAll('.resource-link');
    if (!resourceLinks.length) return;
    
    resourceLinks.forEach(link => {
      // Add hover effect
      link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateX(5px)';
        link.style.transition = 'transform 0.2s ease';
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateX(0)';
      });
    });
  }
  
  // Initialize all enhancements
  function init() {
    initScrollAnimations();
    enhanceMissionStatement();
    initFundingCards();
    enhanceDisclaimerCards();
    enhanceKeyboardNav();
    enhanceResourceLinks();
    
    // Log initialization
    console.log('About page enhancements initialized');
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
