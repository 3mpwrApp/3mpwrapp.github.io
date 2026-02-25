---
layout: default
title: Blog
description: Nouvelles, mises à jour et histoires de la communauté 3mpwrApp.
lang: fr
permalink: /fr/blog/
version: 1.1 (Synchronisation docs principales)
lastUpdated: 2026-02-24
---


{%- include status-banner.html -%}

# Blog 3mpwrApp

**Dernière mise à jour :** 24 février 2026  
**Statut docs :** Page blog FR synchronisée avec le cadre documentaire public.

Bienvenue sur notre blog !  
Restez à l'écoute pour des mises à jour, des histoires et des nouvelles.

- Abonnez-vous à notre flux RSS : [feed.xml]({{ '/feed.xml' | relative_url }})

<hr>

{% for post in site.posts %}
<article>
  <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
  <p><small>{{ post.date | date: "%-d %B %Y" }}</small></p>
  {% if post.excerpt %}
  <p>{{ post.excerpt }}</p>
  {% endif %}
</article>
<hr>
{% endfor %}

<!-- Pour ajouter un article de blog, créez un fichier markdown dans le répertoire _posts/ avec le format AAAA-MM-JJ-titre.md -->

<hr>

## Fil quotidien organisé

<p id="curated-daily">Points saillants quotidiens recueillis à partir de sources fiables partout au Canada. Mis à jour automatiquement une fois par jour.</p>

{% assign daily = site.posts | where_exp: 'p', "p.tags contains 'highlights'" %}
{% if daily and daily.size > 0 %}
  {% for post in daily %}
  <article>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p><small>{{ post.date | date: "%-d %B %Y" }}</small></p>
    {% if post.excerpt %}
    <p>{{ post.excerpt }}</p>
    {% endif %}
  </article>
  <hr>
  {% endfor %}
{% else %}
  <p>Aucun point saillant organisé pour le moment. Revenez bientôt.</p>
{% endif %}

---

## Catégories

Explorez notre blog par sujet :

- [Mises à jour produit](#product-updates) - Nouvelles fonctionnalités et améliorations
- [Histoires communautaires](#community-stories) - Expériences inspirantes d'utilisateurs
- [Guides et tutoriels](#guides) - Apprenez à utiliser 3mpwrApp
- [Actualités santé mentale](#mental-health) - Ressources et informations
- [Événements](#events) - Ateliers, webinaires et rencontres

## Restez informé

Ne manquez jamais une mise à jour :

- 📧 [Abonnez-vous à notre infolettre](/fr/newsletter/)
- 📱 [Suivez-nous sur les médias sociaux](/fr/#social-links)
- 🔔 [Activez les notifications RSS](/feed.xml)
- 💬 [Rejoignez notre communauté](/fr/about/#community)

## Contribuer

Vous avez une histoire à partager ? Nous aimerions l'entendre !

- **Articles invités** : Partagez votre expérience avec 3mpwrApp
- **Témoignages** : Comment 3mpwrApp vous a aidé
- **Conseils et astuces** : Vos façons créatives d'utiliser l'application

Contactez-nous à [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com) avec le sujet "Contribution blog".

---

Merci de faire partie de notre communauté ! 💚

{%- include page-feedback.html -%}
