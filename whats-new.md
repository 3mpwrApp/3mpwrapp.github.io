---------

layout: default

title: What's Newlayout: defaultlayout: default

description: Latest updates, features, and improvements to 3mpwrApp

permalink: /whats-new/title: What's Newtitle: What's New

---

description: Latest updates, features, and improvements to 3mpwrAppdescription: Latest updates, features, and improvements to 3mpwrApp

# What's New at 3mpwr App 🎉

permalink: /whats-new/permalink: /whats-new/

See what's changed recently! We're constantly improving 3mpwr App to better serve the disability and injured workers community.

------

---



## 🆕 Recent Updates (Last 30 Days)

# What's New at 3mpwr App 🎉# What's New 🎉

<p class="intro-text">Here's what we've been working on this month:</p>



{% assign current_time = site.time | date: '%s' | plus: 0 %}

{% assign thirty_days_ago = current_time | minus: 2592000 %}See what's changed recently! We're constantly improving 3mpwr App to better serve the disability and injured workers community.Stay up to date with the latest features, improvements, and fixes to 3mpwrApp.

{% assign recent_updates = "" | split: "" %}



{% for update in site.data.updates %}

  {% assign update_timestamp = update.date | date: '%s' | plus: 0 %}------

  {% if update_timestamp >= thirty_days_ago %}

    {% assign recent_updates = recent_updates | push: update %}

  {% endif %}

{% endfor %}## 🆕 Recent Updates (Last 30 Days)## Recent Updates (Last 30 Days)



{% if recent_updates.size > 0 %}

<div class="updates-simple">

{% for update in recent_updates %}<p class="intro-text">Here's what we've been working on this month:</p>{% assign current_time = site.time | date: '%s' | plus: 0 %}

  <div class="update-card">

    <div class="update-icon">{% assign thirty_days_ago = current_time | minus: 2592000 %}

      {% if update.type == 'feature' %}✨

      {% elsif update.type == 'improvement' %}🚀{% assign current_time = site.time | date: '%s' | plus: 0 %}

      {% elsif update.type == 'fix' %}🔧

      {% elsif update.type == 'security' %}🔒{% assign thirty_days_ago = current_time | minus: 2592000 %}<div class="updates-list">

      {% elsif update.type == 'accessibility' %}♿

      {% elsif update.type == 'performance' %}⚡{% assign recent_updates = "" | split: "" %}{% for update in site.data.updates %}

      {% else %}📝

      {% endif %}  {% assign update_timestamp = update.date | date: '%s' | plus: 0 %}

    </div>

    <div class="update-content">{% for update in site.data.updates %}  {% if update_timestamp >= thirty_days_ago %}

      <h3 class="update-title">{{ update.title }}</h3>

      <p class="update-date">{{ update.date | date: '%B %d, %Y' }}</p>  {% assign update_timestamp = update.date | date: '%s' | plus: 0 %}  <article class="update-item" data-date="{{ update.date }}">

      <p class="update-description">{{ update.description }}</p>

      {% if update.details %}  {% if update_timestamp >= thirty_days_ago %}    <header class="update-header">

      <details class="update-more">

        <summary>More details</summary>    {% assign recent_updates = recent_updates | push: update %}      <h3>{{ update.title }}</h3>

        <div class="update-details-text">{{ update.details | markdownify }}</div>

      </details>  {% endif %}      <time datetime="{{ update.date | date: '%Y-%m-%d' }}">

      {% endif %}

      {% if update.link %}{% endfor %}        {{ update.date | date: '%B %d, %Y' }}

      <a href="{{ update.link }}" class="update-learn-more">Learn more →</a>

      {% endif %}      </time>

    </div>

  </div>{% if recent_updates.size > 0 %}      {% if update.type %}

{% endfor %}

</div><div class="updates-simple">      <span class="update-type update-type-{{ update.type }}">

{% else %}

<div class="empty-message">{% for update in recent_updates %}        {% if update.type == 'feature' %}✨ Feature

  <p>🎯 <strong>You're all caught up!</strong></p>

  <p>No new updates in the last 30 days, but we're always working on improvements behind the scenes.</p>  <div class="update-card">        {% elsif update.type == 'improvement' %}🚀 Improvement

</div>

