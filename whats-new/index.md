---
layout: default
title: What's New
permalink: /whats-new/
---

# What's New

Track all updates to the site in one place. Entries from the last 30 days appear first; older items automatically move to the Archive below.

<details>
  <summary>Auto-generated site changes (from recent commits)</summary>
  <p>Below is a recent history of changes pulled from the repository. On GitHub Pages, this may show entries only when build metadata is available.</p>
  <ul>
  {%- assign gitlog = site.data.gitlog | default: nil -%}
  {%- if gitlog and gitlog.size > 0 -%}
    {%- for c in gitlog limit: 50 -%}
      <li><strong>{{ c.date }}</strong> — {{ c.message }} <small>{{ c.hash | slice: 0, 7 }}</small></li>
    {%- endfor -%}
  {%- else -%}
    <li><em>Commit history not available in this build. Manual entries and the archive appear below.</em></li>
  {%- endif -%}
  </ul>
  <p><a href="{{ site.github.repository_url | default: 'https://github.com/3mpowrApp/3mpwrapp.github.io' }}">View repository</a></p>
  </details>

Subscribe to updates: RSS · [What's New feed]({{ '/whats-new/feed.xml' | relative_url }})

{% assign now = 'now' | date: '%s' | plus: 0 %}
{% assign cutoff_seconds = 30 | times: 24 | times: 60 | times: 60 | plus: 0 %}
{% assign cutoff = now | minus: cutoff_seconds | plus: 0 %}
{% assign recent_all = site.whats_new | sort: 'date' | reverse %}

## Recent (last 30 days)

<ul>
{% for item in recent_all %}
  {% assign item_seconds = item.date | date: '%s' | plus: 0 %}
  {% if item_seconds >= cutoff %}
    <li>
      <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
      <small> — {{ item.date | date_to_long_string }}</small>
      {% if item.excerpt %}<div>{{ item.excerpt }}</div>{% endif %}
    </li>
  {% endif %}
{% endfor %}
</ul>

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
