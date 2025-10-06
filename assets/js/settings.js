(function(){
  var KEY = 'a11y-settings';
  var defaults = {
    fontScale: 100,         // percent
    lineHeight: 'normal',   // normal|loose
    letterSpacing: 'normal',// normal|wide
    underlineLinks: 'auto', // auto|always
    readableFont: 'default',// default|readable|dyslexia
    reduceMotion: 'auto',   // auto|on
    colorFilter: 'none',    // none|grayscale|hue
    focusRing: 'default'    // default|thick|color
  };

  function load(){
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch(e){ return Object.assign({}, defaults); }
  }
  function save(state){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }

  function apply(state){
    var html = document.documentElement;
    html.style.setProperty('--font-scale', (state.fontScale/100).toString());
    html.style.setProperty('--line-height', state.lineHeight === 'loose' ? '1.8' : '1.6');
    html.style.setProperty('--letter-spacing', state.letterSpacing === 'wide' ? '0.02em' : '0');
    html.setAttribute('data-link-underline', state.underlineLinks);
  html.setAttribute('data-readable-font', state.readableFont);
    html.setAttribute('data-reduce-motion', state.reduceMotion);
  html.setAttribute('data-color-filter', state.colorFilter);
  html.setAttribute('data-focus-ring', state.focusRing);
    if (window.announce) window.announce('Accessibility settings applied');
  }

  function initForm(){
    var form = document.querySelector('[data-a11y-form]');
    if (!form) return;
    var state = load();
    // Bind elements
    var fontScale = form.querySelector('[name="font-scale"]');
    var lineHeight = form.querySelector('[name="line-height"]');
    var letterSpacing = form.querySelector('[name="letter-spacing"]');
    var underline = form.querySelector('[name="underline-links"]');
    var readable = form.querySelector('[name="readable-font"]');
  var resetBtn = form.querySelector('[data-reset]');
  var reduce = form.querySelector('[name="reduce-motion"]');
  var colorFilter = form.querySelector('[name="color-filter"]');
  var focusRing = form.querySelector('[name="focus-ring"]');

    // Initialize controls
    if (fontScale) fontScale.value = state.fontScale;
    if (lineHeight) lineHeight.value = state.lineHeight;
    if (letterSpacing) letterSpacing.value = state.letterSpacing;
    if (underline) underline.value = state.underlineLinks;
  if (readable) readable.value = state.readableFont;
  if (reduce) reduce.value = state.reduceMotion;
  if (colorFilter) colorFilter.value = state.colorFilter;
  if (focusRing) focusRing.value = state.focusRing;

    function update(){
      var next = {
        fontScale: parseInt(fontScale && fontScale.value || state.fontScale, 10) || 100,
        lineHeight: (lineHeight && lineHeight.value) || state.lineHeight,
        letterSpacing: (letterSpacing && letterSpacing.value) || state.letterSpacing,
        underlineLinks: (underline && underline.value) || state.underlineLinks,
        readableFont: (readable && readable.value) || state.readableFont,
        reduceMotion: (reduce && reduce.value) || state.reduceMotion,
        colorFilter: (colorFilter && colorFilter.value) || state.colorFilter,
        focusRing: (focusRing && focusRing.value) || state.focusRing
      };
      save(next);
      apply(next);
    }

    ['change','input'].forEach(function(evt){
      form.addEventListener(evt, function(e){ if (e && e.target && e.target.name) update(); });
    });
    if (resetBtn) resetBtn.addEventListener('click', function(){ save(defaults); apply(defaults); initForm(); });
    // Apply on first load
    apply(state);
  }

  // Apply from storage on every page
  apply(load());
  // Initialize form if present
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm, { once: true });
  } else { initForm(); }
})();
