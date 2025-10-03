// Dark mode user toggle (independent of system preference)
// Storage key: theme = 'dark' | (unset)
(function () {
  var STORAGE_KEY = 'theme';
  var DARK = 'dark';
  var btn;

  function setState(isDark) {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    if (btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.textContent = isDark ? 'Dark mode: On' : 'Dark mode';
    }
  }

  function init() {
    btn = document.getElementById('theme-toggle');
    var saved = (localStorage.getItem(STORAGE_KEY) === DARK);
    setState(saved);

    if (btn) {
      btn.addEventListener('click', function () {
        var next = !(localStorage.getItem(STORAGE_KEY) === DARK);
        if (next) {
          localStorage.setItem(STORAGE_KEY, DARK);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        setState(next);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
