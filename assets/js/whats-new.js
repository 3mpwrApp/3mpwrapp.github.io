// What's New Page Enhancement Script
// Adds interactive animations and scroll effects

(function() {
  'use strict';

  // Animate beta badge on scroll
  function initBetaBadgeAnimation() {
    const badge = document.querySelector('.beta-badge');
    if (!badge) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down - make badge smaller
        badge.style.transform = 'scale(0.9)';
      } else {
        // Scrolling up or at top - normal size
        badge.style.transform = 'scale(1)';
      }
      
      lastScroll = currentScroll;
    });
  }
  
  // Intersection Observer for fade-in animations
  function initScrollAnimations() {
    const elements = document.querySelectorAll(
      '.archive-card, .update-subscription, .feature-suggestion'
    );
    
    if (!elements.length) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 150);
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }
  
  // Enhance archive card with icon animation
  function enhanceArchiveCard() {
    const archiveCard = document.querySelector('.archive-card');
    if (!archiveCard) return;
    
    const icon = archiveCard.querySelector('.archive-icon');
    if (!icon) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    archiveCard.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.2) rotate(5deg)';
      icon.style.transition = 'transform 0.3s ease';
    });
    
    archiveCard.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1) rotate(0deg)';
    });
    
    // Keyboard navigation
    archiveCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        archiveCard.click();
      }
    });
  }
  
  // Enhance subscription buttons
  function enhanceSubscriptionButtons() {
    const buttons = document.querySelectorAll('.subscription-btn');
    if (!buttons.length) return;
    
    buttons.forEach(btn => {
      const icon = btn.querySelector('.btn-icon');
      if (!icon) return;
      
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      
      btn.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.3)';
        icon.style.transition = 'transform 0.2s ease';
      });
      
      btn.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
      });
      
      // Ripple effect on click
      btn.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
        `;
        
        const rect = btn.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left - 10) + 'px';
        ripple.style.top = (e.clientY - rect.top - 10) + 'px';
        
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
          @keyframes ripple {
            to {
              transform: scale(15);
              opacity: 0;
            }
          }
        `;
        if (!document.querySelector('style[data-ripple]')) {
          rippleStyle.setAttribute('data-ripple', '');
          document.head.appendChild(rippleStyle);
        }
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
  
  // Enhance suggestion button
  function enhanceSuggestionButton() {
    const suggestionBtn = document.querySelector('.suggestion-btn');
    if (!suggestionBtn) return;
    
    const icon = suggestionBtn.querySelector('.btn-icon');
    if (!icon) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    suggestionBtn.addEventListener('mouseenter', () => {
      icon.style.transform = 'rotate(20deg) scale(1.2)';
      icon.style.transition = 'transform 0.3s ease';
    });
    
    suggestionBtn.addEventListener('mouseleave', () => {
      icon.style.transform = 'rotate(0deg) scale(1)';
    });
    
    // Add sparkle effect on hover
    suggestionBtn.addEventListener('mouseenter', () => {
      createSparkles(suggestionBtn);
    });
  }
  
  // Create sparkle effect
  function createSparkles(element) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const sparkleCount = 3;
    
    for (let i = 0; i < sparkleCount; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('span');
        sparkle.textContent = '✨';
        sparkle.style.cssText = `
          position: absolute;
          font-size: 1rem;
          pointer-events: none;
          z-index: 10;
          animation: sparkle 1s ease-out forwards;
        `;
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = (Math.random() * rect.width) + 'px';
        sparkle.style.top = (Math.random() * rect.height) + 'px';
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        const sparkleStyle = document.createElement('style');
        sparkleStyle.textContent = `
          @keyframes sparkle {
            0% {
              transform: translateY(0) scale(0);
              opacity: 1;
            }
            100% {
              transform: translateY(-30px) scale(1);
              opacity: 0;
            }
          }
        `;
        if (!document.querySelector('style[data-sparkle]')) {
          sparkleStyle.setAttribute('data-sparkle', '');
          document.head.appendChild(sparkleStyle);
        }
        
        setTimeout(() => sparkle.remove(), 1000);
      }, i * 200);
    }
  }
  
  // Add accessibility enhancements
  function enhanceAccessibility() {
    const interactiveElements = document.querySelectorAll(
      '.archive-card, .subscription-btn, .suggestion-btn'
    );
    
    interactiveElements.forEach(el => {
      el.addEventListener('focus', () => {
        el.style.outline = '3px solid #667eea';
        el.style.outlineOffset = '3px';
      });
      
      el.addEventListener('blur', () => {
        el.style.outline = 'none';
      });
    });
  }
  
  // Add notification animation to subscription section
  function initSubscriptionNotification() {
    const subscriptionSection = document.querySelector('.update-subscription');
    if (!subscriptionSection) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Trigger bell animation
          const bell = subscriptionSection.querySelector('.subscription-icon');
          if (bell) {
            bell.style.animation = 'ring 3s ease-in-out infinite';
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(subscriptionSection);
  }
  
  // Initialize all enhancements
  function init() {
    initBetaBadgeAnimation();
    initScrollAnimations();
    enhanceArchiveCard();
    enhanceSubscriptionButtons();
    enhanceSuggestionButton();
    enhanceAccessibility();
    initSubscriptionNotification();
    
    console.log('What\'s New page enhancements initialized');
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
