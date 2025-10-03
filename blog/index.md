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
  <p>{{ post.excerpt }}</p>
  <p><a href="{{ post.url | relative_url }}">Read more →</a></p>
</article>
<hr>
{% endfor %}

<!-- To add a blog post, create a markdown file in the _posts/ directory with the format YYYY-MM-DD-title.md -->
