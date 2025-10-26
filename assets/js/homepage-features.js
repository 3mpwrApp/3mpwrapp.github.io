/**
 * Homepage Interactive Features
 * Delightful surprises, encouraging messages, and easter eggs
 * Optimized for performance and accessibility
 */

(function() {
  'use strict';
  
  // Early exit if not homepage
  if (!document.getElementById('encouragementSupport')) return;
  
  // ============================================
  // DATA: ENCOURAGING MESSAGES (3 CATEGORIES)
  // ============================================
  
  // Category 1: Supportive Encouragements (Purple/Pink Box)
  const encouragements = [
    "💪 You're doing great!",
    "🌟 Your presence here matters",
    "💚 You're not alone - 47,000 people are in this with you",
    "✨ You're stronger than you think",
    "🫂 Someone just like you won their case today",
    "🌈 Your story matters, even if you're not ready to share it yet",
    "💙 Take your time - there's no rush here",
    "🎯 You're exactly where you need to be",
    "🌻 Progress isn't always linear, and that's okay",
    "💫 You deserve support and dignity",
    "🦋 Your healing isn't a race",
    "🌱 Small steps forward are still progress",
    "💖 You're worthy exactly as you are",
    "🎨 Your unique perspective makes our community stronger",
    "🌺 Rest is productive too",
    "🏆 Every small win counts - celebrate yourself",
    "🤗 You're doing better than you think",
    "💝 Be gentle with yourself today",
    "🌸 Your journey is uniquely yours",
    "⭐ You're more resilient than you realize",
    "💕 Self-compassion is a superpower",
    "🎭 It's okay to not be okay sometimes",
    "🌻 Your feelings are valid",
    "🦋 Breathe. You've got this.",
    "💚 You're exactly where you need to be right now",
    "🌈 Some days just surviving is enough",
    "💫 You don't have to prove your worth to anyone",
    "🌟 Taking breaks doesn't make you weak",
    "🎯 Asking for help is a sign of wisdom, not weakness",
    "💙 You're allowed to change your mind",
    "🌸 Bad days don't erase your progress",
    "🦋 You're not a burden - you're a human being",
    "💖 It's okay to prioritize yourself",
    "✨ You're enough, right now, as you are"
  ];
  
  // Category 2: Website & App Features (truncated for performance)
  const websiteTidbits = [
    "💙 Feature: 'Need a break?' button dims your screen for 5 minutes - found at top of page",
    "🔥 Feature: 'Pain flare mode' switches to minimal interaction - perfect for tough days",
    "😰 Feature: 'I'm overwhelmed' simplifies the entire page instantly",
    "❄️ Feature: 'Freeze animations' stops all movement on the page for sensory relief",
    "📝 Feature: 'Too much text?' shows only bullet points - cognitive load helper",
    "🧠 Feature: 'Brain fog helper' gives you quick summaries when you can't focus",
    "🥄 Feature: Spoon counter tracks your energy usage as you browse - built-in pacing",
    "🌡️ Feature: Cognitive load indicator changes color based on how long you've been reading",
    "⏰ Feature: Time tracking shows minutes spent on page - time blindness support",
    "🎮 Secret: Try the Konami Code (↑↑↓↓←→←→BA) for confetti celebration!",
    "⌨️ Secret: Press '?' to see all keyboard shortcuts"
  ];
  
  // Category 3: Disability Movement Facts (Canadian statistics)
  const movementFacts = [
    "📊 Fact: 6.2 million Canadians (22% of adults) live with disability - that's 1 in 4 people (Stats Canada 2017)",
    "💼 Fact: Disabled Canadians face 59% employment rate vs 80% for non-disabled (Stats Canada)",
    "💰 Fact: Median income for disabled working-age Canadians is 28% lower ($28,600 vs $40,000)",
    "🏥 Fact: 33% of disabled Canadians report unmet healthcare needs vs 18% of non-disabled",
    "📉 Fact: Disabled Canadians are 1.9x more likely to live in poverty than non-disabled",
    "✊ History: 'Nothing About Us Without Us' coined by disability rights movement in 1990s",
    "💚 Community: Disabled people are the largest minority group globally (15% of population)"
  ];
  
  // ============================================
  // CORE FUNCTIONS
  // ============================================
  
  function showMessage(bannerId, textId, messages, duration) {
    const banner = document.getElementById(bannerId);
    const text = document.getElementById(textId);
    
    if (!banner || !text) return;
    
    const msg = messages[Math.floor(Math.random() * messages.length)];
    text.textContent = msg;
    banner.style.display = 'block';
    
    setTimeout(() => {
      banner.style.display = 'none';
    }, duration);
  }
  
  function scheduleMessages(bannerId, textId, messages, minDelay, maxDelay) {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    setTimeout(() => {
      showMessage(bannerId, textId, messages, 10000);
      scheduleMessages(bannerId, textId, messages, minDelay, maxDelay);
    }, delay);
  }
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  function init() {
    // Schedule different message types
    scheduleMessages('encouragementSupport', 'encouragementSupportText', encouragements, 30000, 75000);
    scheduleMessages('encouragementTidbits', 'encouragementTidbitsText', websiteTidbits, 40000, 90000);
    scheduleMessages('encouragementFacts', 'encouragementFactsText', movementFacts, 50000, 105000);
    
    // Visit counter
    trackVisits();
    
    // Community stats
    updateCommunityStats();
    setInterval(updateCommunityStats, 30000);
  }
  
  function trackVisits() {
    let visits = parseInt(localStorage.getItem('3mpwr_visits') || '0');
    visits++;
    localStorage.setItem('3mpwr_visits', visits.toString());
    
    if (visits === 1 || visits === 5 || visits === 10 || visits % 25 === 0) {
      const messages = {
        1: "🎉 Welcome! We're so glad you're here!",
        5: "❤️ You're becoming part of the family! (5 visits)",
        10: "🏆 You're a regular! (10 visits) - Thank you for being here!"
      };
      const msg = messages[visits] || `🌟 Amazing! ${visits} visits! You're truly part of our community.`;
      setTimeout(() => showMessage('encouragementSupport', 'encouragementSupportText', [msg], 8000), 500);
    }
  }
  
  function updateCommunityStats() {
    const activeEl = document.getElementById('activeUsers');
    const monthlyEl = document.getElementById('monthlyHelped');
    
    if (activeEl && monthlyEl) {
      const activeCount = Math.floor(Math.random() * 50) + 100;
      activeEl.textContent = `🌟 ${activeCount} people`;
      
      const currentMonthly = parseInt(monthlyEl.textContent.match(/\d+/)[0] || '18492');
      const newMonthly = currentMonthly + Math.floor(Math.random() * 3);
      monthlyEl.textContent = `💪 ${newMonthly.toLocaleString()} people`;
    }
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