{% endif %}    <div class="update-icon">        {% elsif update.type == 'fix' %}🐛 Fix



---      {% if update.type == 'feature' %}✨        {% elsif update.type == 'security' %}🔒 Security



## 📚 What Do These Updates Mean?      {% elsif update.type == 'improvement' %}🚀        {% elsif update.type == 'accessibility' %}♿ Accessibility



<div class="update-types-guide">      {% elsif update.type == 'fix' %}🔧        {% elsif update.type == 'performance' %}⚡ Performance

  <div class="type-card">

    <span class="type-icon">✨</span>      {% elsif update.type == 'security' %}🔒        {% else %}📝 Update

    <strong>New Feature</strong>

    <p>Brand new tools or capabilities added to 3mpwr App</p>      {% elsif update.type == 'accessibility' %}♿        {% endif %}

  </div>

        {% elsif update.type == 'performance' %}⚡      </span>

  <div class="type-card">

    <span class="type-icon">🚀</span>      {% else %}📝      {% endif %}

    <strong>Improvement</strong>

    <p>We made something work better or easier to use</p>      {% endif %}    </header>

  </div>

      </div>    

  <div class="type-card">

    <span class="type-icon">🔧</span>    <div class="update-content">    <div class="update-content">

    <strong>Bug Fix</strong>

    <p>We fixed something that wasn't working properly</p>      <h3 class="update-title">{{ update.title }}</h3>      {{ update.description | markdownify }}

  </div>

        <p class="update-date">{{ update.date | date: '%B %d, %Y' }}</p>    </div>

  <div class="type-card">

    <span class="type-icon">♿</span>      <p class="update-description">{{ update.description }}</p>    

    <strong>Accessibility</strong>

    <p>Better support for screen readers and assistive technology</p>      {% if update.details %}    {% if update.details %}

  </div>

        <details class="update-more">    <details class="update-details">

  <div class="type-card">

    <span class="type-icon">🔒</span>        <summary>More details</summary>      <summary>View Details</summary>

    <strong>Security</strong>

    <p>Enhanced protection for your data and privacy</p>        <div class="update-details-text">{{ update.details | markdownify }}</div>      <div class="update-details-content">

  </div>

        </details>        {{ update.details | markdownify }}

  <div class="type-card">

    <span class="type-icon">⚡</span>      {% endif %}      </div>

    <strong>Performance</strong>

    <p>Faster loading and smoother experience</p>      {% if update.link %}    </details>

  </div>

</div>      <a href="{{ update.link }}" class="update-learn-more">Learn more →</a>    {% endif %}



---      {% endif %}    



## 🔔 Stay Updated    </div>    {% if update.link %}



<div class="stay-updated-box">  </div>    <a href="{{ update.link }}" class="update-link">Learn More →</a>

  <h3>Never miss an update!</h3>

  <p>Choose how you'd like to hear about new features and improvements:</p>{% endfor %}    {% endif %}

  

  <div class="subscription-buttons"></div>  </article>

    <a href="/newsletter/" class="btn btn-primary">

      <span class="btn-icon">📧</span>{% else %}  {% endif %}

      Email Newsletter

    </a><div class="empty-message">{% endfor %}

    <a href="https://github.com/3mpowrApp/3mpwrapp.github.io/releases" class="btn btn-secondary" target="_blank" rel="noopener">

      <span class="btn-icon">👀</span>  <p>🎯 <strong>You're all caught up!</strong></p></div>

      GitHub Updates

    </a>  <p>No new updates in the last 30 days, but we're always working on improvements behind the scenes.</p>

  </div>

  </div>---

  <p class="follow-social">

    Or follow us on social media:{% endif %}

    <a href="https://www.facebook.com/3mpowrapp">Facebook</a> •

    <a href="https://x.com/3mpowrApp0816">X</a> •## Archives

    <a href="https://www.instagram.com/3mpowrapp/">Instagram</a>

  </p>---

</div>

View updates from previous months to see how 3mpwrApp has evolved.

---

## 📚 What Do These Updates Mean?

## 💡 Have a Suggestion?

<div class="archives-list">

