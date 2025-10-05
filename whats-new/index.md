---
layout: default
title: What's New
permalink: /whats-new/
---

# What's New

Here are the latest updates and improvements to the website and project.

Subscribe to updates:

- RSS: [What's New feed]({{ '/whats-new/feed.xml' | relative_url }})

{% assign now = 'now' | date: '%s' %}
{% assign cutoff_seconds = 30 | times: 24 | times: 60 | times: 60 %}
{% assign cutoff = now | minus: cutoff_seconds %}

<ul>
{% assign recent = site.whats_new | sort: 'date' | reverse %}
{% for item in recent %}
  {% assign item_seconds = item.date | date: '%s' %}
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
  {% assign item_seconds = item.date | date: '%s' %}
  {% if item_seconds < cutoff %}
  <li>
    <a href="{{ item.url | relative_url }}">{{ item.title }}</a>
    <small>— {{ item.date | date_to_long_string }}</small>
  </li>
  {% endif %}
{% endfor %}
</ul>
