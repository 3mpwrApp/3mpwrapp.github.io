/**
 * Connection Status Indicator - WCAG 2.2 AAA Compliant
 * Provides visual and screen reader announcements for online/offline status
 * Meets WCAG 4.1.3 (Status Messages) AAA requirement
 */

(function() {
  'use strict';

  // Create status indicator on page load
  function createStatusIndicator() {
    // Skip if already created
    if (document.getElementById('connection-status-container')) return;

    const container = document.createElement('div');
    container.id = 'connection-status-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    container.className = 'connection-status';
    
    // Hidden by default, shows only when offline
    container.hidden = true;
    
    document.body.appendChild(container);
  }

  // Update status display
  function updateStatus(isOnline) {
    const container = document.getElementById('connection-status-container');
    if (!container) return;

    if (isOnline) {
      container.hidden = true;
      container.innerHTML = '';
      container.className = 'connection-status online';
    } else {
      container.hidden = false;
      container.className = 'connection-status offline';
      container.innerHTML = `
        <div class="status-content">
          <span class="status-icon" aria-hidden="true">⚠️</span>
          <span class="status-text">
            <strong>You are currently offline.</strong> 
            Some features may be limited. Content will sync when you reconnect.
          </span>
        </div>
      `;
    }
  }

  // Listen for service worker messages
  function setupServiceWorkerListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CONNECTION_STATUS') {
          const isOnline = event.data.status === 'online';
          updateStatus(isOnline);
        }
      });
    }
  }

  // Listen for browser online/offline events
  function setupBrowserListeners() {
    window.addEventListener('online', () => {
      updateStatus(true);
      console.log('[Connection Status] Online');
    });

    window.addEventListener('offline', () => {
      updateStatus(false);
      console.log('[Connection Status] Offline');
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    createStatusIndicator();
    setupServiceWorkerListener();
    setupBrowserListeners();
    
    // Set initial status
    updateStatus(navigator.onLine);
  }
})();
