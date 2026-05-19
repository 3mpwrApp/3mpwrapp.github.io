/**
 * Interactive Demo: Evidence Upload
 * Simulates the evidence locker document upload workflow
 */

(function() {
  'use strict';
  
  const demo = {
    currentStep: 0,
    uploadedFiles: [],
    
    steps: [
      {
        title: 'Welcome to Evidence Locker',
        description: 'Securely store and organize all your case documents with military-grade encryption.',
        action: 'next',
        visual: 'welcome'
      },
      {
        title: 'Choose a Document',
        description: 'Select a file from your device. Supported: PDF, images, Word docs.',
        action: 'upload',
        visual: 'file-picker'
      },
      {
        title: 'Add Details',
        description: 'Categorize your document and add notes for easy searching.',
        action: 'categorize',
        visual: 'form'
      },
      {
        title: 'Encrypting...',
        description: 'Your document is being encrypted with AES-256-GCM before storage.',
        action: 'encrypt',
        visual: 'loading'
      },
      {
        title: 'Upload Complete!',
        description: 'Your document is now safely stored and accessible only to you.',
        action: 'finish',
        visual: 'success'
      }
    ],
    
    init: function() {
      const container = document.getElementById('demo-evidence-upload');
      if (!container) return;
      
      this.render(container);
      this.attachEvents(container);
    },
    
    render: function(container) {
      const step = this.steps[this.currentStep];
      
      container.innerHTML = `
        <div class="demo-container" role="region" aria-label="Evidence Upload Demo">
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
              <strong>Note:</strong> This is a simulation. No actual files are uploaded.
            </p>
            <a href="empowrapp://advocacy/evidence-locker" class="app-link-btn">
              Try the Real Feature in App
            </a>
          </div>
        </div>
      `;
    },
    
    renderVisual: function(type) {
      switch (type) {
        case 'welcome':
          return `
            <div class="demo-icon">🗂️</div>
            <div class="demo-subtitle">Secure Document Storage</div>
          `;
          
        case 'file-picker':
          return `
            <div class="file-picker-sim">
              <button class="file-picker-btn" data-action="select-file">
                📄 Choose File
              </button>
              <p class="file-types">PDF, PNG, JPG, DOCX</p>
            </div>
          `;
          
        case 'form':
          return `
            <form class="demo-form">
              <div class="form-group">
                <label>Document Name</label>
                <input type="text" value="Medical Report - Dr. Smith.pdf" readonly>
              </div>
              <div class="form-group">
                <label>Category</label>
                <select>
                  <option>Medical Records</option>
                  <option>Legal Documents</option>
                  <option>Correspondence</option>
                  <option>Evidence</option>
                </select>
              </div>
              <div class="form-group">
                <label>Notes (optional)</label>
                <textarea placeholder="Add any notes to help you find this later..."></textarea>
              </div>
            </form>
          `;
          
        case 'loading':
          return `
            <div class="demo-loading">
              <div class="spinner"></div>
              <div class="encryption-steps">
                <div class="step completed">✓ File validated</div>
                <div class="step completed">✓ Generating encryption key</div>
                <div class="step active">⟳ Encrypting document...</div>
                <div class="step">Storing securely</div>
              </div>
            </div>
          `;
          
        case 'success':
          return `
            <div class="demo-success">
              <div class="success-icon">✅</div>
              <div class="success-details">
                <p><strong>1 document uploaded</strong></p>
                <p class="encrypted-badge">🔒 Encrypted with AES-256-GCM</p>
                <p class="offline-badge">📱 Available offline</p>
              </div>
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
        case 'next':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Get Started →</button>');
          break;
        case 'upload':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Continue →</button>');
          break;
        case 'categorize':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Upload Document</button>');
          break;
        case 'encrypt':
          // Auto-advance after 2 seconds
          setTimeout(() => this.nextStep(), 2000);
          break;
        case 'finish':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="restart">Try Again</button>');
          break;
      }
      
      return buttons.join(' ');
    },
    
    attachEvents: function(container) {
      container.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        
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
          case 'select-file':
            e.preventDefault();
            this.simulateFilePicker(container);
            break;
        }
      });
    },
    
    simulateFilePicker: function(container) {
      const picker = container.querySelector('.file-picker-sim');
      picker.innerHTML = `
        <div class="file-selected">
          <div class="file-icon">📄</div>
          <div class="file-info">
            <div class="file-name">Medical Report - Dr. Smith.pdf</div>
            <div class="file-size">2.4 MB</div>
          </div>
          <div class="file-status">✓ Ready</div>
        </div>
      `;
    },
    
    nextStep: function() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        const container = document.getElementById('demo-evidence-upload');
        this.render(container);
        this.attachEvents(container);
      }
    },
    
    prevStep: function() {
      if (this.currentStep > 0) {
        this.currentStep--;
        const container = document.getElementById('demo-evidence-upload');
        this.render(container);
        this.attachEvents(container);
      }
    },
    
    restart: function() {
      this.currentStep = 0;
      const container = document.getElementById('demo-evidence-upload');
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
