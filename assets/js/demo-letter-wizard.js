/**
 * Interactive Demo: Letter Wizard
 * Simulates the appeal letter generation workflow
 */

(function() {
  'use strict';
  
  const demo = {
    currentStep: 0,
    selectedTemplate: null,
    letterData: {},
    
    steps: [
      {
        title: 'Letter Wizard',
        description: 'Generate professional appeal letters with AI-powered templates and guidance.',
        action: 'start',
        visual: 'welcome'
      },
      {
        title: 'Choose Your Situation',
        description: 'Select the type of letter you need to write.',
        action: 'select-template',
        visual: 'template-picker'
      },
      {
        title: 'Your Information',
        description: 'Add your details - these will be securely encrypted and never shared.',
        action: 'fill-form',
        visual: 'info-form'
      },
      {
        title: 'Review & Customize',
        description: 'Your letter is ready! Review and edit as needed.',
        action: 'review',
        visual: 'letter-preview'
      },
      {
        title: 'Export & Use',
        description: 'Download as PDF, Word doc, or copy to clipboard.',
        action: 'export',
        visual: 'export-options'
      }
    ],
    
    templates: [
      {
        id: 'reconsideration',
        icon: '📝',
        title: 'Request Reconsideration',
        description: 'Ask for a decision to be reviewed',
        complexity: 'Simple'
      },
      {
        id: 'medical-info',
        icon: '🏥',
        title: 'Medical Information Request',
        description: 'Request your medical records or reports',
        complexity: 'Simple'
      },
      {
        id: 'appeal-denial',
        icon: '⚖️',
        title: 'Appeal a Denial',
        description: 'Formal appeal of a denied claim',
        complexity: 'Standard'
      },
      {
        id: 'wsib-complaint',
        icon: '📋',
        title: 'WSIB Complaint',
        description: 'File a formal complaint about service',
        complexity: 'Standard'
      }
    ],
    
    init: function() {
      const container = document.getElementById('demo-letter-wizard');
      if (!container) return;
      
      this.render(container);
      this.attachEvents(container);
    },
    
    render: function(container) {
      const step = this.steps[this.currentStep];
      
      container.innerHTML = `
        <div class="demo-container" role="region" aria-label="Letter Wizard Demo">
          <div class="demo-progress">
            <div class="progress-bar" style="width: ${(this.currentStep / (this.steps.length - 1)) * 100}%"></div>
          </div>
          
          <div class="demo-content">
            <div class="demo-visual demo-visual-${step.visual}">
              ${this.renderVisual(step.visual)}
            </div>
            
            <div class="demo-text">
              <h3>${step.title}</h3>
              <p>${step.description}</p>
            </div>
            
            <div class="demo-controls">
              ${this.renderControls(step)}
            </div>
          </div>
          
          <div class="demo-footer">
            <p class="demo-note">
              <strong>Note:</strong> This is a simulation. No data is saved or transmitted.
            </p>
            <a href="empowrapp://advocacy/letter-wizard" class="app-link-btn">
              Create Real Letters in App
            </a>
          </div>
        </div>
      `;
    },
    
    renderVisual: function(type) {
      switch (type) {
        case 'welcome':
          return `
            <div class="demo-icon">✉️</div>
            <div class="demo-subtitle">Professional Letter Generation</div>
            <div class="letter-features">
              <div class="feature-badge">✓ AI-Powered Templates</div>
              <div class="feature-badge">✓ Legal Language Support</div>
              <div class="feature-badge">✓ Export Multiple Formats</div>
            </div>
          `;
          
        case 'template-picker':
          return `
            <div class="template-grid">
              ${this.templates.map(template => `
                <div class="template-card ${this.selectedTemplate === template.id ? 'selected' : ''}" 
                     data-template="${template.id}">
                  <div class="template-icon">${template.icon}</div>
                  <div class="template-title">${template.title}</div>
                  <div class="template-description">${template.description}</div>
                  <div class="template-complexity">${template.complexity} Mode</div>
                </div>
              `).join('')}
            </div>
          `;
          
        case 'info-form':
          return `
            <form class="demo-form letter-form">
              <div class="form-group">
                <label>Your Name</label>
                <input type="text" value="Jane Smith" readonly>
              </div>
              <div class="form-group">
                <label>Claim Number</label>
                <input type="text" value="12345678" readonly>
              </div>
              <div class="form-group">
                <label>Date of Injury</label>
                <input type="date" value="2025-06-15" readonly>
              </div>
              <div class="form-group">
                <label>What happened? (Brief summary)</label>
                <textarea rows="4" readonly>I was denied benefits for my workplace injury on March 1, 2026. I believe this decision was made in error because new medical evidence was not considered.</textarea>
              </div>
              <div class="form-group">
                <label>What do you want? (Desired outcome)</label>
                <textarea rows="3" readonly>I request that my claim be reconsidered with the new medical evidence from Dr. Johnson dated April 2026.</textarea>
              </div>
            </form>
          `;
          
        case 'letter-preview':
          return `
            <div class="letter-preview">
              <div class="letter-header">
                <div class="letter-date">May 19, 2026</div>
                <div class="letter-to">
                  <strong>To:</strong> Workplace Safety and Insurance Board<br>
                  Claims Department<br>
                  200 Front Street West<br>
                  Toronto, ON M5V 3J1
                </div>
              </div>
              
              <div class="letter-body">
                <p><strong>Re: Request for Reconsideration - Claim #12345678</strong></p>
                
                <p>Dear Claims Adjudicator,</p>
                
                <p>I am writing to respectfully request reconsideration of the decision to deny benefits for my workplace injury claim (Claim #12345678), which was denied on March 1, 2026.</p>
                
                <p>I believe this decision was made in error because new medical evidence was not considered at the time of the initial decision. Specifically, a comprehensive medical report from Dr. Johnson dated April 2026 provides additional documentation that was not available during the original review.</p>
                
                <p>I respectfully request that my claim be reconsidered with the new medical evidence from Dr. Johnson dated April 2026. I have attached this documentation for your review.</p>
                
                <p>I am available to provide any additional information that may assist in this reconsideration. Please feel free to contact me at your earliest convenience.</p>
                
                <p>Thank you for your time and attention to this matter.</p>
                
                <p>Sincerely,<br>
                Jane Smith</p>
              </div>
              
              <div class="letter-actions">
                <button class="edit-btn" disabled>✏️ Edit Letter</button>
                <button class="ai-improve-btn" disabled>✨ AI Improve</button>
              </div>
            </div>
          `;
          
        case 'export-options':
          return `
            <div class="export-options-grid">
              <div class="export-option" data-format="pdf">
                <div class="export-icon">📄</div>
                <div class="export-title">Download PDF</div>
                <div class="export-description">Print-ready format</div>
              </div>
              
              <div class="export-option" data-format="docx">
                <div class="export-icon">📝</div>
                <div class="export-title">Download Word</div>
                <div class="export-description">Edit in Microsoft Word</div>
              </div>
              
              <div class="export-option" data-format="email">
                <div class="export-icon">✉️</div>
                <div class="export-title">Send via Email</div>
                <div class="export-description">Send directly from app</div>
              </div>
              
              <div class="export-option" data-format="clipboard">
                <div class="export-icon">📋</div>
                <div class="export-title">Copy to Clipboard</div>
                <div class="export-description">Paste anywhere</div>
              </div>
            </div>
            <div class="security-note">
              🔒 All letters are encrypted and stored locally on your device only
            </div>
          `;
          
        default:
          return '';
      }
    },
    
    renderControls: function(step) {
      const buttons = [];
      
      if (this.currentStep > 0) {
        buttons.push('<button class="demo-btn demo-btn-secondary" data-action="prev">← Back</button>');
      }
      
      switch (step.action) {
        case 'start':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Start Letter Wizard →</button>');
          break;
        case 'select-template':
          const disabled = !this.selectedTemplate ? 'disabled' : '';
          buttons.push(`<button class="demo-btn demo-btn-primary" data-action="next" ${disabled}>Continue with Template →</button>`);
          break;
        case 'fill-form':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Generate Letter →</button>');
          break;
        case 'review':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Export Letter →</button>');
          break;
        case 'export':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="restart">Create Another Letter</button>');
          break;
      }
      
      return buttons.join(' ');
    },
    
    attachEvents: function(container) {
      container.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const template = e.target.closest('[data-template]')?.dataset.template;
        
        if (template) {
          this.selectTemplate(template);
          const continueBtn = container.querySelector('[data-action="next"]');
          if (continueBtn) continueBtn.disabled = false;
        }
        
        switch (action) {
          case 'next':
            this.nextStep();
            break;
          case 'prev':
            this.prevStep();
            break;
          case 'restart':
            this.restart();
            break;
        }
      });
    },
    
    selectTemplate: function(templateId) {
      this.selectedTemplate = templateId;
      const container = document.getElementById('demo-letter-wizard');
      
      // Update visual selection
      container.querySelectorAll('.template-card').forEach(card => {
        if (card.dataset.template === templateId) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
    },
    
    nextStep: function() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        const container = document.getElementById('demo-letter-wizard');
        this.render(container);
        this.attachEvents(container);
      }
    },
    
    prevStep: function() {
      if (this.currentStep > 0) {
        this.currentStep--;
        const container = document.getElementById('demo-letter-wizard');
        this.render(container);
        this.attachEvents(container);
      }
    },
    
    restart: function() {
      this.currentStep = 0;
      this.selectedTemplate = null;
      const container = document.getElementById('demo-letter-wizard');
      this.render(container);
      this.attachEvents(container);
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => demo.init());
  } else {
    demo.init();
  }
})();
