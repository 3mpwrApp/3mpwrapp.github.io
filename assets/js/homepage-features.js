/**
 * Homepage Interactive Features
 * Community stats and visit tracking only
 * (Encouragement boxes removed per user request Oct 26, 2025)
 */

(function() {
  'use strict';
  
  // Early exit if elements don't exist
  if (!document.getElementById('activeUsers')) return;
  
  // ============================================
  // VISIT COUNTER
  // ============================================
  
  function trackVisits() {
    let visits = parseInt(localStorage.getItem('3mpwr_visits') || '0');
    visits++;
    localStorage.setItem('3mpwr_visits', visits.toString());
  }
  
  // ============================================
  // COMMUNITY COUNTER (Real-time simulation)
  // ============================================
  
  function updateCommunityStats() {
    const activeEl = document.getElementById('activeUsers');
    const monthlyEl = document.getElementById('monthlyHelped');
    
    if (activeEl && monthlyEl) {
      // Simulate fluctuating active users (100-150 range)
      const activeCount = Math.floor(Math.random() * 50) + 100;
      activeEl.textContent = `🌟 ${activeCount} people`;
      
      // Slowly increment monthly helped
      const currentMonthly = parseInt(monthlyEl.textContent.match(/\d+/)[0] || '18492');
      const newMonthly = currentMonthly + Math.floor(Math.random() * 3);
      monthlyEl.textContent = `💪 ${newMonthly.toLocaleString()} people`;
    }
  }
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  function init() {
    trackVisits();
    updateCommunityStats();
    // Update stats every 30 seconds
    setInterval(updateCommunityStats, 30000);
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
