// Accessible "Back to top" button that appears after scrolling.
// Respects prefers-reduced-motion and announces when activated.
(function () {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateVisibility() {
    var visible = window.scrollY > 400;
    btn.classList.toggle('is-visible', visible);
    btn.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('load', updateVisibility);

  btn.addEventListener('click', function () {
    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (window.announce) {
      window.announce('Returned to top of page');
    }
  });
})();
