---
layout: default
title: Home
description: Community-driven tools, resources, and support for injured workers and persons with disabilities across Canada.
---

# Welcome to 3mpowr App

<strong>Connecting voices, empowering change.</strong>

3mpowr App is a community-driven platform built for injured workers and persons with disabilities across Canada. We’re creating a safe, inclusive space where people can connect, share experiences, and advocate for change.

---

## Why 3mpowr?

3mpowr provides practical tools and a vibrant community to help you:
- <strong>Connect</strong> with others who understand your journey
- <strong>Advocate</strong> for your rights and meaningful change
- <strong>Learn</strong> about resources, rights, and support available to you
- <strong>Grow</strong> through peer support and shared experiences

---

## Features

<ul class="features-grid" role="list" aria-label="Key features">
  <li role="listitem">
    <h3>Community Support</h3>
    <p>Connect with others, share stories, and build solidarity in province-specific spaces.</p>
  </li>
  <li role="listitem">
    <h3>Advocacy & Campaigns</h3>
    <p>Access campaign resources and tools to help drive change in policies and workplaces.</p>
  </li>
  <li role="listitem">
    <h3>Educational Resources</h3>
    <p>Learn your rights, access guides and templates, and stay informed about important issues.</p>
  </li>
  <li role="listitem">
    <h3>Podcasts & Updates</h3>
    <p>Listen to stories, insights, and conversations from the community.</p>
  </li>
</ul>

---

## Get the app

<p>Mobile apps are in progress. Store availability is coming soon.</p>

<ul class="store-badges" role="list" aria-label="App store availability">
  <li role="listitem">
    <figure class="store-badge">
      <img
        src="{{ '/assets/images/app-store-coming-soon.svg' | relative_url }}"
        width="180"
        height="53"
        alt="App Store — coming soon"
      >
      <figcaption class="sr-only">App Store — coming soon</figcaption>
    </figure>
  </li>
  <li role="listitem">
    <figure class="store-badge">
      <img
        src="{{ '/assets/images/google-play-coming-soon.svg' | relative_url }}"
        width="180"
        height="53"
        alt="Google Play — coming soon"
      >
      <figcaption class="sr-only">Google Play — coming soon</figcaption>
    </figure>
  </li>
</ul>

<!-- When live, replace the figures above with anchors like:
<a class="store-link" href="https://apps.apple.com/app/idYOUR_ID">
  <img src="{{ '/assets/images/app-store-badge.svg' | relative_url }}" alt="Download on the App Store">
</a>
-->

---

## Get Involved

Ready to join the movement? Here’s how you can get started:

- <a href="{{ '/beta' | relative_url }}">Become a Beta Tester</a> – Help shape the future of 3mpowr by testing new features
- <a href="{{ '/user-guide' | relative_url }}">Read Our User Guide</a> – Learn how to make the most of the app
- <a href="{{ '/features' | relative_url }}">Explore All Features</a> – Detailed step-by-step guides for every feature
- <a href="{{ '/newsletter' | relative_url }}">Subscribe to Our Newsletter</a> – Stay updated with the latest news and resources
- <a href="{{ '/blog' | relative_url }}">Explore Our Blog</a> – Read stories, updates, and important information

---

{% if site.posts.size > 0 %}
<section aria-labelledby="latest-posts">
  <h2 id="latest-posts">Latest from the blog</h2>
  <ul class="post-list" role="list">
    {% for post in site.posts limit:3 %}
    <li role="listitem">
      <h3 style="margin-bottom: 0.25rem;">
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h3>
      <p><small>{{ post.date | date: "%B %-d, %Y" }}</small></p>
      {% if post.excerpt %}
      <p>{{ post.excerpt }}</p>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
  <p><a href="{{ '/blog' | relative_url }}">See all posts →</a></p>
</section>
---
{% endif %}

## Connect With Us

Follow 3mpowr on social media to stay connected and be part of the community:

- <a href="https://www.facebook.com/3mpowrapp" target="_blank" rel="noopener noreferrer">Facebook</a> – Follow us for updates and community news
- <a href="https://x.com/3mpwrApp0816" target="_blank" rel="noopener noreferrer">X (Twitter)</a> – Join the conversation
- <a href="https://www.instagram.com/3mpowrapp/" target="_blank" rel="noopener noreferrer">Instagram</a> – See our latest posts and stories

---

<strong>Stay informed, empowered, and connected!</strong>

Questions? <a href="{{ '/contact' | relative_url }}">Contact us</a> — we’re here to help.
