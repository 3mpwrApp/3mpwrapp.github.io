// Reusable ARIA live region announcer for dynamic updates (e.g., search/filter results)
(function () {
  var region;

  function ensureRegion() {
    if (!region) {
      region = document.createElement('div');
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.id = 'live-region';
      document.body.appendChild(region);
    }
    return region;
  }

  function announce(message, politeness) {
    var el = ensureRegion();
    if (politeness === 'assertive') {
      el.setAttribute('aria-live', 'assertive');
    } else {
      el.setAttribute('aria-live', 'polite');
    }
    // Clear then set to ensure SR announcement
    el.textContent = '';
    setTimeout(function () { el.textContent = message; }, 10);
  }

  window.announce = announce;
})();
