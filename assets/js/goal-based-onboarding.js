/**
 * 3mpwrApp™ - Goal-Based Onboarding System
 * Copyright (c) 2025-2026 Lissa Beaulieu, operating as 3mpwrApp (Sole Proprietorship)
 * 
 * This file is part of 3mpwrApp™.
 * Licensed under AGPL-3.0. See LICENSE file in the project root.
 * 
 * Goal-Based Onboarding System
 * "What do you need right now?" approach
 * Replaces generic persona selection with specific goal-driven paths
 */

// Goal definitions with features they unlock
const GOALS = {
  'filing-claim': {
    title: 'Filing a Claim Soon',
    description: 'Get help preparing and submitting your claim',
    icon: '📝',
    features: ['evidence-basics', 'claim-checklist', 'form-help', 'deadlines'],
    persona: 'injured-worker',
    progress: 10,
    helpPriority: ['claim-filing', 'evidence-management', 'research-database']
  },
  'hearing-prep': {
    title: 'Preparing for a Hearing',
    description: 'Resources and strategies for your upcoming tribunal hearing',
    icon: '⚖️',
    features: ['tribunal-prep', 'evidence-advanced', 'research-cases', 'ai-summary'],
    persona: 'injured-worker',
    progress: 25,
    helpPriority: ['tribunal-prep', 'evidence-management', 'ai-assistant']
  },
  'just-injured': {
    title: 'Just Injured, Feeling Lost',
    description: 'Start here - we\'ll guide you through the first steps',
    icon: '🤕',
    features: ['getting-started', 'crisis-resources', 'what-to-do-first', 'community-support'],
    persona: 'injured-worker',
    progress: 5,
    helpPriority: ['claim-filing', 'community-support', 'download-app']
  },
  'supporting-someone': {
    title: 'Supporting Someone Else',
    description: 'Help a friend, family member, or client navigate the system',
    icon: '🤝',
    features: ['advocate-tools', 'how-to-help', 'partnership-info', 'research-database'],
    persona: 'advocate',
    progress: 15,
    helpPriority: ['partnerships', 'advocate-tools', 'community-support']
  },
  'legal-professional': {
    title: 'Legal Professional / Researcher',
    description: 'Access case law database and advanced research tools',
    icon: '⚖️',
    features: ['research-advanced', 'analytics-dashboard', 'case-comparison', 'ai-analysis'],
    persona: 'legal',
    progress: 20,
    helpPriority: ['research-database', 'ai-assistant', 'partnerships']
  },
  'exploring': {
    title: 'Just Exploring / Learning',
    description: 'Browse all features and learn about the platform',
    icon: '🔍',
    features: ['overview', 'feature-tour', 'about', 'faq'],
    persona: 'explorer',
    progress: 0,
    helpPriority: ['download-app', 'research-database', 'community-support']
  }
};

/**
 * Initialize goal-based onboarding
 */
function initGoalOnboarding() {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage not available - onboarding disabled');
      return;
    }
    
    // Check if user already has a goal, persona, or dismissed this session
    const savedGoal = localStorage.getItem('3mpwrapp_goal');
    const savedPersona = localStorage.getItem('3mpwrapp_persona');
    const dismissed = sessionStorage.getItem('3mpwrapp_goalDismissed');
    
    if (savedGoal || savedPersona || dismissed) {
      // Already onboarded or dismissed this session
      return;
    }
    
    // Match homepage with any variation (/, /index, /index.html, /index/)
    const path = window.location.pathname;
    const isHomepage = path === '/' || 
                       path === '/index' || 
                       path === '/index.html' || 
                       path === '/index/' ||
                       path.endsWith('/index.html');
    
    if (isHomepage) {
      setTimeout(() => {
        showGoalSelector();
      }, 1000); // 1 second delay so they see the homepage first
    }
  } catch (error) {
    console.error('Goal onboarding initialization failed:', error);
  }
}

/**
 * Show goal selector banner (non-blocking)
 */
