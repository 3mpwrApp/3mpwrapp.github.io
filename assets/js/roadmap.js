/**
 * Roadmap Timeline JavaScript
 * Handles expand/collapse functionality for timeline phases
 */

// Roadmap Timeline Interactivity
(function() {
  const expandButtons = document.querySelectorAll('.timeline-expand');
  
  expandButtons.forEach(button => {
    button.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const extraContent = this.nextElementSibling;
      
      if (isExpanded) {
        // Collapse
        this.setAttribute('aria-expanded', 'false');
        this.querySelector('.expand-text').textContent = 'Show Details';
        extraContent.hidden = true;
      } else {
        // Expand
        this.setAttribute('aria-expanded', 'true');
        this.querySelector('.expand-text').textContent = 'Hide Details';
        extraContent.hidden = false;
        
        // Scroll into view smoothly
        setTimeout(() => {
          extraContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  });
  
  // Keyboard accessibility (Enter and Space)
  expandButtons.forEach(button => {
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
})();
