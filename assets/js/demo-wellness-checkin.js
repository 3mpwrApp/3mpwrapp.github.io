/**
 * Interactive Demo: Wellness Check-in
 * Simulates the mood and energy tracking workflow
 */

(function() {
  'use strict';
  
  const demo = {
    currentStep: 0,
    checkInData: {
      mood: null,
      energy: null,
      pain: null,
      sleep: null,
      notes: ''
    },
    
    steps: [
      {
        title: 'Wellness Check-in',
        description: 'Track your wellbeing daily to identify patterns and manage your recovery.',
        action: 'start',
        visual: 'welcome'
      },
      {
        title: 'How Are You Feeling?',
        description: 'Select the emoji that best represents your mood today.',
        action: 'mood',
        visual: 'mood-selector'
      },
      {
        title: 'Energy Level',
        description: 'How much energy do you have right now?',
        action: 'energy',
        visual: 'energy-slider'
      },
      {
        title: 'Pain Level',
        description: 'Rate your current pain level (0 = no pain).',
        action: 'pain',
        visual: 'pain-slider'
      },
      {
        title: 'Sleep Quality',
        description: 'How well did you sleep last night?',
        action: 'sleep',
        visual: 'sleep-selector'
      },
      {
        title: 'Add Notes (Optional)',
        description: 'Anything you want to remember about today?',
        action: 'notes',
        visual: 'notes-form'
      },
      {
        title: 'Check-in Complete!',
        description: 'Your wellness data is saved. View trends and insights in your dashboard.',
        action: 'complete',
        visual: 'success'
      }
    ],
    
    moods: [
      { emoji: '😊', label: 'Great', value: 5 },
      { emoji: '🙂', label: 'Good', value: 4 },
      { emoji: '😐', label: 'Okay', value: 3 },
      { emoji: '😕', label: 'Not Great', value: 2 },
      { emoji: '😞', label: 'Struggling', value: 1 }
    ],
    
    sleepOptions: [
      { emoji: '😴', label: 'Great', value: 5 },
      { emoji: '😌', label: 'Good', value: 4 },
      { emoji: '😪', label: 'Fair', value: 3 },
      { emoji: '😫', label: 'Poor', value: 2 },
      { emoji: '😖', label: 'Terrible', value: 1 }
    ],
    
    init: function() {
      const container = document.getElementById('demo-wellness-checkin');
      if (!container) return;
      
      this.render(container);
      this.attachEvents(container);
    },
    
    render: function(container) {
      const step = this.steps[this.currentStep];
      
      container.innerHTML = `
        <div class="demo-container wellness-demo" role="region" aria-label="Wellness Check-in Demo">
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
              <strong>Note:</strong> Real app includes trend charts, streak tracking, and insights.
            </p>
            <a href="empowrapp://wellness/check-in" class="app-link-btn">
              Start Real Check-ins in App
            </a>
          </div>
        </div>
      `;
    },
    
    renderVisual: function(type) {
      switch (type) {
        case 'welcome':
          return `
            <div class="demo-icon">💚</div>
            <div class="demo-subtitle">Daily Wellness Tracking</div>
            <div class="wellness-features">
              <div class="feature-item">📊 Trend Analysis</div>
              <div class="feature-item">🎯 Pattern Detection</div>
              <div class="feature-item">🔔 Smart Reminders</div>
            </div>
          `;
          
        case 'mood-selector':
          return `
            <div class="mood-grid">
              ${this.moods.map(mood => `
                <div class="mood-option ${this.checkInData.mood === mood.value ? 'selected' : ''}" 
                     data-mood="${mood.value}"
                     role="button"
                     aria-label="${mood.label}">
                  <div class="mood-emoji">${mood.emoji}</div>
                  <div class="mood-label">${mood.label}</div>
                </div>
              `).join('')}
            </div>
          `;
          
        case 'energy-slider':
          return `
            <div class="slider-container">
              <div class="slider-labels">
                <span>😴 Exhausted</span>
                <span>⚡ Energized</span>
              </div>
              <input type="range" 
                     min="0" 
                     max="10" 
                     value="${this.checkInData.energy || 5}" 
                     class="wellness-slider"
                     data-metric="energy">
              <div class="slider-value">${this.checkInData.energy || 5} / 10</div>
            </div>
          `;
          
        case 'pain-slider':
          return `
            <div class="slider-container">
              <div class="slider-labels">
                <span>😌 No Pain</span>
                <span>😣 Severe</span>
              </div>
              <input type="range" 
                     min="0" 
                     max="10" 
                     value="${this.checkInData.pain || 0}" 
                     class="wellness-slider pain-slider"
                     data-metric="pain">
              <div class="slider-value">${this.checkInData.pain || 0} / 10</div>
              <div class="pain-scale-hint">
                0 = No pain, 5 = Moderate, 10 = Worst imaginable
              </div>
            </div>
          `;
          
        case 'sleep-selector':
          return `
            <div class="sleep-grid">
              ${this.sleepOptions.map(option => `
                <div class="sleep-option ${this.checkInData.sleep === option.value ? 'selected' : ''}" 
                     data-sleep="${option.value}"
                     role="button"
                     aria-label="${option.label}">
                  <div class="sleep-emoji">${option.emoji}</div>
                  <div class="sleep-label">${option.label}</div>
                </div>
              `).join('')}
            </div>
          `;
          
        case 'notes-form':
          return `
            <div class="notes-container">
              <textarea class="wellness-notes" 
                        placeholder="Optional: What's helping? What made today better or worse?"
                        rows="6"
                        data-notes="true">${this.checkInData.notes}</textarea>
              <div class="notes-hint">
                💡 Tip: Noting patterns helps identify triggers and effective coping strategies
              </div>
            </div>
          `;
          
        case 'success':
          return `
            <div class="wellness-success">
              <div class="success-icon">✅</div>
              <div class="wellness-summary">
                <div class="summary-item">
                  <div class="summary-label">Mood</div>
                  <div class="summary-value">${this.getMoodEmoji(this.checkInData.mood)} ${this.getMoodLabel(this.checkInData.mood)}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Energy</div>
                  <div class="summary-value">${this.checkInData.energy || 5}/10</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Pain</div>
                  <div class="summary-value">${this.checkInData.pain || 0}/10</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Sleep</div>
                  <div class="summary-value">${this.getSleepEmoji(this.checkInData.sleep)} ${this.getSleepLabel(this.checkInData.sleep)}</div>
                </div>
              </div>
              <div class="streak-badge">🔥 3 day streak!</div>
              <div class="insight-card">
                <strong>💡 Insight:</strong> Your energy is highest on days when you sleep well. Try maintaining a consistent sleep schedule.
              </div>
            </div>
          `;
          
        default:
          return '';
      }
    },
    
    renderControls: function(step) {
      const buttons = [];
      
      if (this.currentStep > 0 && this.currentStep < this.steps.length - 1) {
        buttons.push('<button class="demo-btn demo-btn-secondary" data-action="prev">← Back</button>');
      }
      
      switch (step.action) {
        case 'start':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Start Check-in →</button>');
          break;
        case 'mood':
          const moodDisabled = this.checkInData.mood === null ? 'disabled' : '';
          buttons.push(`<button class="demo-btn demo-btn-primary" data-action="next" ${moodDisabled}>Continue →</button>`);
          break;
        case 'energy':
        case 'pain':
        case 'sleep':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Continue →</button>');
          break;
        case 'notes':
          buttons.push('<button class="demo-btn demo-btn-secondary" data-action="next">Skip</button>');
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="next">Save Check-in →</button>');
          break;
        case 'complete':
          buttons.push('<button class="demo-btn demo-btn-primary" data-action="restart">Do Another Check-in</button>');
          break;
      }
      
      return buttons.join(' ');
    },
    
    attachEvents: function(container) {
      container.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const mood = e.target.closest('[data-mood]')?.dataset.mood;
        const sleep = e.target.closest('[data-sleep]')?.dataset.sleep;
        
        if (mood) {
          this.checkInData.mood = parseInt(mood);
          this.updateVisual();
          const continueBtn = container.querySelector('[data-action="next"]');
          if (continueBtn) continueBtn.disabled = false;
        }
        
        if (sleep) {
          this.checkInData.sleep = parseInt(sleep);
          this.updateVisual();
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
      
      container.addEventListener('input', (e) => {
        const metric = e.target.dataset.metric;
        const notes = e.target.dataset.notes;
        
        if (metric) {
          this.checkInData[metric] = parseInt(e.target.value);
          const valueDisplay = e.target.nextElementSibling;
          if (valueDisplay) {
            valueDisplay.textContent = `${e.target.value} / 10`;
          }
        }
        
        if (notes) {
          this.checkInData.notes = e.target.value;
        }
      });
    },
    
    updateVisual: function() {
      const container = document.getElementById('demo-wellness-checkin');
      const step = this.steps[this.currentStep];
      const visual = container.querySelector('.demo-visual');
      if (visual) {
        visual.innerHTML = this.renderVisual(step.visual);
      }
    },
    
    getMoodEmoji: function(value) {
      const mood = this.moods.find(m => m.value === value);
      return mood ? mood.emoji : '😐';
    },
    
    getMoodLabel: function(value) {
      const mood = this.moods.find(m => m.value === value);
      return mood ? mood.label : 'Okay';
    },
    
    getSleepEmoji: function(value) {
      const sleep = this.sleepOptions.find(s => s.value === value);
      return sleep ? sleep.emoji : '😪';
    },
    
    getSleepLabel: function(value) {
      const sleep = this.sleepOptions.find(s => s.value === value);
      return sleep ? sleep.label : 'Fair';
    },
    
    nextStep: function() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        const container = document.getElementById('demo-wellness-checkin');
        this.render(container);
        this.attachEvents(container);
      }
    },
    
    prevStep: function() {
      if (this.currentStep > 0) {
        this.currentStep--;
        const container = document.getElementById('demo-wellness-checkin');
        this.render(container);
        this.attachEvents(container);
      }
    },
    
    restart: function() {
      this.currentStep = 0;
      this.checkInData = {
        mood: null,
        energy: null,
        pain: null,
        sleep: null,
        notes: ''
      };
      const container = document.getElementById('demo-wellness-checkin');
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
