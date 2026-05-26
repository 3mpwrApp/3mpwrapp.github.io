/**
 * 3mpwrApp™ - Content Personalization Engine
 * Copyright (c) 2025-2026 Lissa Beaulieu, operating as 3mpwrApp (Sole Proprietorship)
 * Licensed under AGPL-3.0. See LICENSE file in the project root.
 * First Use: 2026
 * 
 * Personalizes website content based on user's goal selection
 */

(function() {
  'use strict';

  // Feature visibility rules for each persona
  const PERSONA_FEATURES = {
    'injured-worker': {
      show: ['.claim-filing', '.evidence-management', '.tribunal-prep', '.community-support', '.crisis-resources'],
      hide: ['.legal-only', '.advocate-only'],
      priority: ['claim-filing', 'evidence-management', 'tribunal-prep']
    },
    'advocate': {
      show: ['.advocate-tools', '.partnership-info', '.research-database', '.community-support'],
      hide: ['.legal-only'],
      priority: ['advocate-tools', 'partnerships', 'research-database']
    },
    'legal': {
      show: ['.research-advanced', '.analytics-dashboard', '.case-comparison', '.ai-analysis'],
      hide: ['.beginner-only'],
      priority: ['research-database', 'ai-assistant', 'analytics']
    },
    'explorer': {
      show: [], // Show everything
      hide: [],
      priority: []
    }
  };

  // Progress-based feature visibility
  const PROGRESS_THRESHOLDS = {
    beginner: 0,   // 0-15%
    intermediate: 15, // 15-40%
    advanced: 40   // 40%+
  };

  /**
   * Apply persona-based filtering to page content
   */
  window.applyPersonaFilter = function() {
    try {
      const persona = localStorage.getItem('3mpwrapp_persona');
      if (!persona || persona === 'explorer') {
        // Show everything for explorers or if no persona set
        return;
      }

      const rules = PERSONA_FEATURES[persona];
      if (!rules) return;

      // Hide persona-specific sections
      rules.hide.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
          el.setAttribute('aria-hidden', 'true');
        });
      });

      // Ensure relevant sections are visible
      rules.show.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = '';
          el.removeAttribute('aria-hidden');
        });
      });

      console.log(`[Personalization] Applied persona filter: ${persona}`);
    } catch (error) {
      console.error('[Personalization] Error applying persona filter:', error);
    }
  };

  /**
   * Apply progress-based filtering (hide advanced features for beginners)
   */
  window.applyProgressFilter = function() {
    try {
      const progress = parseInt(localStorage.getItem('3mpwrapp_progress') || '0', 10);
      
      let level = 'beginner';
      if (progress >= PROGRESS_THRESHOLDS.advanced) {
        level = 'advanced';
      } else if (progress >= PROGRESS_THRESHOLDS.intermediate) {
        level = 'intermediate';
      }

      // Hide content above user's level
      if (level === 'beginner') {
        document.querySelectorAll('.advanced-only, .intermediate-only').forEach(el => {
          el.style.display = 'none';
          el.setAttribute('aria-hidden', 'true');
        });
      } else if (level === 'intermediate') {
        document.querySelectorAll('.advanced-only').forEach(el => {
          el.style.display = 'none';
          el.setAttribute('aria-hidden', 'true');
        });
      }

      console.log(`[Personalization] Applied progress filter: ${level} (${progress}%)`);
    } catch (error) {
      console.error('[Personalization] Error applying progress filter:', error);
    }
  };

  /**
   * Reorder content sections based on user's help priorities
   */
  window.reorderContent = function() {
    try {
      const helpPriorityStr = localStorage.getItem('3mpwrapp_helpPriority');
      if (!helpPriorityStr) return;

      const helpPriority = JSON.parse(helpPriorityStr);
      
      // Find content containers with data-feature attributes
      const containers = document.querySelectorAll('[data-feature]');
      const parent = containers[0]?.parentElement;
      
      if (!parent || containers.length === 0) return;

      // Create array of [element, priority] pairs
      const prioritized = Array.from(containers).map(el => {
        const feature = el.getAttribute('data-feature');
        const priority = helpPriority.indexOf(feature);
        return { element: el, priority: priority === -1 ? 999 : priority };
      });

      // Sort by priority (lower number = higher priority)
      prioritized.sort((a, b) => a.priority - b.priority);

      // Re-append in new order
      prioritized.forEach(item => {
        parent.appendChild(item.element);
      });

      console.log(`[Personalization] Reordered content based on priorities:`, helpPriority);
    } catch (error) {
      console.error('[Personalization] Error reordering content:', error);
    }
  };

  /**
   * Add personalization badge to show active goal
   */
  function showPersonalizationBadge() {
    try {
      const goal = localStorage.getItem('3mpwrapp_goal');
      if (!goal || goal === 'exploring') return;

      // Check if user dismissed the badge this session
      const dismissed = sessionStorage.getItem('3mpwrapp_badgeDismissed');
      if (dismissed) return;

      // Add backdrop for mobile
      const backdrop = document.createElement('div');
      backdrop.id = 'personalization-backdrop';
      backdrop.className = 'personalization-backdrop';
      backdrop.onclick = dismissPersonalizationBadge;
      backdrop.setAttribute('aria-label', 'Close personalization');
      document.body.appendChild(backdrop);

      const badge = document.createElement('div');
      badge.id = 'personalization-badge';
      badge.className = 'personalization-badge';
      badge.innerHTML = `
        <button class="badge-dismiss" onclick="dismissPersonalizationBadge()" aria-label="Dismiss personalization notice">
          &times;
        </button>
        <span class="badge-text">✨ Personalized for: <strong>${getGoalTitle(goal)}</strong></span>
        <div class="badge-actions">
          <button class="badge-reset" onclick="resetPersonalization()" aria-label="Reset personalization">
            Change
          </button>
        </div>
      `;
      
      document.body.appendChild(badge);
      injectBadgeStyles();
    } catch (error) {
      console.error('[Personalization] Error showing badge:', error);
    }
  }

  /**
   * Dismiss personalization badge for this session
   */
  window.dismissPersonalizationBadge = function() {
    try {
      sessionStorage.setItem('3mpwrapp_badgeDismissed', 'true');
      const badge = document.getElementById('personalization-badge');
      const backdrop = document.getElementById('personalization-backdrop');
      
      if (badge) {
        badge.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => badge.remove(), 300);
      }
      
      if (backdrop) {
        backdrop.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => backdrop.remove(), 300);
      }
    } catch (error) {
      console.error('[Personalization] Error dismissing badge:', error);
    }
  };

  /**
   * Get human-readable goal title
   */
  function getGoalTitle(goalKey) {
    const titles = {
      'filing-claim': 'Filing a Claim',
      'hearing-prep': 'Hearing Prep',
      'just-injured': 'Getting Started',
      'supporting-someone': 'Supporting Someone',
      'legal-professional': 'Legal Research',
      'exploring': 'Exploring'
    };
    return titles[goalKey] || 'Unknown';
  }

  /**
   * Reset personalization (allow user to choose again)
   */
  window.resetPersonalization = function() {
    localStorage.removeItem('3mpwrapp_goal');
    localStorage.removeItem('3mpwrapp_persona');
    localStorage.removeItem('3mpwrapp_progress');
    localStorage.removeItem('3mpwrapp_features');
    localStorage.removeItem('3mpwrapp_helpPriority');
    sessionStorage.removeItem('3mpwrapp_goalDismissed');
    
    location.reload();
  };

  /**
   * Inject CSS for personalization badge
   */
  function injectBadgeStyles() {
    if (document.getElementById('personalization-badge-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'personalization-badge-styles';
    styles.textContent = `
      .personalization-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9998;
        display: none;
        animation: fadeIn 0.3s ease-out;
      }

      @media (max-width: 768px) {
        .personalization-backdrop {
          display: block;
        }
      }

      .personalization-badge {
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--card-bg, #f8f9fa);
        border: 2px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-size: 0.875rem;
        color: var(--text-color, #333);
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.8);
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      .badge-text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
      }

      .badge-text strong {
        color: var(--link-color, #0066cc);
      }

      .badge-actions {
        display: flex;
        gap: 0.5rem;
      }

      .badge-reset {
        background: var(--button-bg, #f5f5f5);
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 4px;
        padding: 0.25rem 0.75rem;
        cursor: pointer;
        font-size: 0.8rem;
        color: var(--text-color, #333);
        transition: all 0.2s;
        white-space: nowrap;
      }

      .badge-reset:hover {
        background: var(--button-hover-bg, #e0e0e0);
      }

      .badge-dismiss {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        line-height: 1;
        color: var(--text-color, #666);
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        order: -1;
      }

      .badge-dismiss:hover {
        color: var(--error-color, #dc2626);
        transform: scale(1.2);
      }

      @media (max-width: 768px) {
        .personalization-badge {
          position: fixed;
          top: 50%;
          left: 50%;
          right: auto;
          bottom: auto;
          transform: translate(-50%, -50%);
          max-width: calc(100vw - 40px);
          width: auto;
          flex-direction: column;
          align-items: stretch;
          padding: 1rem;
          font-size: 0.9rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .badge-dismiss {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          order: 0;
        }

        .badge-text {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          padding-right: 2rem;
        }

        .badge-actions {
          width: 100%;
          margin-top: 0.5rem;
        }

        .badge-reset {
          width: 100%;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Initialize personalization on page load
   */
  function initPersonalization() {
    // Only apply on pages that opt-in with data-personalized attribute
    if (!document.body.hasAttribute('data-personalized')) {
      console.log('[Personalization] Page not marked for personalization');
      return;
    }

    const goal = localStorage.getItem('3mpwrapp_goal');
    if (!goal) {
      console.log('[Personalization] No goal set, skipping personalization');
      return;
    }

    console.log('[Personalization] Initializing for goal:', goal);

    // Apply all personalization filters
    applyPersonaFilter();
    applyProgressFilter();
    reorderContent();
    showPersonalizationBadge();
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPersonalization);
  } else {
    initPersonalization();
  }

})();
