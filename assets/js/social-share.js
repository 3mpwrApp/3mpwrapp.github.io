/**
 * Social Share Component
 * Handles social media sharing with Web Share API and fallbacks
 * Includes 3mpwrApp branding and #3mpwrApp hashtag
 */

(function() {
  'use strict';

  // Check if Web Share API is available
  const hasNativeShare = navigator.share !== undefined;

  /**
   * Initialize social sharing functionality
   */
  function initSocialShare() {
    // Hide/show native share button based on API availability
    const nativeButtons = document.querySelectorAll('[data-share-native]');
    nativeButtons.forEach(button => {
      if (hasNativeShare) {
        button.style.display = ''; // Show
        button.addEventListener('click', handleNativeShare);
      } else {
        button.style.display = 'none'; // Hide if not supported
      }
    });

    // Initialize copy link buttons
    const copyButtons = document.querySelectorAll('[data-share-copy]');
    copyButtons.forEach(button => {
      button.addEventListener('click', handleCopyLink);
    });

    // Add click tracking for social links
    const socialLinks = document.querySelectorAll('.social-share__btn[href]');
    socialLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        trackShare(getSocialNetwork(link.href));
      });
    });
  }

  /**
   * Handle native share functionality
   */
  function handleNativeShare(event) {
    const button = event.currentTarget;
    const title = button.getAttribute('data-title');
    const text = button.getAttribute('data-text');
    const url = button.getAttribute('data-url');

    if (!navigator.share) {
      showFeedback(button, 'Sharing not supported on this device', 'error');
      return;
    }

    navigator.share({
      title: title,
      text: text,
      url: url
    })
      .then(() => {
        showFeedback(button, 'Shared successfully!', 'success');
        trackShare('native');
      })
      .catch((error) => {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          showFeedback(button, 'Share cancelled', 'info');
        }
      });
  }

  /**
   * Handle copy link to clipboard
   */
  function handleCopyLink(event) {
    const button = event.currentTarget;
    const url = button.getAttribute('data-url');
    const text = button.getAttribute('data-text');
    const fullText = `${text}\n${url}`;

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText)
        .then(() => {
          showFeedback(button, 'Copied with #3mpwrApp!', 'success');
          trackShare('copy');
        })
        .catch((error) => {
          console.error('Copy failed:', error);
          fallbackCopy(fullText, button);
        });
    } else {
      // Fallback for older browsers
      fallbackCopy(fullText, button);
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.setAttribute('aria-hidden', 'true');
    document.body.appendChild(textArea);
    
    try {
      textArea.select();
      const successful = document.execCommand('copy');
      if (successful) {
        showFeedback(button, 'Copied with #3mpwrApp!', 'success');
        trackShare('copy');
      } else {
        showFeedback(button, 'Copy failed - please try manually', 'error');
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      showFeedback(button, 'Copy not supported', 'error');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Show feedback message near button
   */
  function showFeedback(button, message, type = 'info') {
    // Create feedback element
    const feedback = document.createElement('span');
    feedback.className = `social-share__feedback social-share__feedback--${type}`;
    feedback.textContent = message;
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    
    // Position near button
    const container = button.closest('.social-share');
    if (container) {
      container.appendChild(feedback);
    } else {
      button.parentElement.appendChild(feedback);
    }

    // Announce to screen readers
    if (window.announce) {
      window.announce(message);
    }

    // Remove after delay
    setTimeout(() => {
      feedback.remove();
    }, 3000);
  }

  /**
   * Get social network name from URL
   */
  function getSocialNetwork(url) {
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('instagram.com')) return 'instagram';
    return 'other';
  }

  /**
   * Track share action (can be integrated with analytics)
   */
  function trackShare(network) {
    // Log for debugging
    console.log(`[Social Share] Shared via ${network}`);

    // Track with Google Analytics if available
    if (window.gtag) {
      gtag('event', 'share', {
        method: network,
        content_type: 'page',
        item_id: window.location.pathname
      });
    }

    // Track with custom events if needed
    try {
      window.dispatchEvent(new CustomEvent('socialShare', {
        detail: {
          network: network,
          url: window.location.href,
          timestamp: Date.now()
        }
      }));
    } catch (error) {
      console.error('Event dispatch failed:', error);
    }
  }

  /**
   * Add keyboard navigation improvements
   */
  function enhanceAccessibility() {
    const shareButtons = document.querySelectorAll('.social-share__btn');
    
    shareButtons.forEach(button => {
      // Add keyboard activation
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });

      // Add focus visible class for enhanced focus indicators
      button.addEventListener('focus', () => {
        button.classList.add('has-focus');
      });

      button.addEventListener('blur', () => {
        button.classList.remove('has-focus');
      });
    });
  }

  /**
   * Initialize when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSocialShare();
      enhanceAccessibility();
    });
  } else {
    initSocialShare();
    enhanceAccessibility();
  }

  // Export for use in other scripts if needed
  if (window) {
    window.socialShare = {
      init: initSocialShare,
      track: trackShare
    };
  }
})();
