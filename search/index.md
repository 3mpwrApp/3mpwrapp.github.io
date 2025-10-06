---
layout: default
title: Search
description: Search the 3mpowr website using DuckDuckGo.
---

# Search the site

<form id="site-search" action="https://duckduckgo.com/" method="get" role="search" aria-describedby="search-help">
  <fieldset>
    <legend>Search this site</legend>
    <div>
      <label for="q">Search terms</label><br>
      <input id="q" name="q_user" type="search" required inputmode="search" autocomplete="off" spellcheck="true" aria-describedby="search-help">
      <p id="search-help">Search this site. Your results will be limited to pages on this website.</p>
    </div>
  </fieldset>
  <br>
  <button type="submit">Search</button>

  <!-- Real query sent to DuckDuckGo; filled on submit -->
  <input type="hidden" id="q_real" name="q" value="">
  <input type="hidden" name="t" value="h_">
</form>

<!-- Live region for announcements -->
<div id="search-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>

<noscript>
  <p>
    JavaScript is required to automatically limit searches to this site.
    As a fallback, type: <code>site:3mpwrapp.github.io your terms</code> in the box above.
  </p>
</noscript>

<script>
  (function () {
    var form = document.getElementById('site-search');
    var user = document.getElementById('q');
    var real = document.getElementById('q_real');
    var status = document.getElementById('search-status');
    if (form && user && real) {
      form.addEventListener('submit', function () {
        var term = (user.value || '').trim();
        real.value = 'site:3mpwrapp.github.io ' + term;
        var msg = term ? ('Searching this site for “' + term + '”.') : 'Searching this site.';
        if (window.announce) {
          window.announce(msg);
        } else if (status) {
          status.textContent = '';
          setTimeout(function(){ status.textContent = msg; }, 10);
        }
      });
    }
  })();
</script>
