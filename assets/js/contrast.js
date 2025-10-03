(function () {
  var STORAGE_KEY = 'contrast';
  var ON = 'high';
  var btn = null;

  function setState(on) {
    if (on) {
      document.body.setAttribute('data-contrast', 'high');
    } else {
      document.body.removeAttribute('data-contrast');
    }
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? 'High contrast: On' : 'High contrast';
    }
  }

  function init() {
    btn = document.getElementById('contrast-toggle');
    var saved = (localStorage.getItem(STORAGE_KEY) === ON);
    setState(saved);

    if (btn) {
      btn.addEventListener('click', function () {
        var next = !(localStorage.getItem(STORAGE_KEY) === ON);
        if (next) {
          localStorage.setItem(STORAGE_KEY, ON);
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
