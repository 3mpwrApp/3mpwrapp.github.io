---
layout: default
title: Recherche
description: Trouvez rapidement des informations avec des résultats sur la page et un repli DuckDuckGo, limité au site 3mpwrApp.
lang: fr
permalink: /fr/search/
version: 1.1 (Synchronisation docs principales)
lastUpdated: 2026-02-24
---


{%- include status-banner.html -%}

# Rechercher sur le site

**Dernière mise à jour :** 24 février 2026  
**Statut docs :** Page de recherche FR vérifiée et synchronisée avec la navigation publique.

<form id="site-search" action="https://duckduckgo.com/" method="get" role="search" aria-describedby="search-help">
  <fieldset>
    <legend>Rechercher sur ce site</legend>
    <div>
      <label for="q">Termes de recherche</label><br>
      <input id="q" name="q_user" type="search" required inputmode="search" autocomplete="off" spellcheck="true" aria-describedby="search-help results-summary">
      <p id="search-help">Tapez une requête. Les résultats apparaîtront ci-dessous au fur et à mesure que vous tapez. Appuyez sur Entrée pour accéder au premier résultat ou rechercher sur DuckDuckGo.</p>
    </div>
  </fieldset>
  <br>
  <button type="submit">Rechercher</button>

  <!-- Real query sent to DuckDuckGo; filled on submit -->
  <input type="hidden" id="q_real" name="q" value="">
  <input type="hidden" name="t" value="h_">
</form>

<!-- Live region for announcements -->
<div id="search-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>

<!-- On-page results -->
<section id="results" role="region" aria-labelledby="results-heading">
  <h2 id="results-heading">Résultats sur la page</h2>
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
    JavaScript est requis pour afficher les résultats sur la page. En repli, tapez : <code>site:3mpwrapp.github.io vos termes</code> ci-dessus et appuyez sur Entrée pour rechercher avec DuckDuckGo.
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
        if (!term) { e.preventDefault(); return; }
        
        // If we have on-page results, focus first link and prevent default
        var firstLink = list ? list.querySelector('a') : null;
        if (firstLink) {
          e.preventDefault();
          firstLink.focus();
          firstLink.click();
          return;
        }
        
        // Otherwise, submit to DuckDuckGo with site: prefix
        real.value = 'site:3mpwrapp.github.io ' + term;
        announce('Recherche sur DuckDuckGo pour : ' + term);
      });
    }

    // Fetch and cache search data
    var searchData = null;
    var searchRequest = null;
    function loadSearchData() {
      if (searchData) return Promise.resolve(searchData);
      if (searchRequest) return searchRequest;
      
      searchRequest = fetch('/search.json')
        .then(function(response) {
          if (!response.ok) throw new Error('Échec du chargement des données de recherche');
          return response.json();
        })
        .then(function(data) {
          searchData = data;
          searchRequest = null;
          return searchData;
        })
        .catch(function(error) {
          console.error('Erreur de chargement des données de recherche:', error);
          searchRequest = null;
          announce('Impossible de charger les données de recherche. Utilisez DuckDuckGo en repli.');
          return null;
        });
      
      return searchRequest;
    }

    // Search function
    function performSearch(query) {
      if (!query || query.length < 2) {
        list.innerHTML = '';
        summary.textContent = '';
        return;
      }

      loadSearchData().then(function(data) {
        if (!data || !data.length) {
          list.innerHTML = '';
          summary.textContent = 'Aucune donnée de recherche disponible.';
          return;
        }

        var terms = query.toLowerCase().split(/\s+/).filter(function(t){ return t.length > 1; });
        var results = [];

        data.forEach(function(item) {
          var score = 0;
          var titleLower = (item.title || '').toLowerCase();
          var contentLower = (item.content || '').toLowerCase();
          var urlLower = (item.url || '').toLowerCase();

          terms.forEach(function(term) {
            if (titleLower.includes(term)) score += 10;
            if (contentLower.includes(term)) score += 3;
            if (urlLower.includes(term)) score += 2;
          });

          if (score > 0) {
            results.push({ item: item, score: score });
          }
        });

        results.sort(function(a, b) { return b.score - a.score; });
        
        // Limit to top 10 results
        results = results.slice(0, 10);

        if (results.length === 0) {
          list.innerHTML = '<li class="secondary">Aucun résultat trouvé. Essayez des termes différents ou appuyez sur Entrée pour rechercher avec DuckDuckGo.</li>';
          summary.textContent = '0 résultat trouvé';
          announce('0 résultat trouvé pour : ' + query);
        } else {
          list.innerHTML = '';
          results.forEach(function(result, index) {
            var clone = template.content.cloneNode(true);
            var link = clone.querySelector('a');
            var title = clone.querySelector('.result-title a');
            var excerpt = clone.querySelector('.result-excerpt');

            link.href = result.item.url;
            title.textContent = result.item.title || result.item.url;
            
            // Create excerpt
            var content = result.item.content || '';
            var firstTerm = terms[0];
            var pos = content.toLowerCase().indexOf(firstTerm);
            var excerptText = '';
            
            if (pos !== -1) {
              var start = Math.max(0, pos - 60);
              var end = Math.min(content.length, pos + firstTerm.length + 120);
              excerptText = (start > 0 ? '...' : '') + 
                           content.substring(start, end) + 
                           (end < content.length ? '...' : '');
            } else if (content.length > 180) {
              excerptText = content.substring(0, 180) + '...';
            } else {
              excerptText = content;
            }
            
            excerpt.textContent = excerptText;
            list.appendChild(clone);
          });

          summary.textContent = results.length + ' résultat' + (results.length > 1 ? 's' : '') + ' trouvé' + (results.length > 1 ? 's' : '');
          announce(results.length + ' résultat' + (results.length > 1 ? 's' : '') + ' trouvé' + (results.length > 1 ? 's' : '') + ' pour : ' + query);
        }
      });
    }

    // Debounce search
    var searchTimeout;
    if (user) {
      user.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        var query = user.value.trim();
        searchTimeout = setTimeout(function() {
          performSearch(query);
        }, 300);
      });
      
      // Pre-load search data on focus
      user.addEventListener('focus', function() {
        loadSearchData();
      }, { once: true });
    }
  })();
