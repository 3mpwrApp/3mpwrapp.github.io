---
layout: default
title: Search
description: Search the 3mpowr website using DuckDuckGo.
---

# Search the site

<form id="site-search" action="https://duckduckgo.com/" method="get" role="search" aria-describedby="search-help">
  <div>
    <label for="q">Search terms</label><br>
    <input id="q" name="q_user" type="search" required inputmode="search" autocomplete="off" spellcheck="true">
    <p id="search-help" class="sr-only">Your search will be limited to pages on this website.</p>
  </div>
  <br>
  <button type="submit">Search</button>

  <!-- Real query sent to DuckDuckGo; filled on submit -->
  <input type="hidden" id="q_real" name="q" value="">
  <!-- Optional: use DuckDuckGo settings param (harmless if unused) -->
  <input type="hidden" name="t" value="h_">
</form>

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
    if (form && user && real) {
      form.addEventListener('submit', function (e) {
        var term = (user.value || '').trim();
        real.value = 'site:3mpwrapp.github.io ' + term;
      });
    }
  })();
</script>
