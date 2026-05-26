/**
 * 3mpwrApp™ - Header Spoon Counter & Emergency Mode
 * Copyright (c) 2025-2026 Lissa Beaulieu, operating as 3mpwrApp (Sole Proprietorship)
 * 
 * This file is part of 3mpwrApp™.
 * Licensed under AGPL-3.0. See LICENSE file in the project root.
 * 
 * Header Spoon Counter & Emergency Mode
 * Compact version for header integration
 */

(function() {
  'use strict';
  
  let spoonCount = 5;
  let emergencyMode = false;
  
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // Load saved state
    spoonCount = parseInt(localStorage.getItem('spoonCount')) || 5;
    emergencyMode = localStorage.getItem('emergencyMode') === 'true';
    
    // Setup header controls
    setupHeaderSpoonCounter();
    setupHeaderEmergencyMode();
    
    // Apply saved emergency mode
    if (emergencyMode) {
      document.body.classList.add('emergency-mode');
    }
  }
  
  function setupHeaderSpoonCounter() {
    const countEl = document.getElementById('header-spoon-count');
    const useBtn = document.getElementById('header-spoon-use');
    const restBtn = document.getElementById('header-spoon-rest');
    
    if (!countEl || !useBtn || !restBtn) return;
    
    // Update display
    function updateDisplay() {
      countEl.textContent = spoonCount;
      countEl.style.color = spoonCount <= 1 ? '#dc2626' : '';
      localStorage.setItem('spoonCount', spoonCount);
    }
    
    // Use button
    useBtn.addEventListener('click', function() {
      if (spoonCount > 0) {
        spoonCount--;
        updateDisplay();
        announceToScreenReader(`Energy used. ${spoonCount} spoons remaining`);
        
        if (spoonCount === 1) {
          announceToScreenReader('Warning: Low energy. Consider taking a break.', 'assertive');
        } else if (spoonCount === 0) {
          announceToScreenReader('No energy remaining. Please rest.', 'assertive');
        }
      }
    });
    
    // Rest button
    restBtn.addEventListener('click', function() {
      if (spoonCount < 10) {
        spoonCount++;
        updateDisplay();
        announceToScreenReader(`Rested. ${spoonCount} spoons available`);
      }
    });
    
    // Initial display
    updateDisplay();
  }
  
  function setupHeaderEmergencyMode() {
    const btn = document.getElementById('header-emergency-simplify');
    if (!btn) return;
    
    btn.addEventListener('click', function() {
      emergencyMode = !emergencyMode;
      
      if (emergencyMode) {
        document.body.classList.add('emergency-mode');
        btn.setAttribute('aria-pressed', 'true');
        btn.style.background = 'rgba(220, 38, 38, 0.2)';
        btn.style.borderColor = 'rgba(220, 38, 38, 0.5)';
        announceToScreenReader('Emergency simplification activated. Page simplified for easier reading.', 'assertive');
      } else {
        document.body.classList.remove('emergency-mode');
        btn.setAttribute('aria-pressed', 'false');
        btn.style.background = 'rgba(220, 38, 38, 0.1)';
        btn.style.borderColor = 'rgba(220, 38, 38, 0.3)';
        announceToScreenReader('Emergency mode deactivated. Full page restored.');
      }
      
      localStorage.setItem('emergencyMode', emergencyMode);
    });
    
    // Set initial state
    if (emergencyMode) {
      btn.setAttribute('aria-pressed', 'true');
      btn.style.background = 'rgba(220, 38, 38, 0.2)';
      btn.style.borderColor = 'rgba(220, 38, 38, 0.5)';
    }
  }
  
  function announceToScreenReader(message, priority = 'polite') {
    const announcer = document.getElementById('a11y-announcer') || createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(function() {
      announcer.textContent = '';
    }, 1000);
  }
  
  function createAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
    return announcer;
  }
})();