</script>

---

## Conseils de recherche

### Recherche de base
- Tapez simplement vos termes de recherche
- Les résultats apparaissent au fur et à mesure que vous tapez
- Appuyez sur Entrée pour ouvrir le premier résultat

### Recherche avancée
- **Phrase exacte** : Utilisez DuckDuckGo (appuyez sur Entrée) et tapez "votre phrase exacte" entre guillemets
- **Exclure des mots** : Sur DuckDuckGo, utilisez `-mot` pour exclure
- **Recherche sur site** : `site:3mpwrapp.github.io vos termes` sur DuckDuckGo

### Meilleures pratiques
- ✅ Soyez spécifique : "guide accessibilité" plutôt que "aide"
- ✅ Utilisez des mots-clés : "fonctionnalités bêta" plutôt que "qu'est-ce qui est nouveau"
- ✅ Essayez des synonymes : "contact" ou "communiquer" ou "courriel"

## Repli DuckDuckGo

Si les résultats sur la page ne sont pas suffisants :
1. Appuyez sur **Entrée** pour rechercher sur DuckDuckGo
2. Les résultats seront limités à ce site (site:3mpwrapp.github.io)
3. DuckDuckGo respecte votre vie privée (pas de suivi)

## Alternatives de recherche

### Navigation par menu
Utilisez notre navigation principale pour trouver rapidement :
- [Accueil](/fr/) - Page d'accueil
- [À propos](/fr/about/) - À propos de 3mpwrApp
- [Fonctionnalités](/fr/features/) - Toutes les fonctionnalités
- [Guide d'utilisation](/fr/user-guide/) - Guide complet
- [Blog](/fr/blog/) - Actualités et mises à jour
- [FAQ](/fr/faq/) - Questions fréquentes

### Plan du site
Consultez notre [Plan du site](/fr/site-map/) pour une vue d'ensemble de toutes les pages.

### Contactez-nous
Vous ne trouvez pas ce que vous cherchez ? [Contactez-nous](/fr/contact/) !

---

## Accessibilité de la recherche

Cette fonctionnalité de recherche est conçue avec l'accessibilité à l'esprit :

- ✅ **Navigation au clavier** : Tab/Shift+Tab pour naviguer, Entrée pour sélectionner
- ✅ **Lecteurs d'écran** : Annonces ARIA pour les résultats et les états
- ✅ **Contraste élevé** : Fonctionne avec tous les modes d'affichage
- ✅ **Pas de limite de temps** : Tapez à votre rythme
- ✅ **Repli gracieux** : Fonctionne sans JavaScript (DuckDuckGo)

Des problèmes ? Contactez [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com)

---

Bonne recherche ! 🔍

{%- include page-feedback.html -%}
