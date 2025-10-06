---
layout: default
title: What's New
permalink: /whats-new/
---

# What's New

Here are the latest updates and improvements to the website and project.

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

Subscribe to updates:

- RSS: [What's New feed]({{ '/whats-new/feed.xml' | relative_url }})

{% assign now = 'now' | date: '%s' | plus: 0 %}
{% assign cutoff_seconds = 30 | times: 24 | times: 60 | times: 60 | plus: 0 %}
{% assign cutoff = now | minus: cutoff_seconds | plus: 0 %}

<ul>
{% assign recent = site.whats_new | sort: 'date' | reverse %}
{% for item in recent %}
  {% assign item_seconds = item.date | date: '%s' | plus: 0 %}
  {% if item_seconds >= cutoff %}
  <li>
    <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
    <small>— {{ item.date | date_to_long_string }}</small>
    {% if item.excerpt %}<div>{{ item.excerpt }}</div>{% endif %}
  </li>
  {% endif %}
{% endfor %}
</ul>

## Archive

Updates older than 30 days are archived here.

<ul>
{% for item in recent %}
  {% assign item_seconds = item.date | date: '%s' | plus: 0 %}
  {% if item_seconds < cutoff %}
  <li>
    <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
    <small>— {{ item.date | date_to_long_string }}</small>
  </li>
  {% endif %}
{% endfor %}
</ul>
