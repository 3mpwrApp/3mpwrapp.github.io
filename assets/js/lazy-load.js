/**
 * Image Lazy Loading & Optimization
 * Automatically loads images as they enter viewport
 * Provides loading placeholders and error handling
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    rootMargin: '50px',
    threshold: 0.01,
    loadingClass: 'lazy-loading',
    loadedClass: 'lazy-loaded',
    errorClass: 'lazy-error'
  };

  // Check for native lazy loading support
  const supportsNativeLazy = 'loading' in HTMLImageElement.prototype;

  /**
   * Initialize lazy loading
   */
  function init() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    if (images.length === 0) return;

    if (supportsNativeLazy) {
      // Use native lazy loading
      console.log('[Lazy Load] Using native browser lazy loading');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
        }
      });
    } else {
      // Use Intersection Observer for older browsers
      console.log('[Lazy Load] Using Intersection Observer fallback');
      initIntersectionObserver(images);
    }
  }

  /**
   * Set up Intersection Observer for lazy loading
   */
  function initIntersectionObserver(images) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: config.rootMargin,
      threshold: config.threshold
    });

    images.forEach(img => {
      img.classList.add(config.loadingClass);
      imageObserver.observe(img);
    });
  }

  /**
   * Load an image
   */
  function loadImage(img) {
    const src = img.dataset.src || img.src;
    const srcset = img.dataset.srcset;

    // Create a new image to preload
    const tempImage = new Image();

    tempImage.onload = function() {
      // Image loaded successfully
      img.src = src;
      if (srcset) {
        img.srcset = srcset;
      }
      img.classList.remove(config.loadingClass);
      img.classList.add(config.loadedClass);
      
      // Remove data attributes
      delete img.dataset.src;
      delete img.dataset.srcset;
    };

    tempImage.onerror = function() {
      // Image failed to load
      img.classList.remove(config.loadingClass);
      img.classList.add(config.errorClass);
      img.alt = img.alt || 'Failed to load image';
      console.error('[Lazy Load] Failed to load:', src);
    };

    // Start loading
    tempImage.src = src;
    if (srcset) {
      tempImage.srcset = srcset;
    }
  }

  /**
   * Add responsive image loading
   * Automatically generates srcset for different screen sizes
   */
  function enhanceResponsiveImages() {
    const images = document.querySelectorAll('img[data-responsive]');
    
    images.forEach(img => {
      const baseSrc = img.src || img.dataset.src;
      if (!baseSrc) return;

      // Generate srcset for common breakpoints
      const sizes = [320, 640, 768, 1024, 1280, 1920];
      const srcsetValues = sizes.map(size => {
        const responsiveSrc = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, `-${size}w.$1`);
        return `${responsiveSrc} ${size}w`;
      }).join(', ');

      img.srcset = srcsetValues;
      img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    });
  }

  /**
   * Add WebP support detection and fallback
   */
  function checkWebPSupport() {
    const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const img = new Image();
    
    img.onload = img.onerror = function() {
      const supported = img.height === 1;
      document.documentElement.classList.toggle('webp', supported);
      document.documentElement.classList.toggle('no-webp', !supported);
      console.log('[Image Optimization] WebP support:', supported);
    };
    
    img.src = webpData;
  }

  /**
   * Preload critical images
   */
  function preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('img[data-critical]');
    
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src || img.dataset.src;
      
      if (img.srcset || img.dataset.srcset) {
        link.imageSrcset = img.srcset || img.dataset.srcset;
      }
      
      document.head.appendChild(link);
    });
  }

  /**
   * Add blur-up effect for images
   */
  function addBlurUpEffect() {
    const style = document.createElement('style');
    style.textContent = `
      .lazy-loading {
        filter: blur(10px);
        transition: filter 0.3s ease;
      }
      
      .lazy-loaded {
        filter: blur(0);
      }
      
      .lazy-error {
        opacity: 0.5;
        background: #f0f0f0;
        border: 2px dashed #ccc;
      }
      
      img[data-src] {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s ease-in-out infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      checkWebPSupport();
      addBlurUpEffect();
      preloadCriticalImages();
      enhanceResponsiveImages();
      init();
    });
  } else {
    checkWebPSupport();
    addBlurUpEffect();
    preloadCriticalImages();
    enhanceResponsiveImages();
    init();
  }

  // Re-initialize for dynamically added images
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          init();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

})();
