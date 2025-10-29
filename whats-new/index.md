---
layout: default
title: What's New
description: Track all updates and improvements to 3mpwrApp. Stay informed about new features, bug fixes, and site enhancements.
permalink: /whats-new/
---


{%- include status-banner.html -%}

# What's New

Track all updates to the site in one place. Entries from the last 30 days appear first; older items automatically move to the Archive below. We summarize meaningful changes in plain language without showing technical commit IDs.

Subscribe to updates: RSS · [What's New feed]({{ '/whats-new/feed.xml' | relative_url }})

{% assign now = 'now' | date: '%s' | plus: 0 %}
{% assign cutoff_seconds = 30 | times: 24 | times: 60 | times: 60 | plus: 0 %}
{% assign cutoff = now | minus: cutoff_seconds | plus: 0 %}
{% assign recent_all = site.whats_new | sort: 'date' | reverse %}

## Recent (last 30 days) {: #recent }

<ul>
{% for item in recent_all %}
  {% assign item_seconds = item.date | date: '%s' | plus: 0 %}
  {% if item_seconds >= cutoff %}
    <li data-date="{{ item.date | date: '%Y-%m-%d' }}">
      <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
      <small> — {{ item.date | date_to_long_string }}</small>
      {% if item.excerpt %}<div>{{ item.excerpt }}</div>{% endif %}
    </li>
  {% endif %}
{% endfor %}
</ul>

<script>
// Defensive check: if any items older than 30 days were rendered here by stale caches,
// hide them on the client. Uses the date text inside the <small> element.
(function(){
  try {
    const now = Date.now();
    const cutoffMs = 30 * 24 * 60 * 60 * 1000;
    document.querySelectorAll('h2#recent + ul li').forEach(li => {
      const iso = li.getAttribute('data-date');
      const dt = iso ? Date.parse(iso) : NaN;
      if (!isNaN(dt)) {
        if ((now - dt) > cutoffMs) {
          li.style.display = 'none';
        }
      }
    });
  } catch (e) { /* noop */ }
})();
</script>

## Archive

Updates older than 30 days are archived here, grouped by month.

{% assign archive = '' | split: '' %}
{% for item in recent_all %}
  {% assign item_seconds = item.date | date: '%s' | plus: 0 %}
  {% if item_seconds < cutoff %}
    {% assign archive = archive | push: item %}
  {% endif %}
{% endfor %}

{% assign grouped = archive | group_by_exp: 'post','post.date | date: "%Y-%m"' %}
{% for g in grouped %}
  <h3>{{ g.name | date: "%B %Y" }}</h3>
  <ul>
  {% for item in g.items %}
    <li>
      <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
      <small> — {{ item.date | date_to_long_string }}</small>
    </li>
  {% endfor %}
  </ul>
{% endfor %}

<details>
  <summary>All updates (since launch)</summary>
  <ul>
  {% for item in recent_all %}
    <li>
      <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
      <small> — {{ item.date | date_to_long_string }}</small>
    </li>
  {% endfor %}
  </ul>
</details>

{%- include page-feedback.html -%}
