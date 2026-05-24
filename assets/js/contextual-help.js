/**
 * Contextual Help System
 * 
 * Provides intelligent, persona-aware help throughout the website.
 * Shows relevant help based on user's role, progress, and current context.
 */

(function() {
  'use strict';

  const PERSONA_KEY = '3mpwrapp_persona';
  const PROGRESS_KEY = '3mpwrapp_progress';

  // Help content database
  const HELP_CONTENT = {
    'download-app': {
      personas: ['injured-worker', 'explorer', 'all'],
      progressMin: 0,
      title: 'Downloading 3mpwrApp™',
      content: `
        <p>Available on multiple platforms:</p>
        <ul>
          <li><strong>Android:</strong> Google Play Store (Coming soon)</li>
          <li><strong>iOS:</strong> Apple App Store (Coming soon)</li>
          <li><strong>Web:</strong> <a href="https://beta.3mpwrapp.ca">beta.3mpwrapp.ca</a> (Available now)</li>
        </ul>
        <p><small>Beta testing is currently open - join the waitlist!</small></p>
      `,
    },

    'claim-filing': {
      personas: ['injured-worker'],
      progressMin: 0,
      title: 'Filing Your Claim',
      content: `
        <p>Essential steps:</p>
        <ol>
          <li>Report injury to employer immediately</li>
          <li>Seek medical treatment and get documentation</li>
          <li>File Form 7 (Worker's Report of Injury) within 6 months</li>
          <li>Keep copies of everything</li>
        </ol>
        <p><a href="/resources/filing-guide">View detailed filing guide →</a></p>
      `,
    },

    'evidence-management': {
      personas: ['injured-worker', 'advocate'],
      progressMin: 15,
      title: 'Managing Evidence',
      content: `
        <p>Organize your evidence effectively:</p>
        <ul>
          <li><strong>Medical:</strong> Doctor's notes, test results, prescriptions</li>
          <li><strong>Employment:</strong> Pay stubs, job descriptions, incident reports</li>
          <li><strong>Personal:</strong> Pain journals, daily activity logs</li>
        </ul>
        <p><small>Tip: Take photos of injuries regularly to document progression</small></p>
      `,
    },

    'tribunal-prep': {
      personas: ['injured-worker', 'advocate', 'legal'],
      progressMin: 30,
      title: 'Preparing for Tribunal',
      content: `
        <p>Key preparation steps:</p>
        <ol>
          <li>Review all evidence and create a timeline</li>
          <li>Prepare your opening statement (5-10 minutes)</li>
          <li>Practice answering common questions</li>
          <li>Bring organized evidence binder</li>
          <li>Arrive 30 minutes early</li>
        </ol>
        <p><a href="/resources/tribunal-guide">Full tribunal preparation guide →</a></p>
      `,
    },

    'research-database': {
      personas: ['legal', 'advocate', 'injured-worker'],
      progressMin: 25,
      title: 'Using the Research Database',
      content: `
        <p>Search 134,000+ tribunal decisions:</p>
        <ul>
          <li><strong>Keyword search:</strong> Find decisions with specific terms</li>
          <li><strong>Filters:</strong> Narrow by date, jurisdiction, outcome</li>
          <li><strong>AI summaries:</strong> Get plain-language explanations</li>
        </ul>
        <p><small>Pro tip: Search for your injury type to find similar cases</small></p>
      `,
    },

    'ai-assistant': {
      personas: ['injured-worker', 'advocate'],
      progressMin: 20,
      title: 'AI Advocacy Assistant',
      content: `
        <p>What can AI do for you:</p>
        <ul>
          <li>Draft appeal letters and objections</li>
          <li>Summarize complex medical/legal documents</li>
          <li>Explain tribunal decisions in plain language</li>
          <li>Prepare cross-examination questions</li>
        </ul>
        <p><small>Your data stays private - AI runs on your device or with your own API key</small></p>
      `,
    },

    'community-support': {
      personas: ['injured-worker', 'advocate'],
      progressMin: 30,
      title: 'Community Support',
      content: `
        <p>Connect with others who understand:</p>
        <ul>
          <li>Share experiences and advice</li>
          <li>Find local support groups</li>
          <li>Read success stories for inspiration</li>
          <li>Post anonymously if you prefer</li>
        </ul>
        <p><small>Moderated community - respectful, supportive, and safe</small></p>
      `,
    },

    'partnerships': {
      personas: ['legal', 'organization'],
      progressMin: 0,
      title: 'Partnership Opportunities',
      content: `
        <p>Ways to partner with 3mpwrApp:</p>
        <ul>
          <li><strong>Legal clinics:</strong> Featured listing, referral integration</li>
          <li><strong>Organizations:</strong> Bulk user management, co-branding</li>
          <li><strong>Advocates:</strong> Training resources, client tools</li>
        </ul>
        <p><a href="/partnerships/">Learn more about partnerships →</a></p>
      `,
    },
  };

  // Create help tooltip
  function createTooltip(helpId) {
    const help = HELP_CONTENT[helpId];
    if (!help) return null;

    // Check if user's persona matches
    const persona = localStorage.getItem(PERSONA_KEY);
    if (persona && help.personas && !help.personas.includes('all') && !help.personas.includes(persona)) {
      return null;
    }

    // Check if user's progress meets minimum
    const progress = parseInt(localStorage.getItem(PROGRESS_KEY) || '0', 10);
    if (help.progressMin && progress < help.progressMin) {
      return null;
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'help-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-labelledby', `help-title-${helpId}`);
    tooltip.innerHTML = `
      <div class="help-tooltip-header">
        <h4 id="help-title-${helpId}">${help.title}</h4>
        <button class="help-close" aria-label="Close help">&times;</button>
      </div>
      <div class="help-tooltip-content">
        ${help.content}
      </div>
    `;

    return tooltip;
  }

  // Show tooltip
  function showHelp(trigger, helpId) {
    // Remove any existing tooltips
    document.querySelectorAll('.help-tooltip').forEach(t => t.remove());

    const tooltip = createTooltip(helpId);
    if (!tooltip) return;

    document.body.appendChild(tooltip);

    // Position tooltip near trigger
    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = rect.bottom + window.scrollY + 10;
    let left = rect.left + window.scrollX;

    // Adjust if tooltip would go off-screen
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 20;
    }

    if (top + tooltipRect.height > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - tooltipRect.height - 10;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Close button
    tooltip.querySelector('.help-close').addEventListener('click', () => {
      tooltip.remove();
    });

    // Track help view
    if (typeof window.trackHelpView === 'function') {
      window.trackHelpView(helpId);
    }
  }

  // Add help icon to elements with data-help attribute
  function initHelpTriggers() {
    document.querySelectorAll('[data-help]').forEach(element => {
      if (element.classList.contains('help-trigger-initialized')) return;

      const helpId = element.getAttribute('data-help');
      const helpItem = HELP_CONTENT[helpId];
      
      // Add help icon
      const icon = document.createElement('span');
      icon.className = 'help-icon';
      icon.innerHTML = '?';
      icon.title = 'Click for help';
      icon.setAttribute('role', 'button');
      icon.setAttribute('tabindex', '0');
      icon.setAttribute('aria-label', `Get help: ${helpItem ? helpItem.title : 'Click for help'}`);
      
      // Position icon
      if (element.style.position === '' || element.style.position === 'static') {
        element.style.position = 'relative';
      }
      element.appendChild(icon);

      // Show help on click
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        showHelp(element, helpId);
      });

      // Keyboard accessibility
      icon.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showHelp(element, helpId);
        }
      });

      element.classList.add('help-trigger-initialized');
    });
  }

  // Inject CSS
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .help-icon {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        background: #4CAF50;
        color: white;
        border-radius: 50%;
        font-size: 14px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: help;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

      .help-icon:hover {
        background: #45a049;
        transform: scale(1.1);
      }

      .help-tooltip {
        position: absolute;
        background: white;
        border: 2px solid #4CAF50;
        border-radius: 8px;
        padding: 0;
        max-width: 400px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: fadeIn 0.2s ease;
      }

      .help-tooltip-header {
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 6px 6px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .help-tooltip-header h4 {
        margin: 0;
        font-size: 1rem;
      }

      .help-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        line-height: 1;
      }

      .help-close:hover {
        opacity: 0.8;
      }

      .help-tooltip-content {
        padding: 15px;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .help-tooltip-content p:first-child {
        margin-top: 0;
      }

      .help-tooltip-content p:last-child {
        margin-bottom: 0;
      }

      .help-tooltip-content ul,
      .help-tooltip-content ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
      }

      .help-tooltip-content li {
        margin-bottom: 0.25rem;
      }

      .help-tooltip-content a {
        color: #4CAF50;
        text-decoration: none;
      }

      .help-tooltip-content a:hover {
        text-decoration: underline;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 768px) {
        .help-tooltip {
          max-width: 90vw;
          left: 5vw !important;
          right: 5vw !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Close tooltip when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.help-tooltip') && !e.target.closest('.help-icon')) {
      document.querySelectorAll('.help-tooltip').forEach(t => t.remove());
    }
  });

  // Initialize
  function init() {
    injectStyles();
    initHelpTriggers();

    // Re-initialize on dynamic content changes
    const observer = new MutationObserver(() => {
      initHelpTriggers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
