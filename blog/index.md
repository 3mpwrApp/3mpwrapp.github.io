---
layout: default
title: Blog
description: News, updates, and stories from the 3mpowr community.
---

# 3mpowr App Blog

Welcome to our blog!  
Stay tuned for updates, stories, and news.

- Subscribe to our RSS feed: [feed.xml]({{ '/feed.xml' | relative_url }})

<hr>

{% for post in site.posts %}
<article>
  <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
  <p><small>{{ post.date | date: "%B %-d, %Y" }}</small></p>
  {% if post.excerpt %}
  <p>{{ post.excerpt }}</p>
  {% endif %}
</article>
<hr>
{% endfor %}

<!-- To add a blog post, create a markdown file in the _posts/ directory with the format YYYY-MM-DD-title.md -->

<hr>

## Curated daily feed

<p id="curated-daily">Daily highlights gathered from trusted sources across Canada. Updated automatically once per day.</p>

{% assign daily = site.posts | where_exp: 'p', "p.tags contains 'highlights'" %}
{% if daily and daily.size > 0 %}
  {% for post in daily %}
  <article>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <p><small>{{ post.date | date: "%B %-d, %Y" }}</small></p>
    {% if post.excerpt %}
    <p>{{ post.excerpt }}</p>
    {% endif %}
  </article>
  <hr>
  {% endfor %}
{% else %}
  <p>No curated highlights yet. Check back soon.</p>
{% endif %}
