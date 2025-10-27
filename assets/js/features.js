/**
 * Features Page JavaScript
 * Handles feature card filtering and search functionality
 */

// Feature Cards Filtering and Search
(function() {
  const searchInput = document.getElementById('feature-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.feature-card');
  const resultsDiv = document.getElementById('filter-results');
  
  if (!searchInput || !cards.length) return;
  
  let activeCategory = 'all';
  let searchTimeout;
  
  // Category counts for each filter
  const categoryCounts = {
    'all': 133,
    'advocacy': 18,
    'wellness': 36,
    'evidence': 7,
    'letters': 22,
    'community': 8,
    'resources': 42
  };
  
  // Filter cards
  function filterCards() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;
    
    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
      const description = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
      const features = card.querySelector('.card-features')?.textContent.toLowerCase() || '';
      const searchableText = title + ' ' + description + ' ' + features;
      
      // Check category match
      const categoryMatch = activeCategory === 'all' || category === activeCategory;
      
      // Check search match
      const searchMatch = !searchTerm || searchableText.includes(searchTerm);
      
      if (categoryMatch && searchMatch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });
    
    // Update results counter
    updateResultsCount(visibleCount);
  }
  
  // Update results counter
  function updateResultsCount(count) {
    if (!resultsDiv) return;
    
    if (count === 0) {
      resultsDiv.textContent = 'No features found. Try a different search or category.';
      resultsDiv.style.backgroundColor = '#fff3cd';
      resultsDiv.style.color = '#856404';
    } else {
      const categoryText = activeCategory === 'all' ? '' : ` in ${activeCategory}`;
      resultsDiv.textContent = `Showing ${count} feature${count !== 1 ? 's' : ''}${categoryText}`;
      resultsDiv.style.backgroundColor = '#e3f2fd';
      resultsDiv.style.color = '#0066CC';
    }
  }
  
  // Category button click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      
      // Add active to clicked button
      this.classList.add('active');
      
      // Update active category
      activeCategory = this.getAttribute('data-category');
      
      // Filter cards
      filterCards();
      
      // Announce to screen readers
      const announcement = `Filtering to show ${this.textContent.trim()}`;
      announceToScreenReader(announcement);
    });
  });
  
  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(filterCards, 300);
    });
    
    searchInput.addEventListener('search', filterCards);
  }
  
  // Screen reader announcement
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // Initialize
  updateResultsCount(cards.length);
})();