<div class="suggestion-box">

  <p><strong>We'd love to hear your ideas!</strong></p><div class="update-types-guide">  <a href="/whats-new/archives/" class="archive-link">📦 View All Archives →</a>

  <p>Have a feature request or suggestion for how we can improve 3mpwr App? Let us know!</p>

  <a href="/contact/?subject=Feature Request" class="btn btn-accent">💡 Share Your Idea</a>  <div class="type-card"></div>

</div>

    <span class="type-icon">✨</span>

---

    <strong>New Feature</strong>---

## 📦 View Older Updates

    <p>Brand new tools or capabilities added to 3mpwr App</p>

<details class="archives-dropdown">

  <summary>View update history from previous months</summary>  </div>## Stay Updated

  <div class="archives-content">

    <p>Coming soon: Archive of all past updates organized by month and year.</p>  

    <p>For now, you can view all updates on our <a href="https://github.com/3mpowrApp/3mpwrapp.github.io/releases">GitHub Releases page</a>.</p>

  </div>  <div class="type-card"><div class="update-subscription">

</details>

    <span class="type-icon">🚀</span>  <h3>Never Miss an Update</h3>

---

    <strong>Improvement</strong>  <p>Get notified when we release new features and improvements.</p>

<style>

/* Simple, friendly styling with dark mode and high contrast support */    <p>We made something work better or easier to use</p>  

