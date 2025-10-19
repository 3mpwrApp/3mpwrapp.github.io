/**
 * Performance Monitoring & Core Web Vitals Tracking
 * Tracks and reports key performance metrics
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    enableLogging: true,
    enableAnalytics: true,
    sampleRate: 1.0, // Report 100% of metrics (reduce for high traffic)
    endpoint: '/api/metrics' // Future: send to analytics endpoint
  };

  /**
   * Log to console if enabled
   */
  function log(message, data) {
    if (config.enableLogging) {
      console.log(`[Performance] ${message}`, data || '');
    }
  }

  /**
   * Send metric to analytics
   */
  function sendToAnalytics(metric) {
    if (!config.enableAnalytics || Math.random() > config.sampleRate) {
      return;
    }

    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        non_interaction: true
      });
    }

    // Log metric
    log(metric.name, {
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta)
    });

    // Future: Send to custom endpoint
    // navigator.sendBeacon(config.endpoint, JSON.stringify(metric));
  }

  /**
   * Track Core Web Vitals using web-vitals library pattern
   */
  function trackWebVitals() {
    // Check if Performance Observer is supported
    if (!('PerformanceObserver' in window)) {
      log('PerformanceObserver not supported');
      return;
    }

    // Track Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const metric = {
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
          id: generateId(),
          delta: lastEntry.renderTime || lastEntry.loadTime
        };
        
        sendToAnalytics(metric);
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      log('LCP tracking failed', e);
    }

    // Track First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const metric = {
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: getRating('FID', entry.processingStart - entry.startTime),
            id: generateId(),
            delta: entry.processingStart - entry.startTime
          };
          
          sendToAnalytics(metric);
        });
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      log('FID tracking failed', e);
    }

    // Track Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      let clsEntries = [];

      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Report CLS when page is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          const metric = {
            name: 'CLS',
            value: clsValue,
            rating: getRating('CLS', clsValue),
            id: generateId(),
            delta: clsValue
          };
          
          sendToAnalytics(metric);
        }
      });
    } catch (e) {
      log('CLS tracking failed', e);
    }
  }

  /**
   * Track Navigation Timing metrics
   */
  function trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (!navigation) return;

        const metrics = {
          // DNS lookup time
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          
          // TCP connection time
          tcp: navigation.connectEnd - navigation.connectStart,
          
          // TLS negotiation time
          tls: navigation.secureConnectionStart > 0 
            ? navigation.connectEnd - navigation.secureConnectionStart 
            : 0,
          
          // Time to First Byte (TTFB)
          ttfb: navigation.responseStart - navigation.requestStart,
          
          // Download time
          download: navigation.responseEnd - navigation.responseStart,
          
          // DOM processing time
          domProcessing: navigation.domComplete - navigation.domInteractive,
          
          // Load complete time
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          
          // Total page load time
          pageLoad: navigation.loadEventEnd - navigation.fetchStart
        };

        log('Navigation Timing', metrics);

        // Send key metrics to analytics
        if (window.gtag) {
          window.gtag('event', 'timing_complete', {
            event_category: 'Performance',
            name: 'page_load',
            value: Math.round(metrics.pageLoad)
          });

          window.gtag('event', 'timing_complete', {
            event_category: 'Performance',
            name: 'ttfb',
            value: Math.round(metrics.ttfb)
          });
        }
      }, 0);
    });
  }

  /**
   * Track Resource Timing (images, scripts, styles)
   */
  function trackResourceTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource');
        
        const stats = {
          total: resources.length,
          images: resources.filter(r => r.initiatorType === 'img').length,
          scripts: resources.filter(r => r.initiatorType === 'script').length,
          css: resources.filter(r => r.initiatorType === 'link').length,
          fonts: resources.filter(r => r.initiatorType === 'css' && r.name.includes('font')).length,
          
          // Total transfer size
          totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          
          // Slowest resource
          slowest: resources.reduce((max, r) => 
            r.duration > max.duration ? r : max
          , { duration: 0 })
        };

        log('Resource Timing', {
          ...stats,
          totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2)
        });

        // Warn about slow resources
        if (stats.slowest.duration > 1000) {
          log('⚠️ Slow resource detected', {
            name: stats.slowest.name,
            duration: Math.round(stats.slowest.duration)
          });
        }
      }, 0);
    });
  }

  /**
   * Track First Paint metrics
   */
  function trackPaintTiming() {
    if (!('PerformancePaintTiming' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        log(entry.name, Math.round(entry.startTime));
        
        if (window.gtag) {
          window.gtag('event', 'timing_complete', {
            event_category: 'Performance',
            name: entry.name.replace('first-', ''),
            value: Math.round(entry.startTime)
          });
        }
      });
    });

    observer.observe({ type: 'paint', buffered: true });
  }

  /**
   * Track Long Tasks (janky performance)
   */
  function trackLongTasks() {
    if (!('PerformanceLongTaskTiming' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        log('⚠️ Long Task detected', {
          duration: Math.round(entry.duration),
          start: Math.round(entry.startTime)
        });
      });
    });

    try {
      observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      // Not supported in all browsers
    }
  }

  /**
   * Get performance rating (good/needs-improvement/poor)
   */
  function getRating(metric, value) {
    const thresholds = {
      LCP: [2500, 4000], // Good: <2.5s, Poor: >4s
      FID: [100, 300],   // Good: <100ms, Poor: >300ms
      CLS: [0.1, 0.25]   // Good: <0.1, Poor: >0.25
    };

    const [good, poor] = thresholds[metric] || [0, 0];

    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Generate unique ID for metric
   */
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Display performance summary in console
   */
  function displaySummary() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        console.group('%c🚀 3mpwrApp Performance Summary', 'color: #007bff; font-size: 14px; font-weight: bold;');
        
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          console.log('%cPage Load Time:', 'font-weight: bold', 
            `${Math.round(nav.loadEventEnd - nav.fetchStart)}ms`);
          console.log('%cTime to First Byte:', 'font-weight: bold', 
            `${Math.round(nav.responseStart - nav.requestStart)}ms`);
        }

        const resources = performance.getEntriesByType('resource');
        console.log('%cResources Loaded:', 'font-weight: bold', resources.length);
        
        console.log('%cTips:', 'font-weight: bold; color: #28a745');
        console.log('- Use Lighthouse for comprehensive audits');
        console.log('- Check Network tab for slow resources');
        console.log('- Enable "Disable cache" during development');
        
        console.groupEnd();
      }, 1000);
    });
  }

  /**
   * Initialize performance monitoring
   */
  function init() {
    log('Performance monitoring initialized');
    
    trackWebVitals();
    trackNavigationTiming();
    trackResourceTiming();
    trackPaintTiming();
    trackLongTasks();
    displaySummary();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window._3mpwrPerf = {
    config: config,
    getMetrics: () => performance.getEntries()
  };

})();
