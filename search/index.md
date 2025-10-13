---
layout: default
title: Search
description: Find information quickly with on-page results and a DuckDuckGo fallback, limited to the 3mpowr site.
---

# Search the site

<form id="site-search" action="https://duckduckgo.com/" method="get" role="search" aria-describedby="search-help">
  <fieldset>
    <legend>Search this site</legend>
    <div>
      <label for="q">Search terms</label><br>
      <input id="q" name="q_user" type="search" required inputmode="search" autocomplete="off" spellcheck="true" aria-describedby="search-help results-summary">
      <p id="search-help">Type a query. Results will appear below as you type. Press Enter to go to the first result or to search DuckDuckGo.</p>
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

<!-- On-page results -->
<section id="results" role="region" aria-labelledby="results-heading">
  <h2 id="results-heading">On-page results</h2>
  <p id="results-summary" class="sr-only" aria-live="polite" aria-atomic="true"></p>
  <ol id="results-list"></ol>
  <template id="result-item-template">
    <li class="result-item">
      <h3 class="result-title"><a target="_self" rel="nofollow noopener"></a></h3>
      <p class="result-excerpt"></p>
    </li>
  </template>
</section>

<style>
  #results { margin-top: 1rem; }
  #results-list { display: grid; gap: 0.75rem; padding-left: 1.25rem; }
  .result-title a { text-decoration: underline; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .secondary { color: #555; font-size: 0.9em; }
  @media (prefers-color-scheme: dark) { .secondary { color: #aaa; } }
  @media (prefers-contrast: more) { .result-title a { text-decoration-thickness: 3px; } }
  .result-item { margin-bottom: 0.25rem; }
  .result-excerpt { margin: 0.25rem 0 0 0; }
  
</style>

<noscript>
  <p>
    JavaScript is required to show on‑page results. As a fallback, type: <code>site:3mpwrapp.github.io your terms</code> above and press Enter to search with DuckDuckGo.
  </p>
</noscript>

<script>
  (function () {
    var form = document.getElementById('site-search');
    var user = document.getElementById('q');
    var real = document.getElementById('q_real');
    var status = document.getElementById('search-status');
    var list = document.getElementById('results-list');
    var summary = document.getElementById('results-summary');
    var template = document.getElementById('result-item-template');

    function announce(msg) {
      if (window.announce) { window.announce(msg); return; }
      if (!status) return;
      status.textContent = '';
      setTimeout(function(){ status.textContent = msg; }, 10);
    }

    // Build the real query for DuckDuckGo on submit and focus first result if present
    if (form && user && real) {
      form.addEventListener('submit', function (e) {
        var term = (user.value || '').trim();
        // If we have on-page results, go to the first one instead of leaving the site
        var first = list && list.querySelector('a');
        if (first) {
          e.preventDefault();
          try { first.focus(); } catch (err) {}
        }
        real.value = 'site:3mpwrapp.github.io ' + term;
        var msg = term ? ('Searching this site for “' + term + '”.') : 'Searching this site.';
        announce(msg);
      });
    }

    function normalize(s) { return (s || '').toString().toLowerCase(); }
    function includesAll(hay, needles) { return needles.every(function(n){ return hay.includes(n); }); }

    function escapeHTML(s) {
      return (s || '').replace(/[&<>"']/g, function(c){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]);
      });
    }

    function highlight(text, terms) {
      // SECURE: Use DOM methods instead of innerHTML to prevent XSS
      var container = document.createElement('span');
      var safe = text || '';
      
      if (!terms || terms.length === 0) {
        container.textContent = safe;
        return container;
      }
      
      try {
        var pattern = terms.map(function(t){ 
          return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
        }).join('|');
        var re = new RegExp('(' + pattern + ')', 'ig');
        var lastIndex = 0;
        var match;
        
        // Reset regex state
        re.lastIndex = 0;
        
        while ((match = re.exec(safe)) !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            container.appendChild(
              document.createTextNode(safe.slice(lastIndex, match.index))
            );
          }
          
          // Add highlighted match
          var mark = document.createElement('mark');
          mark.className = 'mark';
          mark.textContent = match[0];
          container.appendChild(mark);
          
          lastIndex = match.index + match[0].length;
          
          // Prevent infinite loop on zero-width matches
          if (match.index === re.lastIndex) {
            re.lastIndex++;
          }
        }
        
        // Add remaining text
        if (lastIndex < safe.length) {
          container.appendChild(document.createTextNode(safe.slice(lastIndex)));
        }
        
        return container;
      } catch (e) {
        container.textContent = safe;
        return container;
      }
    }

    function render(results, q, terms) {
      if (!list) return;
      list.innerHTML = ''; // Safe to clear
      var count = results.length;
      var msg = !q ? '' : (count === 0 ? ('No results for "' + escapeHTML(q) + '"') : (count + ' result' + (count === 1 ? '' : 's') + ' for "' + escapeHTML(q) + '"'));
      if (summary) summary.textContent = msg;
      if (status) status.textContent = msg; // Update live region
      if (q) announce(msg);
      var limit = 160;
      results.slice(0, 50).forEach(function(item){
        var node = template.content.cloneNode(true);
        var a = node.querySelector('a');
        var p = node.querySelector('.result-excerpt');
        a.href = item.url;
        
        // SECURE: Use DOM methods instead of innerHTML
        var shownTitle = item.title || item.url || '';
        var titleEl = highlight(shownTitle, terms);
        a.textContent = ''; // Clear first
        if (titleEl.nodeType === Node.TEXT_NODE) {
          a.appendChild(titleEl);
        } else {
          // Append all children from container
          while (titleEl.firstChild) {
            a.appendChild(titleEl.firstChild);
          }
        }

        var text = item.excerpt || item.content || '';
        var snippet = text.length > limit ? (text.slice(0, limit).trim() + '…') : text;
        var excerptEl = highlight(snippet, terms);
        p.textContent = ''; // Clear first
        if (excerptEl.nodeType === Node.TEXT_NODE) {
          p.appendChild(excerptEl);
        } else {
          // Append all children from container
          while (excerptEl.firstChild) {
            p.appendChild(excerptEl.firstChild);
          }
        }
        
        list.appendChild(node);
      });
    }

    var idx = [];
    var loaded = false;
    var pending = '';
    function doSearch(q) {
      var terms = normalize(q).split(/\s+/).filter(Boolean);
      if (terms.length === 0) { render([], '', terms); return; }

      function scoreItem(item) {
        var title = normalize(item.title);
        var url = normalize(item.url);
        var content = normalize(item.content);
        var presentAll = terms.every(function(t){
          return title.includes(t) || url.includes(t) || content.includes(t);
        });
        if (!presentAll) return -1; // exclude
        var score = 0;
        terms.forEach(function(t){
          if (title.includes(t)) score += 5;
          if (url.includes(t)) score += 2;
          if (content.includes(t)) score += 1;
        });
        // Bonus if all terms appear in the title
        var allInTitle = terms.every(function(t){ return title.includes(t); });
        if (allInTitle) score += 5;
        return score;
      }

      var results = idx
        .map(function(item){ return { item: item, score: scoreItem(item) }; })
        .filter(function(s){ return s.score >= 0; })
        .sort(function(a, b){ return b.score - a.score; })
        .map(function(s){ return s.item; });

      render(results, q, terms);
    }

    function hydrateAndSearch(q) {
      if (loaded) { doSearch(q); return; }
      pending = q;
      fetch('{{ "/search.json" | relative_url }}', { headers: { 'Accept': 'application/json' } })
        .then(function(r){ return r.json(); })
        .then(function(data){
          idx = (data || []).map(function(x){
            return { title: x.title || x.name || '', url: x.url, content: x.excerpt || x.content || '' };
          });
          loaded = true;
          if (pending) doSearch(pending);
        })
        .catch(function(){
          if (summary) summary.textContent = 'On‑page search is unavailable right now.';
          announce('On‑page search is unavailable right now.');
        });
    }

    // Debounce input
    var t;
    if (user) {
      user.addEventListener('input', function(e){
        var q = e.target.value;
        clearTimeout(t);
        t = setTimeout(function(){ hydrateAndSearch(q); }, 150);
      });
    }

    // Support q= in the URL (e.g., after a DDG search or direct link)
    var params = new URLSearchParams(location.search);
    var initial = params.get('q') || params.get('q_user');
    if (initial && user) {
      user.value = initial;
      hydrateAndSearch(initial);
    }
  })();
</script>
