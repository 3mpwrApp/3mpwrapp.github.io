/**
 * Dropdown Navigation
 * Handles accessible dropdown menus in the main navigation
 * WCAG 2.1 AA compliant with keyboard navigation
 */

(function() {
  'use strict';

  // Initialize all dropdowns
  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    dropdowns.forEach(function(dropdown) {
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      const menu = dropdown.querySelector('.nav-dropdown-menu');
      
      if (!toggle || !menu) return;
      
      // Click to toggle
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        // Close all other dropdowns
        closeAllDropdowns();
        
        if (!isExpanded) {
          toggle.setAttribute('aria-expanded', 'true');
          menu.style.display = 'block';
          
          // Focus first link in menu
          const firstLink = menu.querySelector('a');
          if (firstLink) {
            setTimeout(function() { firstLink.focus(); }, 50);
          }
        }
      });
      
      // Keyboard navigation
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        } else if (e.key === 'Escape') {
          closeDropdown(dropdown);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
          if (!isExpanded) {
            toggle.click();
          } else {
            const firstLink = menu.querySelector('a');
            if (firstLink) firstLink.focus();
          }
        }
      });
      
      // Keyboard navigation within menu
      menu.addEventListener('keydown', function(e) {
        const links = Array.from(menu.querySelectorAll('a'));
        const currentIndex = links.indexOf(document.activeElement);
        
        if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown(dropdown);
          toggle.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % links.length;
          links[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = currentIndex <= 0 ? links.length - 1 : currentIndex - 1;
          links[prevIndex].focus();
        } else if (e.key === 'Tab' && !e.shiftKey && currentIndex === links.length - 1) {
          // Close dropdown when tabbing out
          closeDropdown(dropdown);
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      const isDropdownClick = e.target.closest('.nav-dropdown');
      if (!isDropdownClick) {
        closeAllDropdowns();
      }
    });
    
    // Close dropdowns on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    });
  }
  
  function closeDropdown(dropdown) {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    const menu = dropdown.querySelector('.nav-dropdown-menu');
    
    if (toggle && menu) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.style.display = 'none';
    }
  }
  
  function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(function(dropdown) {
      closeDropdown(dropdown);
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})();