function showGoalSelector() {
  const banner = document.createElement('div');
  banner.id = 'goal-selector-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'goal-selector-title');
  banner.innerHTML = `
    <div class="goal-banner-content">
      <button class="goal-banner-close" aria-label="Close" data-action="dismiss">×</button>
      <h2 id="goal-selector-title">👋 Welcome! What brings you here today?</h2>
      <p>Help us show you the most relevant resources first</p>
      <div class="goal-options">
        ${Object.entries(GOALS).map(([key, goal]) => `
          <button class="goal-option" data-goal="${key}" data-action="select-goal">
            <span class="goal-icon">${goal.icon}</span>
            <span class="goal-title">${goal.title}</span>
            <span class="goal-desc">${goal.description}</span>
          </button>
        `).join('')}
      </div>
      <div class="goal-banner-footer">
        <button class="goal-skip-button" data-action="skip">
          Skip for now - I'll browse on my own
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(banner);
  injectGoalStyles();
  
  // Event delegation for all buttons
  banner.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    
    const action = button.dataset.action;
    if (action === 'dismiss') {
      dismissGoalSelector();
    } else if (action === 'select-goal') {
      selectGoal(button.dataset.goal);
    } else if (action === 'skip') {
      skipGoalSelection();
    }
  });
  
  // Focus management for accessibility
  setTimeout(() => {
    banner.querySelector('.goal-option')?.focus();
  }, 100);
}

/**
 * User selects a goal
 */
function selectGoal(goalKey) {
  const goal = GOALS[goalKey];
  if (!goal) return;
  
  // Save goal and derived persona
  localStorage.setItem('3mpwrapp_goal', goalKey);
  localStorage.setItem('3mpwrapp_persona', goal.persona);
  localStorage.setItem('3mpwrapp_progress', goal.progress);
  localStorage.setItem('3mpwrapp_features', JSON.stringify(goal.features));
  localStorage.setItem('3mpwrapp_helpPriority', JSON.stringify(goal.helpPriority));
  
  // Show success message
  showGoalConfirmation(goal);
  
  // Apply personalization immediately
  if (window.applyPersonaFilter) window.applyPersonaFilter();
  if (window.applyProgressFilter) window.applyProgressFilter();
  if (window.reorderContent) window.reorderContent();
  
  // Close banner after 2 seconds
  setTimeout(() => {
    dismissGoalSelector();
  }, 2000);
}

/**
 * Show confirmation message
 */
function showGoalConfirmation(goal) {
  const banner = document.getElementById('goal-selector-banner');
  if (!banner) return;
  
  banner.querySelector('.goal-banner-content').innerHTML = `
    <div class="goal-confirmation">
      <div class="goal-confirm-icon">${goal.icon}</div>
      <h3>Perfect! We've personalized your experience.</h3>
      <p>You'll see resources for: <strong>${goal.title}</strong></p>
      <p class="goal-confirm-hint">You can change this anytime in settings</p>
    </div>
  `;
}

/**
 * User dismisses without selecting
 */
function dismissGoalSelector() {
  const banner = document.getElementById('goal-selector-banner');
  if (banner) {
    banner.remove();
  }
  
  // Mark as dismissed (don't show again this session)
  sessionStorage.setItem('3mpwrapp_goalDismissed', 'true');
}

/**
 * User chooses to browse without personalization
 */
function skipGoalSelection() {
  localStorage.setItem('3mpwrapp_goal', 'exploring');
  localStorage.setItem('3mpwrapp_persona', 'explorer');
  localStorage.setItem('3mpwrapp_progress', '0');
  
  dismissGoalSelector();
}

/**
 * Allow user to reset their goal
 */
function resetGoal() {
  localStorage.removeItem('3mpwrapp_goal');
  localStorage.removeItem('3mpwrapp_persona');
  localStorage.removeItem('3mpwrapp_features');
  localStorage.removeItem('3mpwrapp_helpPriority');
  // Keep progress - they've earned it
  
  showGoalSelector();
}

/**
 * Inject CSS for goal selector
 */
function injectGoalStyles() {
  if (document.getElementById('goal-onboarding-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'goal-onboarding-styles';
  styles.textContent = `
    #goal-selector-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--modal-overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-in;
      padding: 1rem;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .goal-banner-content {
      background: var(--modal-bg);
      border-radius: 12px;
      padding: 2rem;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      color: var(--text-color);
      opacity: 1;
      border: 2px solid var(--border-color);
    }
    
    /* Ensure solid backgrounds for all modal elements */
    .goal-banner-content,
    .goal-banner-content * {
      background-color: inherit;
    }
    
    .goal-banner-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: var(--text-secondary);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .goal-banner-close:hover {
      background: var(--button-hover-bg);
      color: var(--text-color);
    }
    
    #goal-selector-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      color: var(--text-color);
    }
    
    .goal-banner-content > p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }
    
    .goal-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .goal-option {
      background: var(--card-bg);
      border: 2px solid var(--card-border);
      border-radius: 8px;
      padding: 1.25rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .goal-option:hover,
    .goal-option:focus {
      border-color: var(--link-color);
      background: var(--card-hover-bg);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
    }
    
    .goal-icon {
      font-size: 2rem;
      display: block;
    }
    
    .goal-title {
      font-weight: 600;
      font-size: 1rem;
      color: var(--text-color);
      display: block;
    }
    
    .goal-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      display: block;
      line-height: 1.4;
    }
    
    .goal-banner-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
    
    .goal-skip-button {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.875rem;
      text-decoration: underline;
    }
    
    .goal-skip-button:hover {
      color: var(--text-color);
    }
    
    .goal-confirmation {
      text-align: center;
      padding: 2rem 0;
    }
    
    .goal-confirm-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .goal-confirmation h3 {
      color: #4CAF50;
      margin-bottom: 0.5rem;
    }
    
    .goal-confirm-hint {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 1rem;
    }
    
    @media (max-width: 768px) {
      .goal-options {
        grid-template-columns: 1fr;
      }
    }
  `;
  
  document.head.appendChild(styles);
}

// Expose resetGoal globally (for settings/debug use)
window.resetGoal = resetGoal;

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoalOnboarding);
} else {
  initGoalOnboarding();
}
