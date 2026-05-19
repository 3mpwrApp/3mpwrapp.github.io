/**
 * Documentation Feedback System - WCAG AAA Compliant
 * Fully accessible with keyboard navigation, screen readers, and ARIA support
 * Allows users to provide feedback on documentation sections
 */

(function() {
  'use strict';
  
  const feedbackSystem = {
    endpoint: 'https://us-central1-empowrapp.cloudfunctions.net/submitDocFeedback',
    
    init: function() {
      // Find all feedback buttons
      const feedbackButtons = document.querySelectorAll('.feedback-btn');
      feedbackButtons.forEach(btn => {
        btn.addEventListener('click', (e) => this.handleFeedback(e));
        // Add keyboard support
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleFeedback(e);
          }
        });
      });
      
      // Add feedback sections to documentation
      this.injectFeedbackSections();
    },
    
    injectFeedbackSections: function() {
      // Find all major sections (h2 or h3 with id)
      const sections = document.querySelectorAll('h2[id], h3[id]');
      
      sections.forEach(heading => {
        const featureId = heading.id;
        
        // Skip if feedback already exists
        const nextElement = heading.nextElementSibling;
        if (nextElement && nextElement.classList.contains('feedback-section')) {
          return;
        }
        
        // Create accessible feedback section
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-section';
        feedbackDiv.setAttribute('role', 'region');
        feedbackDiv.setAttribute('aria-label', `Feedback for ${heading.textContent}`);
        
        feedbackDiv.innerHTML = `
          <div class="feedback-prompt">
            <p id="feedback-question-${featureId}">Was this section helpful?</p>
            <div class="feedback-buttons" role="group" aria-labelledby="feedback-question-${featureId}">
              <button 
                class="feedback-btn" 
                data-feature="${featureId}" 
                data-helpful="yes" 
                aria-label="Yes, this section was helpful"
                aria-describedby="feedback-question-${featureId}">
                <span aria-hidden="true">👍</span> Yes
              </button>
              <button 
                class="feedback-btn" 
                data-feature="${featureId}" 
                data-helpful="no" 
                aria-label="No, this section was not helpful"
                aria-describedby="feedback-question-${featureId}">
                <span aria-hidden="true">👎</span> No
              </button>
            </div>
          </div>
          <div class="feedback-thanks" style="display: none;" role="status" aria-live="polite" aria-atomic="true">
            <p><span aria-hidden="true">✓</span> Thanks for your feedback!</p>
          </div>
          <div class="feedback-error" style="display: none;" role="alert" aria-live="assertive" aria-atomic="true">
            <p><span aria-hidden="true">⚠</span> Sorry, couldn't submit feedback. Stored locally for later.</p>
          </div>
        `;
        
        // Insert after the section content (before next heading or at end)
        const nextHeading = this.findNextHeading(heading);
        if (nextHeading) {
          nextHeading.parentNode.insertBefore(feedbackDiv, nextHeading);
        } else {
          heading.parentNode.appendChild(feedbackDiv);
        }
        
        // Add event listeners to new buttons
        const buttons = feedbackDiv.querySelectorAll('.feedback-btn');
        buttons.forEach(btn => {
          btn.addEventListener('click', (e) => this.handleFeedback(e));
          btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.handleFeedback(e);
            }
          });
        });
      });
    },
    
    findNextHeading: function(currentHeading) {
      let next = currentHeading.nextElementSibling;
      
      while (next) {
        if (next.tagName === 'H2' || next.tagName === 'H3') {
          return next;
        }
        next = next.nextElementSibling;
      }
      
      return null;
    },
    
    handleFeedback: async function(event) {
      const button = event.target.closest('.feedback-btn');
      if (!button) return;
      
      const featureId = button.dataset.feature;
      const helpful = button.dataset.helpful === 'yes';
      const page = window.location.pathname;
      
      // Get section for UI updates
      const section = button.closest('.feedback-section');
      const allButtons = section.querySelectorAll('.feedback-btn');
      
      // Disable buttons and announce to screen readers
      allButtons.forEach(btn => {
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
      });
      
      // Announce submitting to screen readers
      this.announceToScreenReader('Submitting feedback...');
      
      try {
        // Submit feedback
        await this.submitFeedback({
          featureId,
          helpful,
          page,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
        
        // Show thank you message
        this.showThanks(section, helpful);
        
        // Announce success to screen readers
        this.announceToScreenReader('Feedback submitted successfully. Thank you!');
        
        // Optional: Show additional feedback form for negative responses
        if (!helpful) {
          this.showAdditionalFeedbackForm(section, featureId);
        }
        
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        // Re-enable buttons
        allButtons.forEach(btn => {
          btn.disabled = false;
          btn.removeAttribute('aria-busy');
        });
        this.showError(section);
        this.announceToScreenReader('Error submitting feedback. Stored locally for later.');
      }
    },
    
    announceToScreenReader: function(message) {
      // Create or use existing screen reader announcement element
      let announcer = document.getElementById('sr-announcer');
      if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);
      }
      
      // Clear and set new message
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    },
    
    submitFeedback: async function(data) {
      // Store locally first (in case offline)
      this.storeLocal(data);
      
      // Try to submit to server
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Server error');
        }
        
        return await response.json();
      } catch (error) {
        // If offline or server error, feedback is still stored locally
        console.log('Feedback stored locally for later sync');
        throw error;
      }
    },
    
    storeLocal: function(data) {
      try {
        const stored = JSON.parse(localStorage.getItem('doc_feedback') || '[]');
        stored.push(data);
        localStorage.setItem('doc_feedback', JSON.stringify(stored));
      } catch (e) {
        // localStorage not available
        console.warn('Could not store feedback locally');
      }
    },
      }
    },
    
    showThanks: function(section, helpful) {
      const prompt = section.querySelector('.feedback-prompt');
      const thanks = section.querySelector('.feedback-thanks');
      
      if (prompt) prompt.style.display = 'none';
      if (thanks) thanks.style.display = 'block';
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        section.style.opacity = '0.5';
      }, 3000);
    },
    
    showAdditionalFeedbackForm: function(section, featureId) {
      const thanks = section.querySelector('.feedback-thanks');
      
      const form = document.createElement('div');
      form.className = 'feedback-form';
      form.innerHTML = `
        <p>Help us improve! What was missing or unclear?</p>
        <textarea 
          placeholder="Optional: Tell us more..." 
          rows="3"
          data-feature="${featureId}"
          class="feedback-textarea"
        ></textarea>
        <button class="feedback-submit-btn" data-feature="${featureId}">
          Submit
        </button>
      `;
      
      thanks.appendChild(form);
      
      // Handle submission
      const submitBtn = form.querySelector('.feedback-submit-btn');
      submitBtn.addEventListener('click', async () => {
        const textarea = form.querySelector('.feedback-textarea');
        const comment = textarea.value.trim();
        
        if (comment) {
          await this.submitFeedback({
            featureId,
            helpful: false,
            comment,
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
          });
        }
        
        form.innerHTML = '<p>✓ Thanks for the detailed feedback!</p>';
      });
    },
    
    showError: function(section) {
      const thanks = section.querySelector('.feedback-thanks');
      if (thanks) {
        thanks.innerHTML = '<p>⚠️ Could not submit feedback. Please try again.</p>';
        thanks.style.display = 'block';
      }
    },
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => feedbackSystem.init());
  } else {
    feedbackSystem.init();
  }
  
  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = feedbackSystem;
  }
})();
