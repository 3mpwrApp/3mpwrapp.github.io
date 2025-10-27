// Feedback Page Enhancement Script
// Adds confetti animation and interactive elements

(function() {
  'use strict';

  // Create confetti effect on page load
  function createConfetti() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;
    
    document.body.appendChild(confettiContainer);
    
    const colors = ['#667eea', '#764ba2', '#16a34a', '#f59e0b', '#0ea5e9'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.8 + 0.2};
        transform: rotate(${Math.random() * 360}deg);
        animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
      `;
      
      confettiContainer.appendChild(confetti);
    }
    
    // Add confetti animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Remove confetti after animation
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  }
  
  // Intersection Observer for card animations
  function initCardAnimations() {
    const cards = document.querySelectorAll(
      '.impact-card, .contact-option-card'
    );
    
    if (!cards.length) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });
  }
  
  // Add pulse effect to success banner
  function animateSuccessBanner() {
    const banner = document.querySelector('.success-banner');
    if (!banner) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const icon = banner.querySelector('.success-icon');
    if (!icon) return;
    
    // Pulse animation after initial bounce
    setTimeout(() => {
      const pulseStyle = document.createElement('style');
      pulseStyle.textContent = `
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `;
      document.head.appendChild(pulseStyle);
      
      icon.style.animation = 'pulse 2s ease-in-out infinite';
    }, 1000);
  }
  
  // Enhance contact option cards
  function enhanceContactCards() {
    const cards = document.querySelectorAll('.contact-option-card');
    if (!cards.length) return;
    
    cards.forEach(card => {
      const icon = card.querySelector('.option-icon');
      if (!icon) return;
      
      card.addEventListener('mouseenter', () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        icon.style.transform = 'scale(1.2) rotate(10deg)';
        icon.style.transition = 'transform 0.3s ease';
      });
      
      card.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1) rotate(0deg)';
      });
      
      // Keyboard navigation
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }
  
  // Add hover effect to impact cards
  function enhanceImpactCards() {
    const cards = document.querySelectorAll('.impact-card');
    if (!cards.length) return;
    
    cards.forEach(card => {
      const icon = card.querySelector('.impact-icon');
      if (!icon) return;
      
      card.addEventListener('mouseenter', () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        icon.style.transform = 'scale(1.15)';
        icon.style.transition = 'transform 0.3s ease';
      });
      
      card.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
      });
    });
  }
  
  // Add click animation to home button
  function enhanceHomeButton() {
    const homeBtn = document.querySelector('.btn-home');
    if (!homeBtn) return;
    
    homeBtn.addEventListener('click', (e) => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      
      // Create ripple effect
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
      
      const rect = homeBtn.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left - 10) + 'px';
      ripple.style.top = (e.clientY - rect.top - 10) + 'px';
      
      homeBtn.style.position = 'relative';
      homeBtn.style.overflow = 'hidden';
      homeBtn.appendChild(ripple);
      
      const rippleStyle = document.createElement('style');
      rippleStyle.textContent = `
        @keyframes ripple {
          to {
            transform: scale(15);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(rippleStyle);
      
      setTimeout(() => ripple.remove(), 600);
    });
  }
  
  // Add accessibility enhancements
  function enhanceAccessibility() {
    // Add focus indicators
    const interactiveElements = document.querySelectorAll(
      '.contact-option-card, .btn-home'
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
  
  // Initialize all enhancements
  function init() {
    createConfetti();
    animateSuccessBanner();
    initCardAnimations();
    enhanceContactCards();
    enhanceImpactCards();
    enhanceHomeButton();
    enhanceAccessibility();
    
    console.log('Feedback page enhancements initialized');
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
