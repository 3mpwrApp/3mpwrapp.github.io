/**
 * 3mpwrApp - Innovative Accessibility Features
 * Never-before-seen website accessibility tools
 * Last updated: October 25, 2025
 */

(function() {
  'use strict';

  // ============================================
  // 1. SPOON COUNTER - Energy tracking
  // ============================================
  let spoonCount = parseInt(localStorage.getItem('spoonCount') || '0');
  const spoonCountEl = document.getElementById('spoonCount');
  const resetSpoonsBtn = document.getElementById('resetSpoons');

  function updateSpoonCount() {
    if (spoonCountEl) {
      spoonCountEl.textContent = spoonCount;
      localStorage.setItem('spoonCount', spoonCount);
    }
  }

  function incrementSpoons(amount = 1) {
    spoonCount += amount;
    updateSpoonCount();
  }

  if (resetSpoonsBtn) {
    resetSpoonsBtn.addEventListener('click', function() {
      spoonCount = 0;
      updateSpoonCount();
      alert('Energy counter reset! 🥄');
    });
  }

  // Track scroll activity (costs energy)
  let lastScrollTime = Date.now();
  window.addEventListener('scroll', function() {
    const now = Date.now();
    if (now - lastScrollTime > 10000) { // Every 10 seconds of scrolling
      incrementSpoons(1);
      lastScrollTime = now;
    }
  });

  // Track clicks (costs energy)
  document.addEventListener('click', function() {
    incrementSpoons(0.5);
  });

  updateSpoonCount();

  // ============================================
  // 2. PAGE PROGRESS BAR - Anxiety-friendly
  // ============================================
  const progressBar = document.getElementById('pageProgressBar');
  const progressText = document.getElementById('pageProgressText');

  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    if (progressBar) {
      progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }
    if (progressText) {
      progressText.textContent = Math.round(Math.min(scrollPercent, 100)) + '% through page';
    }
  }

  window.addEventListener('scroll', updateProgress);
  updateProgress();

  // ============================================
  // 3. SAFE TO PAUSE - Auto-save scroll position
  // ============================================
  const resumeBtn = document.getElementById('resumeReadingBtn');
  const PAGE_KEY = 'savedScrollPosition_' + window.location.pathname;

  function saveScrollPosition() {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollPos > 100) { // Only save if scrolled past header
      localStorage.setItem(PAGE_KEY, scrollPos);
      if (resumeBtn) resumeBtn.style.display = 'inline-block';
    }
  }

  function restoreScrollPosition() {
    const savedPos = localStorage.getItem(PAGE_KEY);
    if (savedPos && resumeBtn) {
      resumeBtn.style.display = 'inline-block';
      resumeBtn.addEventListener('click', function() {
        window.scrollTo({
          top: parseInt(savedPos),
          behavior: 'smooth'
        });
        localStorage.removeItem(PAGE_KEY);
        resumeBtn.style.display = 'none';
      });
    }
  }

  // Save position every 5 seconds while scrolling
  let scrollSaveTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(saveScrollPosition, 5000);
  });

  restoreScrollPosition();

  // ============================================
  // 4. NEED A BREAK BUTTON - 5-minute break mode
  // ============================================
  const needBreakBtn = document.getElementById('needBreakBtn');

  if (needBreakBtn) {
    needBreakBtn.addEventListener('click', function() {
      const overlay = document.createElement('div');
      overlay.className = 'break-mode-overlay';
      overlay.innerHTML = `
        <div class="break-mode-content">
          <h2>💙 Taking a Break</h2>
          <p>You're doing great. Rest is productive. This page will be here when you're ready.</p>
          <div class="break-timer" id="breakTimer">5:00</div>
          <p style="font-size: 1rem; color: #93c5fd;">Breathe deeply. Stretch gently. Hydrate.</p>
          <button class="break-mode-btn" id="endBreakBtn">I'm ready to continue</button>
        </div>
      `;
      document.body.appendChild(overlay);

      let timeLeft = 300; // 5 minutes in seconds
      const timerEl = document.getElementById('breakTimer');
      const endBtn = document.getElementById('endBreakBtn');

      const breakInterval = setInterval(function() {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerEl.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        
        if (timeLeft <= 0) {
          clearInterval(breakInterval);
          document.body.removeChild(overlay);
        }
      }, 1000);

      endBtn.addEventListener('click', function() {
        clearInterval(breakInterval);
        document.body.removeChild(overlay);
      });
    });
  }

  // ============================================
  // 5. PAIN FLARE MODE - Minimal interaction
  // ============================================
  const painFlareBtn = document.getElementById('painFlareBtn');

  if (painFlareBtn) {
    painFlareBtn.addEventListener('click', function() {
      document.body.classList.toggle('pain-flare-mode');
      const isActive = document.body.classList.contains('pain-flare-mode');
      painFlareBtn.textContent = isActive ? '✅ Pain mode ON' : '🔥 Pain flare mode';
      painFlareBtn.setAttribute('aria-pressed', isActive);
      localStorage.setItem('painFlareMode', isActive);
    });

    // Restore pain flare mode if previously enabled
    if (localStorage.getItem('painFlareMode') === 'true') {
      painFlareBtn.click();
    }
  }

  // ============================================
  // 6. OVERWHELMED MODE - Simplified version
  // ============================================
  const overwhelmedBtn = document.getElementById('overwhelmedBtn');

  if (overwhelmedBtn) {
    overwhelmedBtn.addEventListener('click', function() {
      document.body.classList.toggle('overwhelmed-mode');
      const isActive = document.body.classList.contains('overwhelmed-mode');
      overwhelmedBtn.textContent = isActive ? '✅ Simple mode ON' : '😰 I\'m overwhelmed';
      overwhelmedBtn.setAttribute('aria-pressed', isActive);
      localStorage.setItem('overwhelmedMode', isActive);
    });

    // Restore overwhelmed mode if previously enabled
    if (localStorage.getItem('overwhelmedMode') === 'true') {
      overwhelmedBtn.click();
    }
  }

  // ============================================
  // 7. TOO MUCH TEXT - Bullet points only
  // ============================================
  const tooMuchTextBtn = document.getElementById('tooMuchTextBtn');

  if (tooMuchTextBtn) {
    tooMuchTextBtn.addEventListener('click', function() {
      document.body.classList.toggle('bullets-only-mode');
      const isActive = document.body.classList.contains('bullets-only-mode');
      tooMuchTextBtn.textContent = isActive ? '✅ Bullets only' : '📝 Too much text?';
      tooMuchTextBtn.setAttribute('aria-pressed', isActive);
    });
  }

  // ============================================
  // 8. BRAIN FOG HELPER - Quick summaries
  // ============================================
  const brainFogBtn = document.getElementById('brainFogBtn');

  if (brainFogBtn) {
    brainFogBtn.addEventListener('click', function() {
      const existingSummary = document.querySelector('.brain-fog-summary');
      if (existingSummary) {
        existingSummary.remove();
        brainFogBtn.textContent = '🧠 Brain fog helper';
        return;
      }

      const summary = document.createElement('div');
      summary.className = 'brain-fog-summary';
      summary.innerHTML = '3mpwrApp helps injured workers, persons with disabilities, supporters, and allies connect, advocate, and access tools. 100% free, privacy-first, built by the community for the community.';
      
      const mainContent = document.querySelector('h1');
      if (mainContent) {
        mainContent.insertAdjacentElement('afterend', summary);
        brainFogBtn.textContent = '✅ Summary showing';
        summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ============================================
  // 9. SENSORY PREFERENCES - Real-time adjustments
  // ============================================
  const sensoryToggle = document.getElementById('sensoryToggle');

  if (sensoryToggle) {
    sensoryToggle.addEventListener('change', function() {
      const value = this.value;
      document.body.classList.remove('reduced-motion-mode', 'high-contrast-mode', 'minimal-mode');
      
      switch(value) {
        case 'reduced-motion':
          document.body.classList.add('reduced-motion-mode');
          document.body.style.setProperty('--animation-duration', '0s');
          break;
        case 'high-contrast':
          document.body.setAttribute('data-contrast', 'high');
          break;
        case 'minimal':
          document.body.classList.add('minimal-mode');
          break;
        default:
          document.body.removeAttribute('data-contrast');
          document.body.style.removeProperty('--animation-duration');
      }
      
      localStorage.setItem('sensoryPreference', value);
    });

    // Restore preference
    const savedPref = localStorage.getItem('sensoryPreference');
    if (savedPref) {
      sensoryToggle.value = savedPref;
      sensoryToggle.dispatchEvent(new Event('change'));
    }
  }

  // ============================================
  // 10. READING LEVEL TOGGLE - Simple vs detailed
  // ============================================
  const readingLevel = document.getElementById('readingLevel');

  if (readingLevel) {
    readingLevel.addEventListener('change', function() {
      const isSimple = this.value === 'simple';
      document.body.classList.toggle('simple-language', isSimple);
      
      if (isSimple) {
        // Simplify headings and key text
        document.querySelectorAll('h2, h3').forEach(function(heading) {
          heading.style.fontSize = '1.25rem';
        });
        document.querySelectorAll('p').forEach(function(para) {
          para.style.fontSize = '1.1rem';
          para.style.lineHeight = '1.8';
        });
      } else {
        document.querySelectorAll('h2, h3, p').forEach(function(el) {
          el.style.fontSize = '';
          el.style.lineHeight = '';
        });
      }
      
      localStorage.setItem('readingLevel', this.value);
    });

    // Restore preference
    const savedLevel = localStorage.getItem('readingLevel');
    if (savedLevel) {
      readingLevel.value = savedLevel;
      readingLevel.dispatchEvent(new Event('change'));
    }
  }

  // ============================================
  // 11. EMAIL SECTION BUTTONS - Send specific sections
  // ============================================
  document.querySelectorAll('.email-section-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      const sectionContent = this.parentElement.textContent.substring(0, 500);
      const subject = '3mpwrApp - ' + section;
      const body = encodeURIComponent(sectionContent + '\n\nRead more at: ' + window.location.href);
      window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
    });
  });

  // ============================================
  // 12. TIME-OF-DAY OPTIMIZATION - Late night suggestions
  // ============================================
  function checkTimeOfDay() {
    const hour = new Date().getHours();
    
    // Late night (11pm - 5am)
    if ((hour >= 23 || hour < 5) && !localStorage.getItem('nightModeSuggested_' + new Date().toDateString())) {
      const suggestion = document.createElement('div');
      suggestion.className = 'time-suggestion';
      suggestion.innerHTML = `
        <p>🌙 It's late - would you like a simpler, easier-on-the-eyes version?</p>
        <button id="acceptNightMode">Yes, switch to night mode</button>
        <button id="dismissNightSuggestion">No thanks</button>
      `;
      
      const firstHeading = document.querySelector('h1');
      if (firstHeading) {
        firstHeading.insertAdjacentElement('beforebegin', suggestion);
        
        document.getElementById('acceptNightMode').addEventListener('click', function() {
          document.body.setAttribute('data-theme', 'dark');
          if (sensoryToggle) sensoryToggle.value = 'minimal';
          suggestion.remove();
          localStorage.setItem('nightModeSuggested_' + new Date().toDateString(), 'true');
        });
        
        document.getElementById('dismissNightSuggestion').addEventListener('click', function() {
          suggestion.remove();
          localStorage.setItem('nightModeSuggested_' + new Date().toDateString(), 'true');
        });
      }
    }
  }

  // Check time of day after 2 seconds (give page time to load)
  setTimeout(checkTimeOfDay, 2000);

  // ============================================
  // 13. VOICE FATIGUE MODE - Larger targets
  // ============================================
  // This is CSS-based, but we track activation
  window.enableVoiceFatigueMode = function() {
    document.body.classList.add('voice-fatigue-mode');
    localStorage.setItem('voiceFatigueMode', 'true');
  };

  if (localStorage.getItem('voiceFatigueMode') === 'true') {
    enableVoiceFatigueMode();
  }

  // ============================================
  // 14. ENERGY COST TRACKING - Auto-increment
  // ============================================
  document.querySelectorAll('.energy-cost').forEach(function(costEl) {
    const energy = parseInt(costEl.getAttribute('data-energy') || '1');
    
    // Intersection Observer to track when sections are viewed
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !costEl.dataset.counted) {
          incrementSpoons(energy);
          costEl.dataset.counted = 'true';
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(costEl.parentElement);
  });

  // ============================================
  // 15. KEYBOARD SHORTCUTS - Quick access
  // ============================================
  document.addEventListener('keydown', function(e) {
    // Alt+B = Break mode
    if (e.altKey && e.key === 'b') {
      e.preventDefault();
      if (needBreakBtn) needBreakBtn.click();
    }
    
    // Alt+P = Pain flare mode
    if (e.altKey && e.key === 'p') {
      e.preventDefault();
      if (painFlareBtn) painFlareBtn.click();
    }
    
    // Alt+O = Overwhelmed mode
    if (e.altKey && e.key === 'o') {
      e.preventDefault();
      if (overwhelmedBtn) overwhelmedBtn.click();
    }
    
    // Alt+S = Spoon counter reset
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      if (resetSpoonsBtn) resetSpoonsBtn.click();
    }
  });

  console.log('✨ 3mpwrApp Innovative Accessibility Features Loaded');
  console.log('Keyboard shortcuts: Alt+B (Break), Alt+P (Pain mode), Alt+O (Overwhelmed), Alt+S (Reset energy)');

})();
