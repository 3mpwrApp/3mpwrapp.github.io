/**
 * FAQ Page JavaScript
 * Handles search functionality, accordion controls, and deep linking
 */

// FAQ Search Functionality
(function() {
  const searchInput = document.getElementById('faq-search');
  const clearBtn = document.getElementById('clear-search');
  const resultsCount = document.getElementById('search-results-count');
  
  if (!searchInput) return;
  
  let searchTimeout;
  let allSections = [];
  let noResultsMsg = null;
  
  // Initialize - get all FAQ sections
  function init() {
    // Get all h2 and h3 sections
    const headings = document.querySelectorAll('h2, h3');
    headings.forEach(heading => {
      // Skip the main title and TOC
      if (heading.textContent.includes('Table of Contents') || 
          heading.textContent.includes('Frequently Asked Questions')) {
        return;
      }
      
      // Get content until next heading
      let content = '';
      let element = heading.nextElementSibling;
      const elements = [heading];
      
      while (element && !element.matches('h2, h3')) {
        elements.push(element);
        content += element.textContent + ' ';
        element = element.nextElementSibling;
      }
      
      allSections.push({
        heading: heading,
        elements: elements,
        text: (heading.textContent + ' ' + content).toLowerCase(),
        visible: true
      });
    });
  }
  
  // Perform search
  function performSearch(query) {
    query = query.toLowerCase().trim();
    
    // Clear previous highlights
    clearHighlights();
    
    if (!query) {
      // Show all sections
      allSections.forEach(section => {
        section.elements.forEach(el => {
          el.classList.remove('hidden');
          el.style.display = '';
        });
        section.visible = true;
      });
      
      if (noResultsMsg) {
        noResultsMsg.remove();
        noResultsMsg = null;
      }
      
      resultsCount.style.display = 'none';
      clearBtn.style.display = 'none';
      return;
    }
    
    // Search sections
    let matchCount = 0;
    const terms = query.split(/\s+/).filter(t => t.length > 0);
    
    allSections.forEach(section => {
      const matches = terms.every(term => section.text.includes(term));
      
      if (matches) {
        matchCount++;
        section.elements.forEach(el => {
          el.classList.remove('hidden');
          el.style.display = '';
        });
        section.visible = true;
        
        // Highlight matching terms
        highlightTerms(section.elements, terms);
      } else {
        section.elements.forEach(el => {
          el.classList.add('hidden');
        });
        section.visible = false;
      }
    });
    
    // Show results count
    if (matchCount > 0) {
      resultsCount.textContent = `Found ${matchCount} section${matchCount !== 1 ? 's' : ''} matching "${query}"`;
      resultsCount.style.display = 'block';
      
      if (noResultsMsg) {
        noResultsMsg.remove();
        noResultsMsg = null;
      }
    } else {
      resultsCount.style.display = 'none';
      showNoResults(query);
    }
    
    clearBtn.style.display = 'block';
  }
  
  // Highlight matching terms
  function highlightTerms(elements, terms) {
    elements.forEach(el => {
      // Skip if element contains form or script
      if (el.querySelector('form, script, style')) return;
      
      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const textNodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.parentElement.closest('a, code, pre')) continue;
        textNodes.push(walker.currentNode);
      }
      
      textNodes.forEach(node => {
        const text = node.textContent;
        let html = text;
        
        terms.forEach(term => {
          const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
          html = html.replace(regex, '<span class="search-highlight">$1</span>');
        });
        
        if (html !== text) {
          const span = document.createElement('span');
          span.innerHTML = html;
          node.parentNode.replaceChild(span, node);
        }
      });
    });
  }
  
  // Clear highlights
  function clearHighlights() {
    document.querySelectorAll('.search-highlight').forEach(el => {
      const text = el.textContent;
      el.parentNode.replaceChild(document.createTextNode(text), el);
    });
  }
  
  // Show no results message
  function showNoResults(query) {
    if (noResultsMsg) {
      noResultsMsg.remove();
    }
    
    noResultsMsg = document.createElement('div');
    noResultsMsg.className = 'no-results-message';
    noResultsMsg.innerHTML = `
      <h3>🔍 No results found for "${escapeHtml(query)}"</h3>
      <p><strong>Try these tips:</strong></p>
      <ul style="text-align: left; max-width: 400px; margin: 1rem auto;">
        <li>Use different keywords</li>
        <li>Check for typos</li>
        <li>Try shorter or more general terms</li>
        <li><a href="/contact">Contact us</a> if you can't find what you need</li>
      </ul>
    `;
    
    const mainContent = document.querySelector('main') || document.body;
    const toc = document.querySelector('details.tldr-box');
    if (toc && toc.nextElementSibling) {
      toc.nextElementSibling.after(noResultsMsg);
    } else {
      mainContent.insertBefore(noResultsMsg, mainContent.querySelector('h2'));
    }
  }
  
  // Utility functions
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  // Event listeners
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(this.value);
    }, 300);
  });
  
  searchInput.addEventListener('search', function() {
    performSearch(this.value);
  });
  
  clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchInput.focus();
    performSearch('');
  });
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// FAQ Accordion Functionality
(function() {
  const expandAllBtn = document.getElementById('expand-all-btn');
  const collapseAllBtn = document.getElementById('collapse-all-btn');
  const accordions = document.querySelectorAll('.faq-accordion');
  
  if (!expandAllBtn || !collapseAllBtn || !accordions.length) return;
  
  // Expand all accordions
  expandAllBtn.addEventListener('click', function() {
    accordions.forEach(accordion => {
      accordion.open = true;
    });
    announceToScreenReader('All questions expanded');
  });
  
  // Collapse all accordions
  collapseAllBtn.addEventListener('click', function() {
    accordions.forEach(accordion => {
      accordion.open = false;
    });
    announceToScreenReader('All questions collapsed');
  });
  
  // Deep linking - open accordion if URL hash matches
  function handleDeepLink() {
    const hash = window.location.hash;
    if (!hash) return;
    
    const targetAccordion = document.querySelector(hash);
    if (targetAccordion && targetAccordion.classList.contains('faq-accordion')) {
      targetAccordion.open = true;
      
      // Scroll to accordion smoothly
      setTimeout(() => {
        targetAccordion.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
  
  // Handle deep linking on page load
  handleDeepLink();
  
  // Handle deep linking on hash change
  window.addEventListener('hashchange', handleDeepLink);
  
  // Track accordion open/close for analytics
  accordions.forEach(accordion => {
    accordion.addEventListener('toggle', function() {
      const questionText = this.querySelector('.question-text')?.textContent || 'Unknown';
      const action = this.open ? 'expanded' : 'collapsed';
      
      // Could send to analytics here
      console.log(`FAQ ${action}: ${questionText}`);
    });
  });
  
  // Keyboard accessibility enhancement
  accordions.forEach(accordion => {
    const summary = accordion.querySelector('summary');
    if (!summary) return;
    
    summary.addEventListener('keydown', function(e) {
      // Allow Enter and Space to toggle
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        accordion.open = !accordion.open;
      }
    });
  });
  
  // Screen reader announcement helper
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
})();
