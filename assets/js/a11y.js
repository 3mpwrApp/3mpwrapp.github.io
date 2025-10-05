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
    el.textContent = '';
    setTimeout(function () { el.textContent = message; }, 10);
  }

  window.announce = announce;

  // For links that open in new tabs, append a visually-hidden note for screen readers
  function annotateNewTabLinks() {
    try {
      var links = document.querySelectorAll('a[target="_blank"]');
      links.forEach(function (a) {
        // Ensure security attributes
        var rel = (a.getAttribute('rel') || '').split(/\s+/);
        if (rel.indexOf('noopener') === -1) rel.push('noopener');
        if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
        a.setAttribute('rel', rel.join(' ').trim());

        // Add screen-reader-only cue if not already present
        if (!a.querySelector('.sr-only')) {
          var sr = document.createElement('span');
          sr.className = 'sr-only';
          sr.textContent = ' (opens in a new tab)';
          a.appendChild(sr);
        }
      });
    } catch (e) { /* ignore */ }
  }

  // Performance: lazily load images that don't already opt into eager loading
  function lazyImages() {
    var imgs = document.querySelectorAll('img:not([loading])');
    imgs.forEach(function (img) {
      img.loading = 'lazy';
      // Optional: decoding hint for faster rendering
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ lazyImages(); annotateNewTabLinks(); }, { once: true });
  } else {
    lazyImages();
    annotateNewTabLinks();
  }
})();
