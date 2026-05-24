/**
 * Progressive Disclosure Manager
 * 
 * Manages personalized content display based on user's selected persona.
 * Gradually reveals advanced features as users progress through the site.
 * 
 * Usage: Include this script in your layout footer.
 */

(function() {
  'use strict';

  const PERSONA_KEY = '3mpwrapp_persona';
  const PROGRESS_KEY = '3mpwrapp_progress';
  const VISIT_COUNT_KEY = '3mpwrapp_visit_count';

  // Get user's persona from localStorage
  function getPersona() {
    return localStorage.getItem(PERSONA_KEY) || null;
  }

  // Get user's progress level (0-100)
  function getProgress() {
    const progress = localStorage.getItem(PROGRESS_KEY);
    return progress ? parseInt(progress, 10) : 0;
  }

  // Increment progress by amount
  function incrementProgress(amount) {
    const currentProgress = getProgress();
    const newProgress = Math.min(100, currentProgress + amount);
    localStorage.setItem(PROGRESS_KEY, newProgress.toString());
    return newProgress;
  }

  // Track page visit
  function trackVisit() {
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
    localStorage.setItem(VISIT_COUNT_KEY, (count + 1).toString());
    
    // Increment progress for each visit (max 50 points from visits)
    if (count < 50) {
      incrementProgress(1);
    }
  }

  // Show/hide elements based on persona
  function applyPersonaFilter() {
    const persona = getPersona();
    if (!persona) return;

    // Elements with data-persona attribute
    const elements = document.querySelectorAll('[data-persona]');
    elements.forEach(el => {
      const allowedPersonas = el.getAttribute('data-persona').split(',').map(p => p.trim());
      
      if (allowedPersonas.includes(persona) || allowedPersonas.includes('all')) {
        el.style.display = '';
        el.classList.remove('persona-hidden');
      } else {
        el.style.display = 'none';
        el.classList.add('persona-hidden');
      }
    });
  }

  // Show/hide elements based on progress level
  function applyProgressFilter() {
    const progress = getProgress();

    // Elements with data-progress-min attribute
    const elements = document.querySelectorAll('[data-progress-min]');
    elements.forEach(el => {
      const minProgress = parseInt(el.getAttribute('data-progress-min'), 10);
      
      if (progress >= minProgress) {
        el.style.display = '';
        el.classList.remove('progress-locked');
        el.classList.add('progress-unlocked');
      } else {
        // Show locked state instead of hiding
        el.classList.add('progress-locked');
        el.classList.remove('progress-unlocked');
        
        // Add unlock hint
        if (!el.querySelector('.unlock-hint')) {
          const hint = document.createElement('span');
          hint.className = 'unlock-hint';
          hint.textContent = ` 🔒 Unlocks at ${minProgress}% progress`;
          el.appendChild(hint);
        }
      }
    });
  }

  // Priority content based on persona
  const PERSONA_PRIORITIES = {
    'injured-worker': [
      '.claim-tools',
      '.evidence-mgmt',
      '.tribunal-prep',
      '.wellness',
      '.community'
    ],
    'advocate': [
      '.client-mgmt',
      '.advocacy-resources',
      '.legal-research',
      '.templates',
      '.training'
    ],
    'legal': [
      '.tribunal-decisions',
      '.legal-research',
      '.partnerships',
      '.referrals',
      '.analytics'
    ],
    'healthcare': [
      '.medical-reporting',
      '.documentation',
      '.wellness',
      '.advocacy-info',
      '.partnerships'
    ],
    'organization': [
      '.partnerships',
      '.bulk-mgmt',
      '.campaigns',
      '.dashboards',
      '.integrations'
    ],
    'explorer': [
      '.overview',
      '.app-tour',
      '.features',
      '.success-stories',
      '.getting-started'
    ]
  };

  // Reorder content sections based on persona
  function reorderContent() {
    const persona = getPersona();
    if (!persona || !PERSONA_PRIORITIES[persona]) return;

    const priorities = PERSONA_PRIORITIES[persona];
    const container = document.querySelector('.main-content');
    if (!container) return;

    // Move priority sections to top
    priorities.forEach((selector, index) => {
      const section = container.querySelector(selector);
      if (section) {
        section.style.order = index;
      }
    });
  }

  // Add progress indicator to page (with accessibility)
  function addProgressIndicator() {
    const progress = getProgress();
    const persona = getPersona();
    
    if (!persona) return;

    // Check if indicator already exists
    if (document.querySelector('.progress-indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = 'progress-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    indicator.setAttribute('aria-label', `Progress: ${progress}% explored`);
    indicator.innerHTML = `
      <div class="progress-bar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <span class="progress-text" aria-hidden="true">${progress}% explored</span>
    `;

    // Add to page (top right corner)
    document.body.appendChild(indicator);
  }

  // Track interactions that increase progress
  function trackInteraction(type) {
    const progressIncreases = {
      'read-article': 5,
      'watch-video': 10,
      'use-tool': 15,
      'download-resource': 10,
      'join-community': 20,
      'complete-tutorial': 25
    };

    const increase = progressIncreases[type] || 0;
    if (increase > 0) {
      const newProgress = incrementProgress(increase);
      
      // Update indicator if visible
      const indicator = document.querySelector('.progress-fill');
      if (indicator) {
        indicator.style.width = `${newProgress}%`;
      }
      const text = document.querySelector('.progress-text');
      if (text) {
        text.textContent = `${newProgress}% explored`;
      }

      // Show achievement notification
      if (newProgress >= 25 && newProgress < 50) {
        showAchievement('Getting Started', 'You\'re learning the ropes!');
      } else if (newProgress >= 50 && newProgress < 75) {
        showAchievement('Power User', 'You know your way around!');
      } else if (newProgress >= 75 && newProgress < 100) {
        showAchievement('Expert', 'You\'ve mastered most features!');
      } else if (newProgress === 100) {
        showAchievement('Master', 'You\'ve explored everything!');
      }
    }
  }

  // Show achievement notification (with accessibility)
  function showAchievement(title, message) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.innerHTML = `
      <div class="achievement-content">
        <span class="achievement-icon" aria-hidden="true">🏆</span>
        <div>
          <strong>${title}</strong>
          <p>${message}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }

  // Inject required CSS
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .progress-indicator {
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 10px 15px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        font-size: 0.85rem;
      }

      .progress-bar {
        width: 150px;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 5px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #45a049);
        transition: width 0.5s ease;
      }

      .progress-text {
        color: #666;
        font-size: 0.8rem;
      }

      .progress-locked {
        opacity: 0.5;
        pointer-events: none;
        position: relative;
      }

      .unlock-hint {
        display: inline-block;
        font-size: 0.75rem;
        color: #999;
        margin-left: 0.5rem;
      }

      .achievement-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      }

      .achievement-notification.fade-out {
        animation: fadeOut 0.5s ease;
      }

      .achievement-content {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .achievement-icon {
        font-size: 2rem;
      }

      .achievement-content strong {
        display: block;
        color: #4CAF50;
        margin-bottom: 3px;
      }

      .achievement-content p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }

      @media (max-width: 768px) {
        .progress-indicator {
          top: 60px;
          right: 10px;
          padding: 8px 12px;
        }

        .progress-bar {
          width: 100px;
        }

        .achievement-notification {
          bottom: 10px;
          right: 10px;
          left: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize on page load
  function init() {
    // Track visit
    trackVisit();

    // Apply filters
    applyPersonaFilter();
    applyProgressFilter();

    // Reorder content
    reorderContent();

    // Add progress indicator
    addProgressIndicator();

    // Inject styles
    injectStyles();

    // Set up event listeners for progress tracking
    document.addEventListener('click', function(e) {
      const target = e.target;

      // Track article reads
      if (target.matches('article a, .blog-post a')) {
        trackInteraction('read-article');
      }

      // Track video plays
      if (target.matches('.video-play, iframe[src*="youtube"]')) {
        trackInteraction('watch-video');
      }

      // Track tool usage
      if (target.matches('.tool-button, [data-tool]')) {
        trackInteraction('use-tool');
      }

      // Track downloads
      if (target.matches('a[download], .download-button')) {
        trackInteraction('download-resource');
      }
    });

    // Expose API for manual progress tracking
    window.3mpwrProgress = {
      track: trackInteraction,
      getProgress: getProgress,
      getPersona: getPersona
    };
  }

  // Initialize progressive disclosure (goal-based-onboarding.js handles first visit)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose functions for goal-based onboarding integration
  window.applyPersonaFilter = applyPersonaFilter;
  window.applyProgressFilter = applyProgressFilter;
  window.reorderContent = reorderContent;
})();
