---
layout: default
title: Contextual Help System
description: Get help exactly when and where you need it
permalink: /help-system/
---

<style>
.help-guide {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
}

.help-card {
  background: white;
  border-left: 4px solid #4CAF50;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.help-card h3 {
  margin-top: 0;
  color: #4CAF50;
}

.help-card code {
  background: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.help-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.help-example {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.help-example h4 {
  margin-top: 0;
  font-size: 1rem;
}

.help-example pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
}
</style>

<div class="help-guide">
  <h1>Contextual Help System</h1>
  <p style="font-size: 1.1rem; color: #666;">
    Add intelligent, persona-aware help throughout your 3mpwrApp™ website.
  </p>

  <div class="help-card">
    <h3>🎯 How It Works</h3>
    <p>
      The contextual help system uses HTML attributes to show relevant help based on:
    </p>
    <ul>
      <li><strong>User's persona</strong> (injured worker, advocate, legal professional, etc.)</li>
      <li><strong>Progress level</strong> (beginner, intermediate, advanced)</li>
      <li><strong>Page context</strong> (what they're currently trying to do)</li>
    </ul>
  </div>

  <div class="help-card">
    <h3>📝 Implementation Guide</h3>
    
    <h4>Step 1: Add Help Triggers</h4>
    <p>Add <code>data-help</code> attributes to any element:</p>
    <pre>&lt;button data-help="download-app"&gt;
  Download App
&lt;/button&gt;</pre>

    <h4>Step 2: Define Help Content</h4>
    <p>Create help content in a JSON file or directly in HTML:</p>
    <pre>&lt;div 
  data-help-id="download-app" 
  data-help-persona="injured-worker,explorer"
  data-help-progress-min="0"
  class="help-content" 
  style="display: none;"&gt;
  
  &lt;h4&gt;Downloading the App&lt;/h4&gt;
  &lt;p&gt;
    3mpwrApp is available for Android, iOS, and web. 
    Choose the version that works best for you:
  &lt;/p&gt;
  &lt;ul&gt;
    &lt;li&gt;&lt;strong&gt;Android:&lt;/strong&gt; Google Play Store&lt;/li&gt;
    &lt;li&gt;&lt;strong&gt;iOS:&lt;/strong&gt; Apple App Store&lt;/li&gt;
    &lt;li&gt;&lt;strong&gt;Web:&lt;/strong&gt; Works in any browser&lt;/li&gt;
  &lt;/ul&gt;
&lt;/div&gt;</pre>

    <h4>Step 3: Include Help JavaScript</h4>
    <p>Add the contextual help script to your layout footer:</p>
    <pre>&lt;script src="/assets/js/contextual-help.js"&gt;&lt;/script&gt;</pre>
  </div>

  <div class="help-examples">
    <div class="help-example">
      <h4>Example: Injured Worker Help</h4>
      <pre>&lt;div 
  data-help="claim-filing"
  data-persona="injured-worker"
  data-progress-min="0"&gt;
  
  &lt;h4&gt;Filing Your Claim&lt;/h4&gt;
  &lt;p&gt;Here's what you need:&lt;/p&gt;
  &lt;ul&gt;
    &lt;li&gt;Incident details&lt;/li&gt;
    &lt;li&gt;Medical documentation&lt;/li&gt;
    &lt;li&gt;Witness information&lt;/li&gt;
  &lt;/ul&gt;
&lt;/div&gt;</pre>
    </div>

    <div class="help-example">
      <h4>Example: Advocate Help</h4>
      <pre>&lt;div 
  data-help="client-mgmt"
  data-persona="advocate"
  data-progress-min="20"&gt;
  
  &lt;h4&gt;Managing Clients&lt;/h4&gt;
  &lt;p&gt;Best practices:&lt;/p&gt;
  &lt;ul&gt;
    &lt;li&gt;Maintain confidentiality&lt;/li&gt;
    &lt;li&gt;Track deadlines&lt;/li&gt;
    &lt;li&gt;Document all interactions&lt;/li&gt;
  &lt;/ul&gt;
&lt;/div&gt;</pre>
    </div>

    <div class="help-example">
      <h4>Example: Legal Professional Help</h4>
      <pre>&lt;div 
  data-help="tribunal-search"
  data-persona="legal"
  data-progress-min="0"&gt;
  
  &lt;h4&gt;Searching Decisions&lt;/h4&gt;
  &lt;p&gt;Advanced search tips:&lt;/p&gt;
  &lt;ul&gt;
    &lt;li&gt;Use quotes for exact phrases&lt;/li&gt;
    &lt;li&gt;Filter by date range&lt;/li&gt;
    &lt;li&gt;Search by adjudicator&lt;/li&gt;
  &lt;/ul&gt;
&lt;/div&gt;</pre>
    </div>
  </div>

  <div class="help-card">
    <h3>🔥 Pro Tips</h3>
    <ul>
      <li><strong>Keep it short:</strong> 2-3 sentences max for each help item</li>
      <li><strong>Show, don't tell:</strong> Use screenshots or GIFs when possible</li>
      <li><strong>Progressive:</strong> Show basic help first, advanced tips later</li>
      <li><strong>Context-aware:</strong> Different help for different personas</li>
      <li><strong>Dismissible:</strong> Let users hide help they don't need</li>
    </ul>
  </div>

  <div class="help-card">
    <h3>🎨 Customization</h3>
    <p>Customize the appearance by editing <code>/assets/css/contextual-help.css</code>:</p>
    <pre>.help-tooltip {
  background: #4CAF50;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.help-trigger {
  position: relative;
}

.help-trigger::after {
  content: "?";
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}</pre>
  </div>

  <div class="help-card">
    <h3>📊 Analytics Integration</h3>
    <p>Track which help items are most accessed:</p>
    <pre>// In contextual-help.js
window.trackHelpView = function(helpId) {
  if (window.ga) {
    ga('send', 'event', 'Help', 'view', helpId);
  }
  console.log('Help viewed:', helpId);
};</pre>
  </div>

  <div style="text-align: center; margin-top: 3rem;">
    <a href="/" class="btn-continue">Back to Home</a>
  </div>
</div>