.intro-text {

  font-size: 1.1rem;  </div>  <div class="subscription-options">

  color: var(--text-secondary, #555);

  margin-bottom: 2rem;      <a href="/newsletter/" class="btn btn-primary">📧 Subscribe to Newsletter</a>

}

  <div class="type-card">    <a href="https://github.com/3mpowrApp/3mpwrapp.github.io/releases" class="btn btn-secondary" target="_blank">👀 Watch on GitHub</a>

.updates-simple {

  display: flex;    <span class="type-icon">🔧</span>  </div>

  flex-direction: column;

  gap: 1.5rem;    <strong>Bug Fix</strong></div>

  margin: 2rem 0;

}    <p>We fixed something that wasn't working properly</p>



.update-card {  </div>---

  display: flex;

  gap: 1rem;  

  background: var(--main-bg, white);

  border: 2px solid var(--border-color, #e0e0e0);  <div class="type-card">## Suggest a Feature

  border-radius: 12px;

  padding: 1.5rem;    <span class="type-icon">♿</span>

  transition: all 0.3s ease;

  color: var(--text-color, #333);    <strong>Accessibility</strong>Have an idea for a new feature? We'd love to hear it!

}

    <p>Better support for screen readers and assistive technology</p>

.update-card:hover {

  border-color: var(--link-color, #007bff);  </div><a href="/contact/?subject=Feature Request" class="btn btn-secondary">💡 Submit Your Idea</a>

  box-shadow: 0 4px 12px rgba(0,123,255,0.1);

}  



.update-icon {  <div class="type-card"><style>

  font-size: 2rem;

  min-width: 50px;    <span class="type-icon">🔒</span>.updates-list {

  text-align: center;

}    <strong>Security</strong>  margin: 2rem 0;



.update-content {    <p>Enhanced protection for your data and privacy</p>}

  flex: 1;

}  </div>



.update-title {  .update-item {

  margin: 0 0 0.5rem;

  font-size: 1.25rem;  <div class="type-card">  background: var(--card-bg, #f9f9f9);

  color: var(--text-color, #333);

}    <span class="type-icon">⚡</span>  border: 1px solid var(--border-color, #ddd);



.update-date {    <strong>Performance</strong>  border-radius: 8px;

  color: var(--text-secondary, #666);

  font-size: 0.9rem;    <p>Faster loading and smoother experience</p>  padding: 1.5rem;

  margin: 0 0 0.75rem;

}  </div>  margin-bottom: 1.5rem;



.update-description {</div>  transition: box-shadow 0.3s ease;

  color: var(--text-color, #444);

  line-height: 1.6;}

  margin: 0.5rem 0;

}---



.update-more {.update-item:hover {

  margin-top: 1rem;

}## 🔔 Stay Updated  box-shadow: 0 4px 12px rgba(0,0,0,0.1);



.update-more summary {}

  cursor: pointer;

  color: var(--link-color, #007bff);<div class="stay-updated-box">

  font-weight: 600;

  list-style: none;  <h3>Never miss an update!</h3>.update-header {

}

  <p>Choose how you'd like to hear about new features and improvements:</p>  display: flex;

.update-more summary::-webkit-details-marker {

  display: none;    flex-wrap: wrap;

}

  <div class="subscription-buttons">  align-items: center;

.update-more summary:hover {

  text-decoration: underline;    <a href="/newsletter/" class="btn btn-primary">  gap: 1rem;

}

      <span class="btn-icon">📧</span>  margin-bottom: 1rem;

.update-details-text {

  margin-top: 0.75rem;      Email Newsletter}

  padding-left: 1rem;

  border-left: 3px solid var(--link-color, #007bff);    </a>

  color: var(--text-secondary, #555);

}    <a href="https://github.com/3mpowrApp/3mpwrapp.github.io/releases" class="btn btn-secondary" target="_blank" rel="noopener">.update-header h3 {



.update-learn-more {      <span class="btn-icon">👀</span>  margin: 0;

  display: inline-block;

  margin-top: 0.75rem;      GitHub Updates  flex: 1;

  color: var(--link-color, #007bff);

  text-decoration: none;    </a>}

  font-weight: 600;

}  </div>



.update-learn-more:hover {  .update-header time {

  text-decoration: underline;

  color: var(--link-hover, #0056b3);  <p class="follow-social">  color: var(--text-secondary, #666);

}

    Or follow us on social media:  font-size: 0.9rem;

.empty-message {

  background: var(--card-bg, #f0f8ff);    <a href="https://www.facebook.com/3mpowrapp">Facebook</a> •}

  border: 2px solid var(--border-color, #b3d9ff);

  border-radius: 12px;    <a href="https://x.com/3mpowrApp0816">X</a> •

  padding: 3rem 2rem;

  text-align: center;    <a href="https://www.instagram.com/3mpowrapp/">Instagram</a>.update-type {

  margin: 2rem 0;

  color: var(--text-color, #333);  </p>  display: inline-block;

}

</div>  padding: 0.25rem 0.75rem;

.empty-message p:first-child {

  font-size: 1.25rem;  border-radius: 12px;

  margin-bottom: 0.5rem;

}---  font-size: 0.85rem;



.update-types-guide {  font-weight: 600;

  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));## 💡 Have a Suggestion?}

  gap: 1rem;

  margin: 2rem 0;

}

<div class="suggestion-box">.update-type-feature {

.type-card {

  background: var(--card-bg, #f9f9f9);  <p><strong>We'd love to hear your ideas!</strong></p>  background: #e3f2fd;

  border: 1px solid var(--border-color, #ddd);

  border-radius: 8px;  <p>Have a feature request or suggestion for how we can improve 3mpwr App? Let us know!</p>  color: #1976d2;

  padding: 1.25rem;

  text-align: center;  <a href="/contact/?subject=Feature Request" class="btn btn-accent">💡 Share Your Idea</a>}

  color: var(--text-color, #333);

}</div>



.type-icon {.update-type-improvement {

  font-size: 2rem;

  display: block;---  background: #f3e5f5;

  margin-bottom: 0.5rem;

}  color: #7b1fa2;



.type-card strong {## 📦 View Older Updates}

  display: block;

  margin: 0.5rem 0;

  color: var(--text-color, #333);

}<details class="archives-dropdown">.update-type-fix {



.type-card p {  <summary>View update history from previous months</summary>  background: #fff3e0;

  margin: 0.5rem 0 0;

  font-size: 0.9rem;  <div class="archives-content">  color: #e65100;

  color: var(--text-secondary, #666);

}    <p>Coming soon: Archive of all past updates organized by month and year.</p>}



.stay-updated-box {    <p>For now, you can view all updates on our <a href="https://github.com/3mpowrApp/3mpwrapp.github.io/releases">GitHub Releases page</a>.</p>

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  color: white;  </div>.update-type-security {

  padding: 2.5rem;

  border-radius: 16px;</details>  background: #ffebee;

  text-align: center;

  margin: 2rem 0;  color: #c62828;

}

---}

.stay-updated-box h3 {

  margin: 0 0 0.5rem;

  color: white;

  font-size: 1.5rem;<style>.update-type-accessibility {

}

/* Simple, friendly styling */  background: #e8f5e9;

.stay-updated-box > p {

  margin: 0.5rem 0 1.5rem;.intro-text {  color: #2e7d32;

  opacity: 0.95;

}  font-size: 1.1rem;}



.subscription-buttons {  color: #555;

  display: flex;

  gap: 1rem;  margin-bottom: 2rem;.update-type-performance {

  justify-content: center;

  flex-wrap: wrap;}  background: #fff9c4;

  margin: 1.5rem 0;

}  color: #f57f17;



.btn {.updates-simple {}

  display: inline-flex;

  align-items: center;  display: flex;

  gap: 0.5rem;

  padding: 0.875rem 1.75rem;  flex-direction: column;.update-content {

  border-radius: 8px;

  text-decoration: none;  gap: 1.5rem;  margin: 1rem 0;

  font-weight: 600;

  font-size: 1rem;  margin: 2rem 0;  line-height: 1.6;

  transition: all 0.3s ease;

  border: none;}}

}



.btn-icon {

  font-size: 1.25rem;.update-card {.update-details {

}

  display: flex;  margin-top: 1rem;

.btn-primary {

  background: white;  gap: 1rem;  border-top: 1px solid var(--border-color, #ddd);

  color: #667eea;

}  background: white;  padding-top: 1rem;



.btn-primary:hover {  border: 2px solid #e0e0e0;}

  transform: translateY(-2px);

  box-shadow: 0 6px 20px rgba(0,0,0,0.2);  border-radius: 12px;

}

  padding: 1.5rem;.update-details summary {

.btn-secondary {

  background: rgba(255,255,255,0.2);  transition: all 0.3s ease;  cursor: pointer;

  color: white;

  border: 2px solid white;}  font-weight: 600;

}

  color: var(--primary-color, #007bff);

.btn-secondary:hover {

  background: white;.update-card:hover {}

  color: #667eea;

}  border-color: #007bff;



.btn-accent {  box-shadow: 0 4px 12px rgba(0,123,255,0.1);.update-details-content {

  background: #ff6b6b;

  color: white;}  margin-top: 1rem;

  padding: 0.875rem 2rem;

}  padding-left: 1rem;



.btn-accent:hover {.update-icon {}

  background: #ff5252;

  transform: translateY(-2px);  font-size: 2rem;

  box-shadow: 0 6px 20px rgba(255,107,107,0.3);

}  min-width: 50px;.update-link {



.follow-social {  text-align: center;  display: inline-block;

  margin-top: 1.5rem;

  font-size: 0.95rem;}  margin-top: 1rem;

  opacity: 0.9;

}  color: var(--primary-color, #007bff);



.follow-social a {.update-content {  text-decoration: none;

  color: white;

  text-decoration: underline;  flex: 1;  font-weight: 600;

}

}}

.suggestion-box {

  background: var(--card-bg, #fff8e1);

  border: 2px solid var(--border-color, #ffd54f);

  border-radius: 12px;.update-title {.update-link:hover {

  padding: 2rem;

  text-align: center;  margin: 0 0 0.5rem;  text-decoration: underline;

  margin: 2rem 0;

}  font-size: 1.25rem;}



.suggestion-box p:first-child {  color: #333;

  font-size: 1.15rem;

  margin-bottom: 0.5rem;}.archives-list {

  color: var(--text-color, #333);

}  text-align: center;



.suggestion-box p {.update-date {  margin: 2rem 0;

  color: var(--text-secondary, #555);

  margin: 0.5rem 0 1.5rem;  color: #666;}

}

  font-size: 0.9rem;

.archives-dropdown {

  background: var(--card-bg, #f5f5f5);  margin: 0 0 0.75rem;.archive-link {

  border: 1px solid var(--border-color, #ddd);

  border-radius: 8px;}  display: inline-block;

  padding: 1rem;

  margin: 2rem 0;  padding: 1rem 2rem;

}

.update-description {  background: var(--card-bg, #f9f9f9);

.archives-dropdown summary {

  cursor: pointer;  color: #444;  border: 2px solid var(--border-color, #ddd);

  font-weight: 600;

  color: var(--link-color, #007bff);  line-height: 1.6;  border-radius: 8px;

  padding: 0.5rem;

  list-style: none;  margin: 0.5rem 0;  color: var(--text-color, #333);

}

}  text-decoration: none;

.archives-dropdown summary::-webkit-details-marker {

  display: none;  font-weight: 600;

}

.update-more {  transition: all 0.3s ease;

.archives-dropdown summary:hover {

  text-decoration: underline;  margin-top: 1rem;}

}

}

.archives-content {

  padding: 1rem;.archive-link:hover {

  margin-top: 0.5rem;

}.update-more summary {  background: var(--primary-color, #007bff);



.archives-content p {  cursor: pointer;  color: white;

  margin: 0.5rem 0;

  color: var(--text-secondary, #555);  color: #007bff;  border-color: var(--primary-color, #007bff);

}

  font-weight: 600;}

/* Dark mode specific styles */

body[data-theme="dark"] .update-card {  list-style: none;

  background: var(--main-bg, #111a2b);

  border-color: var(--border-color, #355c7d);}.update-subscription {

}

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

body[data-theme="dark"] .empty-message {

  background: var(--main-bg, #111a2b);.update-more summary::-webkit-details-marker {  color: white;

  border-color: var(--border-color, #355c7d);

}  display: none;  padding: 2rem;



body[data-theme="dark"] .type-card,}  border-radius: 12px;

body[data-theme="dark"] .suggestion-box,

body[data-theme="dark"] .archives-dropdown {  text-align: center;

  background: var(--main-bg, #111a2b);

  border-color: var(--border-color, #355c7d);.update-more summary:hover {  margin: 2rem 0;

}

  text-decoration: underline;}

body[data-theme="dark"] .stay-updated-box {

  background: linear-gradient(135deg, #4a5fa2 0%, #5a3d7a 100%);}

}

.update-subscription h3 {

/* High contrast mode */

body[data-contrast="high"] .update-card,.update-details-text {  margin-top: 0;

body[data-contrast="high"] .type-card,

body[data-contrast="high"] .suggestion-box,  margin-top: 0.75rem;  color: white;

body[data-contrast="high"] .archives-dropdown {

  border: 3px solid #000 !important;  padding-left: 1rem;}

}

  border-left: 3px solid #007bff;

body[data-contrast="high"] .stay-updated-box {

  border: 3px solid #000 !important;  color: #555;.subscription-options {

}

}  display: flex;

body[data-contrast="high"] .btn {

  border: 3px solid #000 !important;  gap: 1rem;

}

.update-learn-more {  justify-content: center;

body[data-contrast="high"] .btn-primary {

  background: #000 !important;  display: inline-block;  flex-wrap: wrap;

  color: #fff !important;

}  margin-top: 0.75rem;  margin-top: 1.5rem;



body[data-contrast="high"] .btn-secondary {  color: #007bff;}

  background: #fff !important;

  color: #000 !important;  text-decoration: none;

  border-color: #000 !important;

}  font-weight: 600;.btn {



body[data-contrast="high"] .btn-accent {}  display: inline-block;

  background: #000 !important;

  color: #fff !important;  padding: 0.75rem 1.5rem;

  border: 3px solid #fff !important;

}.update-learn-more:hover {  border-radius: 8px;



@media (max-width: 768px) {  text-decoration: underline;  text-decoration: none;

  .update-card {

    flex-direction: column;}  font-weight: 600;

    text-align: center;

  }  transition: all 0.3s ease;

  

  .update-icon {.empty-message {}

    margin-bottom: 0.5rem;

  }  background: #f0f8ff;

  

  .subscription-buttons {  border: 2px solid #b3d9ff;.btn-primary {

    flex-direction: column;

    align-items: stretch;  border-radius: 12px;  background: white;

  }

    padding: 3rem 2rem;  color: #667eea;

  .btn {

    justify-content: center;  text-align: center;}

  }

    margin: 2rem 0;

  .update-types-guide {

    grid-template-columns: 1fr;}.btn-primary:hover {

  }

}  transform: translateY(-2px);



/* Accessibility improvements */.empty-message p:first-child {  box-shadow: 0 4px 12px rgba(0,0,0,0.2);

@media (prefers-reduced-motion: reduce) {

  .update-card,  font-size: 1.25rem;}

  .btn {

    transition: none;  margin-bottom: 0.5rem;

  }

  }.btn-secondary {

  .btn:hover {

    transform: none;  background: rgba(255,255,255,0.2);

  }

}.update-types-guide {  color: white;

</style>

  display: grid;  border: 2px solid white;

  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));}

  gap: 1rem;

  margin: 2rem 0;.btn-secondary:hover {

}  background: white;

  color: #667eea;

.type-card {}

  background: #f9f9f9;

  border: 1px solid #ddd;@media (max-width: 768px) {

  border-radius: 8px;  .update-header {

  padding: 1.25rem;    flex-direction: column;

  text-align: center;    align-items: flex-start;

}  }

  

.type-icon {  .subscription-options {

  font-size: 2rem;    flex-direction: column;

  display: block;  }

  margin-bottom: 0.5rem;}

}</style>


.type-card strong {
  display: block;
  margin: 0.5rem 0;
  color: #333;
}

.type-card p {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #666;
}

.stay-updated-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  margin: 2rem 0;
}

.stay-updated-box h3 {
  margin: 0 0 0.5rem;
  color: white;
  font-size: 1.5rem;
}

.stay-updated-box > p {
  margin: 0.5rem 0 1.5rem;
  opacity: 0.95;
}

.subscription-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 1.5rem 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
}

.btn-icon {
  font-size: 1.25rem;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.btn-accent {
  background: #ff6b6b;
  color: white;
  padding: 0.875rem 2rem;
}

.btn-accent:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,107,107,0.3);
}

.follow-social {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  opacity: 0.9;
}

.follow-social a {
  color: white;
  text-decoration: underline;
}

.suggestion-box {
  background: var(--card-bg, #fff8e1);
  border: 2px solid var(--border-color, #ffd54f);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
}

.suggestion-box p:first-child {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
  color: var(--text-color, #333);
}

.suggestion-box p {
  color: var(--text-secondary, #555);
  margin: 0.5rem 0 1.5rem;
}

.archives-dropdown {
  background: var(--card-bg, #f5f5f5);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  padding: 1rem;
  margin: 2rem 0;
}

.archives-dropdown summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--link-color, #007bff);
  padding: 0.5rem;
  list-style: none;
}

.archives-dropdown summary::-webkit-details-marker {
  display: none;
}

.archives-dropdown summary:hover {
  text-decoration: underline;
}

.archives-content {
  padding: 1rem;
  margin-top: 0.5rem;
}

.archives-content p {
  margin: 0.5rem 0;
  color: var(--text-secondary, #555);
}

/* Dark mode specific styles */
body[data-theme="dark"] .update-card {
  background: var(--main-bg, #111a2b);
  border-color: var(--border-color, #355c7d);
}

body[data-theme="dark"] .empty-message {
  background: var(--main-bg, #111a2b);
  border-color: var(--border-color, #355c7d);
}

body[data-theme="dark"] .type-card,
body[data-theme="dark"] .suggestion-box,
body[data-theme="dark"] .archives-dropdown {
  background: var(--main-bg, #111a2b);
  border-color: var(--border-color, #355c7d);
}

body[data-theme="dark"] .stay-updated-box {
  background: linear-gradient(135deg, #4a5fa2 0%, #5a3d7a 100%);
}

/* High contrast mode */
body[data-contrast="high"] .update-card,
body[data-contrast="high"] .type-card,
body[data-contrast="high"] .suggestion-box,
body[data-contrast="high"] .archives-dropdown {
  border: 3px solid #000 !important;
}

body[data-contrast="high"] .stay-updated-box {
  border: 3px solid #000 !important;
}

body[data-contrast="high"] .btn {
  border: 3px solid #000 !important;
}

body[data-contrast="high"] .btn-primary {
  background: #000 !important;
  color: #fff !important;
}

body[data-contrast="high"] .btn-secondary {
  background: #fff !important;
  color: #000 !important;
  border-color: #000 !important;
}

body[data-contrast="high"] .btn-accent {
  background: #000 !important;
  color: #fff !important;
  border: 3px solid #fff !important;
}

@media (max-width: 768px) {
  .update-card {
    flex-direction: column;
    text-align: center;
  }
  
  .update-icon {
    margin-bottom: 0.5rem;
  }
  
  .subscription-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    justify-content: center;
  }
  
  .update-types-guide {
    grid-template-columns: 1fr;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .update-card,
  .btn {
    transition: none;
  }
  
  .btn:hover {
    transform: none;
  }
}
</style>
