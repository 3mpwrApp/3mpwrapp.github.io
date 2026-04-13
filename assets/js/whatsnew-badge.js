// What's New Badge - Shows unread count in navigation
(async function initWhatsNewBadge() {
  const badge = document.getElementById('whatsnew-badge');
  if (!badge) return;

  const STORAGE_KEY = 'whatsnew-last-visit';
  const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/3mpwrApp/empowrapp-new/main/public';
  
  try {
    // Get last visit timestamp
    const lastVisit = localStorage.getItem(STORAGE_KEY);
    const lastVisitDate = lastVisit ? new Date(lastVisit) : new Date('2025-01-01'); // Default to January 2025
    
    // Fetch current year's data
    const currentYear = new Date().getFullYear();
    const response = await fetch(`${GITHUB_RAW_BASE}/whatsnew-${currentYear}.json`);
    
    if (!response.ok) {
      console.warn('Could not load What\'s New data for badge');
      return;
    }
    
    const data = await response.json();
    
    // Count unread entries (after last visit)
    const unreadCount = data.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate > lastVisitDate;
    }).length;
    
    // Show badge if there are unread entries
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = 'inline-flex';
      badge.setAttribute('aria-label', `${unreadCount} unread updates`);
    }
    
    // Update last visit when user visits What's New page
    if (window.location.pathname.includes('/whats-new')) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      // Hide badge on What's New page
      badge.style.display = 'none';
    }
  } catch (err) {
    console.error('Error loading What\'s New badge:', err);
  }
})();
