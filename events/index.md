---
layout: default
title: Events Calendar
permalink: /events/
description: "Community events calendar for disability rights, worker justice gatherings, workshops, and meetups. Subscribe via ICS feed for automatic updates. All events fully accessible."
image: /assets/empwrapp-logo.png
image_alt: "3mpwrApp Events - Accessible community gatherings and workshops"
---

<link rel="stylesheet" href="{{ '/assets/css/page-enhancements.css' | relative_url }}">

{%- include status-banner.html -%}

# 📅 Events Calendar

📖 **2 minute read** | 🔋 **Energy: Very Light**

<div class="gradient-banner" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 2rem 0; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
  <h2 style="margin: 0 0 1rem; font-size: 2rem; color: white;">📅 Real-Time Auto-Sync Coming Soon!</h2>
  <p style="font-size: 1.3rem; margin: 0 0 1.5rem; font-weight: 600;">We're setting up seamless calendar integration</p>
  <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 8px; margin: 1rem auto; max-width: 600px; backdrop-filter: blur(10px);">
    <p style="margin: 0 0 1rem; font-size: 1rem;">⚙️ <strong>Coming Soon:</strong></p>
    <p style="font-size: 0.95rem; margin: 0; line-height: 1.6; opacity: 0.95;">
      We're currently working on our real-time calendar synchronization system to provide seamless integration with your calendar app. This will allow automatic updates of all community events directly to your calendar without any manual steps.
    </p>
    <p style="margin: 1rem 0 0; font-size: 0.9rem; opacity: 0.85;">
      📍 Check back soon for the calendar feed link and setup instructions
    </p>
  </div>
  <p style="margin: 1rem 0 0; font-size: 1rem; opacity: 0.95;">
    ✅ Disability awareness days | ✅ Health observances | ✅ Canadian holidays<br>
    ✅ Community events | ✅ Coming: Auto-updates daily | ✅ Works with all calendar apps
  </p>
  <div style="margin-top: 1.5rem;">
    <a href="#subscribe-to-auto-updating-calendar" style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.2s;">
      � Learn More About Events ↓
    </a>
  </div>
</div>

<details class="tldr-box" open>
  <summary>⚡ Quick Summary (30 seconds)</summary>
  <ul>
    <li><strong>Real-Time Sync:</strong> Events calendar is now LIVE with automatic updates!</li>
    <li><strong>Auto-Sync Calendar:</strong> Subscribe to our ICS feed for automatic event updates (131+ events!)</li>
    <li><strong>User Events:</strong> Events created in the 3mpwrApp automatically appear on this site within 5 minutes</li>
    <li><strong>Built-In Events:</strong> Disability awareness days, health observances, Canadian & provincial holidays included</li>
    <li><strong>All Accessible:</strong> Every event includes accessibility details, virtual options, and energy costs</li>
    <li><strong>Fast Updates:</strong> Website refreshes every 5 minutes, calendar feed updates hourly</li>
    <li><strong>Universal Compatibility:</strong> Works with iPhone, Android, Mac, Windows, all calendar apps</li>
  </ul>
</details>

<div class="info-box" style="margin: 1.5rem 0;">
  <p><strong>🔗 Related:</strong> Looking for ongoing campaigns? Visit <a href="/campaigns/">Campaigns</a> to see active advocacy efforts for disability rights and worker justice. Events are one-time or recurring gatherings, while campaigns are sustained organizing efforts.</p>
</div>

---

## 🎯 What's the Difference? Campaigns vs Events

<span class="energy-cost" data-energy="1" aria-label="Energy cost: very light">🔋 Energy: Very Light</span>

<div class="gradient-banner" role="region" aria-label="Understanding campaigns versus events">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1rem 0;">
    <div style="padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;">
      <h3 style="margin-top: 0;">📅 Events (You're Here!)</h3>
      <ul style="text-align: left; margin: 0;">
        <li><strong>What:</strong> Single gatherings or recurring meetups</li>
        <li><strong>Examples:</strong> Workshop, rally, support group, social, training</li>
        <li><strong>Duration:</strong> Specific date/time</li>
        <li><strong>Focus:</strong> Bringing people together</li>
      </ul>
    </div>
    <div style="padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;">
      <h3 style="margin-top: 0;">📣 Campaigns</h3>
      <ul style="text-align: left; margin: 0;">
        <li><strong>What:</strong> Ongoing organizing efforts</li>
        <li><strong>Examples:</strong> Petition drive, advocacy push, awareness initiative</li>
        <li><strong>Duration:</strong> Weeks or months</li>
        <li><strong>Focus:</strong> Sustained change</li>
      </ul>
    </div>
  </div>
  <p style="margin: 1rem 0 0; font-style: italic;">💡 <strong>Pro Tip:</strong> Campaigns often have events! A transit accessibility campaign might include rallies, town halls, and workshops.</p>
</div>

---

## 📆 Upcoming Events (Live from App)

<span class="energy-cost" data-energy="1" aria-label="Energy cost: very light">🔋 Energy: Very Light</span>

<div class="info-box">
  <p><strong>🔄 Auto-Synced:</strong> Events created in the 3mpwrApp automatically appear below. Updates every 5 minutes.</p>
</div>

<section id="events">
  <div id="events-list" style="margin: 2rem 0;">
    <div style="text-align: center; padding: 2rem;">
      <p style="font-size: 1.2rem;">⏳ Loading events...</p>
    </div>
  </div>
</section>

<script>
  // Fetch and display events from app (real-time sync via Cloudflare Worker)
  async function loadEvents() {
    try {
      // Fetch from Cloudflare Worker API endpoint (production environment)
      const response = await fetch('https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=production');
      const data = await response.json();
      const events = data.events || [];
      
      const container = document.getElementById('events-list');
      
      if (events.length === 0) {
        container.innerHTML = `
          <div class="warning-box">
            <h3 style="margin-top: 0;">📅 No Events Yet</h3>
            <p>No upcoming events at this time. Check back soon, or create one in the app!</p>
            <p style="margin-top: 1rem;"><strong>Be the first to organize an event!</strong></p>
          </div>
        `;
        return;
      }
      
      // Sort events by date (soonest first)
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Display events
      container.innerHTML = events.map(event => `
        <article class="event-card" style="border: 2px solid #e0f2fe; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; color: #0066cc; font-size: 1.5rem;">${event.title}</h3>
          
          <p class="event-date" style="color: #333; font-weight: bold; font-size: 1.1rem; margin: 0.5rem 0;">
            📅 ${formatDate(event.date)}
          </p>
          
          <p class="event-description" style="color: #555; margin: 1rem 0;">
            ${event.description}
          </p>
          
          ${event.location ? `<p class="event-location" style="color: #555; margin: 0.5rem 0;">� <strong>Location:</strong> ${event.location}</p>` : ''}
          
          <div class="event-badges" style="margin: 1rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${event.isVirtual ? `<span class="badge" style="display: inline-block; padding: 6px 12px; background: #dbeafe; border-radius: 6px; font-size: 0.9em; font-weight: 600;">🌐 Virtual</span>` : ''}
            ${event.asl ? `<span class="badge" style="display: inline-block; padding: 6px 12px; background: #fef3c7; border-radius: 6px; font-size: 0.9em; font-weight: 600;">🤟 ASL</span>` : ''}
            ${event.captions ? `<span class="badge" style="display: inline-block; padding: 6px 12px; background: #e0e7ff; border-radius: 6px; font-size: 0.9em; font-weight: 600;">📝 Captions</span>` : ''}
            ${event.stepFree ? `<span class="badge" style="display: inline-block; padding: 6px 12px; background: #d1fae5; border-radius: 6px; font-size: 0.9em; font-weight: 600;">♿ Accessible</span>` : ''}
            ${event.sensorySpace ? `<span class="badge" style="display: inline-block; padding: 6px 12px; background: #fce7f3; border-radius: 6px; font-size: 0.9em; font-weight: 600;">🎧 Sensory-Friendly</span>` : ''}
            ${event.energyCost ? `<span class="badge" style="display: inline-block; padding: 6px 12px; background: #fff7ed; border-radius: 6px; font-size: 0.9em; font-weight: 600;">🔋 Energy: ${event.energyCost}</span>` : ''}
          </div>
          
          ${event.rsvpLink ? `<a href="${event.rsvpLink}" class="btn btn-primary" style="display: inline-block; margin-top: 1rem; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">📝 RSVP Now</a>` : ''}
        </article>
      `).join('');
      
    } catch (error) {
      console.error('Failed to load events:', error);
      document.getElementById('events-list').innerHTML = `
        <div class="warning-box">
          <h3 style="margin-top: 0;">⚠️ Connection Issue</h3>
          <p>Unable to load events from the app right now. This could mean:</p>
          <ul style="text-align: left; max-width: 600px; margin: 1rem auto;">
            <li>No events have been created yet</li>
            <li>Temporary network issue</li>
            <li>Please refresh the page</li>
          </ul>
          <p style="margin-top: 1rem;">Please check back later or <a href="/contact/">contact us</a> if the problem persists.</p>
        </div>
      `;
    }
  }
  
  // Format date nicely
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }
  
  // Load events when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEvents);
  } else {
    loadEvents();
  }
  
  // Auto-refresh every 5 minutes
  setInterval(loadEvents, 5 * 60 * 1000);
</script>

---

## 📲 Subscribe to Auto-Updating Calendar {#subscribe-to-auto-updating-calendar}

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

<div class="success-box" style="margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; border: 2px solid #10b981;">
  <h3 style="margin-top: 0;">✅ Real-Time Calendar Sync is Live!</h3>
  <p style="font-size: 1.1rem; margin: 1rem 0;"><strong>Subscribe now to get automatic event updates!</strong></p>
  <p>Our real-time calendar synchronization system is now active and includes:</p>
  <ul style="text-align: left; margin: 1rem auto; max-width: 600px;">
    <li>✅ User-created events from the 3mpwrApp (synced within 5 minutes)</li>
    <li>✅ Disability awareness days (International Day of Persons with Disabilities, etc.)</li>
    <li>✅ Health observances (Mental Health Week, Chronic Pain Awareness Month, etc.)</li>
    <li>✅ Canadian holidays</li>
    <li>✅ Provincial holidays (based on your settings)</li>
  </ul>
  <div style="margin-top: 1.5rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.9); border-radius: 8px; border: 2px solid #10b981;">
    <p style="margin: 0 0 0.5rem; font-weight: bold; color: #065f46;">📅 Calendar Feed URL (ICS Format):</p>
    <div style="background: #f0fdf4; padding: 1rem; border-radius: 6px; border: 1px solid #86efac; margin: 0.5rem 0; font-family: monospace; word-break: break-all; font-size: 0.9rem; color: #065f46;">
      https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production
    </div>
    <p style="margin: 1rem 0 0; font-size: 0.9rem; color: #065f46;">
      <strong>💡 Tip:</strong> Copy this URL and paste it into your calendar app (instructions below)
    </p>
  </div>
  <p style="margin-top: 1rem; font-style: italic;">📅 <strong>Updates automatically every 5 minutes</strong> to include new events from the community!</p>
</div>

### 📱 How to Subscribe

<div style="margin: 1rem 0; padding: 1.5rem; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; border: 2px solid #3b82f6;">
  <h4 style="margin-top: 0; color: #1e40af;">✅ Subscribe in 3 Easy Steps!</h4>
  <p>Choose your platform below and follow the step-by-step instructions:</p>
</div>

#### 📱 iPhone / iPad (iOS)

<details style="margin: 1rem 0; padding: 1rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #3b82f6;">
  <summary style="cursor: pointer; font-weight: bold; color: #1e40af; font-size: 1.05rem;">Tap to see iOS Calendar instructions</summary>
  <ol style="text-align: left; margin: 1rem 0; line-height: 1.8;">
    <li>Open the <strong>Settings</strong> app on your iPhone or iPad</li>
    <li>Scroll down and tap <strong>Calendar</strong></li>
    <li>Tap <strong>Accounts</strong></li>
    <li>Tap <strong>Add Account</strong></li>
    <li>Tap <strong>Other</strong> at the bottom</li>
    <li>Tap <strong>Add Subscribed Calendar</strong></li>
    <li>Paste this URL: <code style="background: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem;">https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production</code></li>
    <li>Tap <strong>Next</strong></li>
    <li>Tap <strong>Save</strong></li>
  </ol>
  <p style="margin-top: 1rem; padding: 0.75rem; background: #dbeafe; border-radius: 6px; border-left: 4px solid #3b82f6;">
    ✅ <strong>Done!</strong> Events will now appear in your Calendar app and update automatically.
  </p>
</details>

#### 🤖 Android (Google Calendar)

<details style="margin: 1rem 0; padding: 1rem; background: #f0fdf4; border-radius: 8px; border: 1px solid #10b981;">
  <summary style="cursor: pointer; font-weight: bold; color: #065f46; font-size: 1.05rem;">Tap to see Android/Google Calendar instructions</summary>
  <ol style="text-align: left; margin: 1rem 0; line-height: 1.8;">
    <li>Open <strong>Google Calendar</strong> on your computer (calendar.google.com) - <em>Note: Must use desktop, not mobile app</em></li>
    <li>On the left side, look for <strong>"Other calendars"</strong></li>
    <li>Click the <strong>+ (plus sign)</strong> next to "Other calendars"</li>
    <li>Click <strong>"From URL"</strong></li>
    <li>Paste this URL: <code style="background: #d1fae5; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem;">https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production</code></li>
    <li>Click <strong>"Add calendar"</strong></li>
  </ol>
  <p style="margin-top: 1rem; padding: 0.75rem; background: #d1fae5; border-radius: 6px; border-left: 4px solid #10b981;">
    ✅ <strong>Done!</strong> Events will sync to your Android phone automatically within a few hours.
  </p>
</details>

#### 🍎 macOS (Mac Calendar)

<details style="margin: 1rem 0; padding: 1rem; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b;">
  <summary style="cursor: pointer; font-weight: bold; color: #92400e; font-size: 1.05rem;">Click to see macOS Calendar instructions</summary>
  <ol style="text-align: left; margin: 1rem 0; line-height: 1.8;">
    <li>Open the <strong>Calendar</strong> app on your Mac</li>
    <li>Click <strong>File</strong> in the menu bar</li>
    <li>Click <strong>New Calendar Subscription...</strong></li>
    <li>Paste this URL: <code style="background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem;">https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production</code></li>
    <li>Click <strong>Subscribe</strong></li>
    <li>Choose a name: <strong>3mpwrApp Events</strong></li>
    <li>Set auto-refresh to: <strong>Every hour</strong> (or your preference)</li>
    <li>Click <strong>OK</strong></li>
  </ol>
  <p style="margin-top: 1rem; padding: 0.75rem; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
    ✅ <strong>Done!</strong> Events will now appear in Calendar and update automatically.
  </p>
</details>

#### 💻 Windows (Outlook)

<details style="margin: 1rem 0; padding: 1rem; background: #e0e7ff; border-radius: 8px; border: 1px solid #6366f1;">
  <summary style="cursor: pointer; font-weight: bold; color: #3730a3; font-size: 1.05rem;">Click to see Outlook instructions</summary>
  <ol style="text-align: left; margin: 1rem 0; line-height: 1.8;">
    <li>Open <strong>Outlook</strong> on your computer</li>
    <li>Click the <strong>Calendar</strong> icon at the bottom left</li>
    <li>Right-click <strong>"My Calendars"</strong></li>
    <li>Click <strong>"Add Calendar"</strong></li>
    <li>Click <strong>"Subscribe from web"</strong></li>
    <li>Paste this URL: <code style="background: #e0e7ff; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem;">https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production</code></li>
    <li>Enter a name: <strong>3mpwrApp Events</strong></li>
    <li>Click <strong>Import</strong></li>
  </ol>
  <p style="margin-top: 1rem; padding: 0.75rem; background: #e0e7ff; border-radius: 6px; border-left: 4px solid #6366f1;">
    ✅ <strong>Done!</strong> Events will sync to your Outlook calendar automatically.
  </p>
</details>

#### 🌐 Web (Google Calendar / Outlook Web)

<details style="margin: 1rem 0; padding: 1rem; background: #fce7f3; border-radius: 8px; border: 1px solid #ec4899;">
  <summary style="cursor: pointer; font-weight: bold; color: #9f1239; font-size: 1.05rem;">Click to see web calendar instructions</summary>
  <p><strong>For Google Calendar Web:</strong></p>
  <ol style="text-align: left; margin: 1rem 0; line-height: 1.8;">
    <li>Go to <a href="https://calendar.google.com" target="_blank">calendar.google.com</a></li>
    <li>Look for <strong>"Other calendars"</strong> on the left</li>
    <li>Click the <strong>+ (plus sign)</strong></li>
    <li>Click <strong>"From URL"</strong></li>
    <li>Paste: <code style="background: #fce7f3; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem;">https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production</code></li>
    <li>Click <strong>"Add calendar"</strong></li>
  </ol>
  <p><strong>For Outlook Web:</strong></p>
  <ol style="text-align: left; margin: 1rem 0; line-height: 1.8;">
    <li>Go to <a href="https://outlook.live.com/calendar" target="_blank">outlook.live.com/calendar</a></li>
    <li>Click <strong>"Add calendar"</strong></li>
    <li>Click <strong>"Subscribe from web"</strong></li>
    <li>Paste the URL above</li>
    <li>Name it <strong>3mpwrApp Events</strong></li>
    <li>Click <strong>"Import"</strong></li>
  </ol>
</details>

### ✅ How to Verify It's Working

<div style="margin: 1rem 0; padding: 1.5rem; background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; border-radius: 8px;">
  <p><strong>Once subscribed, look for these indicators:</strong></p>
  <ul style="text-align: left;">
    <li>✅ Calendar shows "3mpwrApp Events" or similar name in your calendar list</li>
    <li>✅ Events appear in your calendar app with full details (dates, locations, accessibility info)</li>
    <li>✅ Your calendar auto-updates every few hours with new events</li>
    <li>✅ You receive notifications based on your calendar app's notification settings</li>
    <li>✅ Events display with accessibility badges (ASL, captions, wheelchair access, etc.)</li>
  </ul>
  <p style="margin-top: 1rem; padding: 0.75rem; background: #d1fae5; border-radius: 6px;">
    <strong>💡 Quick Test:</strong> Open your calendar app and look for upcoming events. You should see disability awareness days, holidays, and any community events that have been created in the app.
  </p>
</div>

### 🔧 Troubleshooting

<details class="accordion-item" style="margin: 1rem 0; padding: 1rem; border: 2px solid #fee2e2; border-radius: 8px; background: #fef2f2;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1.1rem; list-style: none;">
    <span style="display: inline-block; margin-right: 0.5rem;">❌</span> Events not showing up in my calendar
  </summary>
  <div style="margin-top: 1rem; padding-left: 1.5rem;">
    <p><strong>This is usually due to calendar app refresh delays. Here's what to check:</strong></p>
    <ol style="text-align: left;">
      <li><strong>Check if subscription was added correctly:</strong>
        <ul>
          <li>Look for "3mpwrApp Events" in your calendar list</li>
          <li>Make sure it's enabled/visible (check the checkbox next to it)</li>
        </ul>
      </li>
      <li><strong>Verify the URL was pasted correctly:</strong>
        <ul>
          <li>URL should be: <code>https://your-worker.workers.dev/events.ics?env=production</code></li>
          <li>No extra spaces or characters</li>
        </ul>
      </li>
      <li><strong>Force a manual refresh:</strong>
        <ul>
          <li><strong>iOS:</strong> Settings → Calendar → Accounts → Subscribed Calendars → 3mpwrApp Events → Refresh</li>
          <li><strong>macOS:</strong> Calendar → View → Refresh All</li>
          <li><strong>Google Calendar:</strong> Wait up to 24 hours, then check again</li>
          <li><strong>Outlook:</strong> Right-click calendar → Update</li>
        </ul>
      </li>
      <li><strong>Check device settings:</strong>
        <ul>
          <li>Ensure internet connection is active</li>
          <li>Check that calendar sync is enabled</li>
          <li>Make sure device date/time is correct</li>
        </ul>
      </li>
      <li><strong>Wait for sync cycle:</strong>
        <ul>
          <li>New events appear on website within 5 minutes</li>
          <li>Calendar apps may take 1-24 hours to sync</li>
        </ul>
      </li>
    </ol>
    <p style="margin-top: 1rem; padding: 0.75rem; background: #dbeafe; border-radius: 6px; border-left: 4px solid #3b82f6;">
      <strong>💡 Quick test:</strong> Visit <a href="https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production" target="_blank">the ICS feed URL</a> in your browser. If you see calendar data, the feed is working. The issue is with your calendar app's sync.
    </p>
  </div>
</details>

<details class="accordion-item" style="margin: 1rem 0; padding: 1rem; border: 2px solid #fee2e2; border-radius: 8px; background: #fef2f2;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1.1rem; list-style: none;">
    <span style="display: inline-block; margin-right: 0.5rem;">⏰</span> Events not updating / New events don't appear
  </summary>
  <div style="margin-top: 1rem; padding-left: 1.5rem;">
    <p><strong>Understanding update delays:</strong></p>
    <ol style="text-align: left;">
      <li><strong>When an event is created in the app:</strong>
        <ul>
          <li>Saved to Firestore instantly</li>
          <li>Appears on website within 5 minutes</li>
          <li>Calendar feed updates within 1 hour (cached for performance)</li>
        </ul>
      </li>
      <li><strong>Your calendar app's refresh rate:</strong>
        <ul>
          <li>iOS/macOS: Usually within a few hours</li>
          <li>Google Calendar: Up to 24 hours after feed updates</li>
          <li>Outlook: Hourly to daily depending on settings</li>
          <li>Total delay: Up to 24-48 hours from event creation to calendar app display</li>
        </ul>
      </li>
    </ol>
    <p style="margin-top: 1rem; padding: 0.75rem; background: #d1fae5; border-radius: 6px; border-left: 4px solid #10b981;">
      <strong>💡 For immediate updates:</strong> Check the website at <a href="/events/">3mpwrapp.pages.dev/events</a> which updates every 5 minutes!
    </p>
  </div>
</details>

<details class="accordion-item" style="margin: 1rem 0; padding: 1rem; border: 2px solid #fee2e2; border-radius: 8px; background: #fef2f2;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1.1rem; list-style: none;">
    <span style="display: inline-block; margin-right: 0.5rem;">🕐</span> Events showing wrong time or timezone
  </summary>
  <div style="margin-top: 1rem; padding-left: 1.5rem;">
    <p><strong>Timezone handling:</strong></p>
    <ul style="text-align: left;">
      <li>All events in the ICS feed are stored in UTC (Coordinated Universal Time)</li>
      <li>Your calendar app should automatically convert them to your local timezone</li>
      <li>If times look wrong:
        <ul>
          <li>Check your device's timezone settings</li>
          <li>Make sure "Set time automatically" is enabled</li>
          <li>Verify your location settings are correct</li>
        </ul>
      </li>
      <li>If you travel to a different timezone:
        <ul>
          <li>Events should automatically adjust to the new timezone</li>
          <li>Force a calendar refresh if they don't</li>
        </ul>
      </li>
    </ul>
  </div>
</details>

<details class="accordion-item" style="margin: 1rem 0; padding: 1rem; border: 2px solid #fee2e2; border-radius: 8px; background: #fef2f2;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1.1rem; list-style: none;">
    <span style="display: inline-block; margin-right: 0.5rem;">🗑️</span> How to unsubscribe from the calendar
  </summary>
  <div style="margin-top: 1rem; padding-left: 1.5rem;">
    <p><strong>To remove the calendar subscription:</strong></p>
    <p><strong>iOS/macOS:</strong></p>
    <ol style="text-align: left;">
      <li>Open Calendar app</li>
      <li>Tap/click "Calendars"</li>
      <li>Find "3mpwrApp Events"</li>
      <li>Tap/click the info (ℹ️) button</li>
      <li>Tap/click "Delete Calendar" or "Unsubscribe"</li>
      <li>Confirm</li>
    </ol>
    <p style="margin-top: 1rem;"><strong>Google Calendar:</strong></p>
    <ol style="text-align: left;">
      <li>Go to Settings</li>
      <li>Find "3mpwrApp Events" in the calendar list</li>
      <li>Click the three dots (⋮)</li>
      <li>Select "Remove calendar"</li>
      <li>Confirm</li>
    </ol>
    <p style="margin-top: 1rem;"><strong>Outlook:</strong></p>
    <ol style="text-align: left;">
      <li>Right-click on "3mpwrApp Events" in the calendar list</li>
      <li>Select "Delete Calendar"</li>
      <li>Confirm</li>
    </ol>
  </div>
</details>

<div class="info-box" style="margin: 2rem 0;">
  <p><strong>🆘 Still having issues?</strong></p>
  <p>Contact us at <a href="mailto:empowrapp08162025@gmail.com?subject=Calendar%20Subscription%20Help">empowrapp08162025@gmail.com</a> with:</p>
  <ul style="text-align: left; max-width: 600px; margin: 1rem auto;">
    <li>Your device/platform (iPhone, Android, Mac, Windows, etc.)</li>
    <li>Calendar app you're using (Apple Calendar, Google Calendar, Outlook, etc.)</li>
    <li>Screenshot of any error messages</li>
    <li>What you've already tried</li>
  </ul>
  <p style="margin-top: 1rem;">We'll help you get it working!</p>
</div>

---

## 🔄 How Event Auto-Sync Works

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**Real-time calendar synchronization is now live! Here's how it works:**

**For Event Organizers:**
1. 📱 Create event in the 3mpwrApp
2. ✅ Add all accessibility details (wheelchair access, ASL, quiet room, etc.)
3. 🌐 Toggle "Make Public" to list it publicly
4. 💾 Event is saved to Firestore database (`events_production` collection)
5. 📅 Your event appears on this website within **5 minutes**
6. 📲 Subscribed calendars update within a few hours (up to 24 hours for Google Calendar)

**For Event Attendees:**
- 👀 Browse all public events on this website (updates every 5 minutes)
- 📅 Subscribe to ICS feed for automatic calendar sync
- 📲 Get automatic updates when new events are added
- ♿ See all accessibility info before attending
- 🎟️ RSVP directly from calendar or website
- 🌍 Events automatically convert to your local timezone

**Technical Details (For Calendar Nerds):**
- 📡 **Format:** Standard iCalendar (.ics) format
- 📦 **Data Source:** Firestore collections (`events_production` for live, `events_preview` for testing)
- ⏱️ **Website Updates:** Every 5 minutes from Firestore via Cloudflare Worker API
- ⏱️ **Calendar Feed:** Updates hourly (cached via Cloudflare KV for performance)
- 🔗 **Compatible with:** Google Calendar, Apple Calendar, Outlook, Thunderbird, and all standard calendar apps
- 🔒 **Privacy:** Only events marked "public" appear in feed
- 🌍 **Timezones:** All events stored in UTC, automatically converted by your calendar app
- 🔄 **Automation:** Real-time sync: App → Firestore → Cloudflare Worker → Your Calendar
- 🎯 **Reliability:** Hosted on Cloudflare Workers with global CDN for fast, reliable access worldwide
- 📊 **Content:** User-created events + disability awareness days + health observances + Canadian holidays + provincial holidays
- 🚀 **Performance:** Cloudflare KV cache ensures sub-100ms response times globally
- 🔐 **Security:** CORS enabled for website access, service account authentication for Firestore

---

## 📋 Event Types You Can Expect

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**Community members will be able to create diverse events:**

**🎓 Educational:**
- Disability rights workshops
- Know-your-rights sessions
- WSIB/WCB navigation clinics
- Accessibility training
- Self-advocacy skills
- Technology tutorials

**🤝 Support & Community:**
- Peer support groups (chronic pain, mental health, specific conditions)
- Caregiver meetups
- Social gatherings
- Online hangouts
- Hobby groups
- Mentorship circles

**📣 Advocacy & Organizing:**
- Rallies and protests
- Town halls with politicians
- Community organizing meetings
- Coalition building sessions
- Strategy planning meetings
- Direct actions

**💪 Wellness & Recreation:**
- Adaptive yoga or fitness classes
- Art therapy sessions
- Accessible outdoor activities
- Gaming nights
- Virtual movie screenings
- Meditation and mindfulness

**💼 Professional Development:**
- Job search support groups
- Resume workshops
- Interview prep sessions
- Entrepreneurship meetups
- Skill-sharing exchanges
- Networking events

**🎉 Celebrations:**
- Disability Pride events
- Community achievements
- Fundraisers
- Awareness days
- Cultural celebrations
- Milestone parties

*All event types include full accessibility information and virtual attendance options!*

---

## ♿ Accessibility Information

<span class="energy-cost" data-energy="1" aria-label="Energy cost: very light">🔋 Energy: Very Light</span>

**Every event listing will include:**

**Physical Accessibility:**
- ♿ Wheelchair accessibility (entrance, bathrooms, seating)
- 🚗 Accessible parking details
- 🚇 Public transit accessibility
- 🚪 Automatic doors
- 🛗 Elevator availability
- 📍 Exact entrance location with photos

**Sensory Accommodations:**
- 🎧 Quiet rooms or break spaces
- 🔇 Noise level expectations
- 💡 Lighting details (bright, dim, flashing lights warning)
- 🎨 Sensory-friendly options
- 🧩 Stimming-friendly spaces

**Communication Access:**
- 🤟 ASL interpretation availability
- 📝 CART (live captioning)
- 📄 Materials in large print or braille
- 📖 Plain language summaries
- 🌐 Interpretation in other languages

**Participation Options:**
- 💻 Virtual attendance link
- 📹 Recording available after event
- 🎤 Multiple ways to participate (speak, chat, raise hand)
- 🔋 Energy level required
- ⏱️ Duration and break schedule

**Health & Safety:**
- 😷 Mask requirements or recommendations
- 🦠 Ventilation information
- 🧼 Hand sanitizer availability
- 🐕 Service animal policy
- 💊 Medication storage if needed
- 🍽️ Food allergy considerations

**Support Services:**
- 🧑‍🤝‍🧑 Personal support worker welcome
- 👨‍👩‍👧 Companion or caregiver invited
- 👶 Childcare available
- 🚽 Gender-neutral and accessible bathrooms
- 🩹 First aid available
- 📞 Emergency contact

---

## 🔋 Energy Cost System

<span class="energy-cost" data-energy="1" aria-label="Energy cost: very light">🔋 Energy: Very Light</span>

**Every event will be tagged with energy cost:**

- 🔋 **Very Light:** Online, short (under 30 min), low stimulation
- 🔋🔋 **Light:** Online or quiet in-person, 30-60 min, minimal interaction required
- 🔋🔋🔋 **Medium:** 1-2 hours, moderate social interaction, some stimulation
- 🔋🔋🔋🔋 **High:** 2-4 hours, active participation, crowded or stimulating
- 🔋🔋🔋🔋🔋 **Very High:** Full day, high energy required, intense stimulation

**You can filter events by energy level** so you only see what you can manage on any given day!

---

## 🎯 How to Create an Event

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**Once the app launches, creating events is simple:**

1. 📱 Open 3mpwrApp
2. ➕ Tap "Create Event"
3. 📝 Fill in details:
   - Event name and description
   - Date, time, duration
   - Location (physical address and/or virtual link)
   - All accessibility features
   - Energy cost level
   - Registration/RSVP requirements
4. 🌐 Choose visibility:
   - **Public:** Appears on website calendar and ICS feed
   - **Group-only:** Only visible to specific groups you manage
   - **Private:** Invite-only, not listed publicly
5. ✅ Publish!

**Your event automatically:**
- Appears on this website (if public)
- Shows in ICS feed subscribers' calendars
- Sends notifications to interested community members
- Includes all accessibility details
- Allows easy RSVP tracking

---

## 💡 Event Ideas You Can Organize

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**Need inspiration? Here are events our community might create:**

**Weekly/Monthly Recurring:**
- 🗣️ Chronic pain support group (every Tuesday, 7pm, virtual)
- 🎮 Gaming night for disabled gamers (every Friday, 8pm, Discord)
- 🧘 Gentle adaptive yoga (every Monday/Wednesday, 10am, hybrid)
- 📚 Disability book club (monthly, virtual)
- ☕ Coffee meetup for local members (monthly, rotating accessible cafes)

**One-Time Events:**
- 📣 Rally for accessible transit (date TBD, city hall)
- 🎓 WSIB appeals workshop (Saturday, 2pm, community center)
- 🎉 Disability Pride celebration (June, park with accessible facilities)
- 🏛️ Town hall with MPP about healthcare access (date TBD, virtual + in-person)
- 🎨 Accessible art showcase (one evening, gallery)

**Awareness & Education:**
- 🧠 Invisible disability awareness panel
- 💪 Self-advocacy skills training
- ⚖️ Know your workplace rights session
- 🤝 Allyship 101 for non-disabled supporters
- 🏥 Navigating healthcare as a disabled person

**Social & Community:**
- 🎬 Accessible movie screening
- 🍽️ Potluck at accessible venue
- 🚶 Slow-paced accessible nature walk
- 🎭 Theater outing with ASL interpretation
- 🎨 Craft circle (sensory-friendly)

*The possibilities are endless - organize what your community needs!*

---

## 📅 What's Included in the Calendar Feed?

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**When you subscribe, you get 131+ events automatically, including:**

### 🎗️ Disability Awareness Days

<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 1.5rem; border-radius: 12px; margin: 1rem 0;">
  <ul style="text-align: left; margin: 0;">
    <li><strong>International Day of Persons with Disabilities</strong> (December 3)</li>
    <li><strong>World Autism Awareness Day</strong> (April 2)</li>
    <li><strong>Global Accessibility Awareness Day</strong> (3rd Thursday of May)</li>
    <li><strong>National AccessAbility Week</strong> (Canada, last full week of May)</li>
    <li><strong>International Day of Sign Languages</strong> (September 23)</li>
    <li><strong>White Cane Safety Day</strong> (October 15)</li>
    <li><strong>World Mental Health Day</strong> (October 10)</li>
    <li><strong>And many more!</strong></li>
  </ul>
</div>

### 🏥 Health Observances

<div style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); padding: 1.5rem; border-radius: 12px; margin: 1rem 0;">
  <ul style="text-align: left; margin: 0;">
    <li><strong>Mental Health Week</strong> (Canada, May)</li>
    <li><strong>Chronic Pain Awareness Month</strong> (September)</li>
    <li><strong>Disability Employment Awareness Month</strong> (October)</li>
    <li><strong>National Epilepsy Awareness Month</strong> (November)</li>
    <li><strong>Rare Disease Day</strong> (Last day of February)</li>
    <li><strong>World MS Day</strong> (May 30)</li>
    <li><strong>Fibromyalgia Awareness Day</strong> (May 12)</li>
    <li><strong>Plus health observances for dozens of conditions!</strong></li>
  </ul>
</div>

### 🇨🇦 Canadian Holidays

<div style="background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%); padding: 1.5rem; border-radius: 12px; margin: 1rem 0;">
  <ul style="text-align: left; margin: 0;">
    <li><strong>New Year's Day</strong></li>
    <li><strong>Canada Day</strong> (July 1)</li>
    <li><strong>Labour Day</strong> (First Monday in September)</li>
    <li><strong>Thanksgiving</strong> (Second Monday in October)</li>
    <li><strong>Remembrance Day</strong> (November 11)</li>
    <li><strong>Christmas Day</strong></li>
    <li><strong>Boxing Day</strong></li>
    <li><strong>And more!</strong></li>
  </ul>
</div>

### 🏛️ Provincial Holidays

<div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 1.5rem; border-radius: 12px; margin: 1rem 0;">
  <p style="margin: 0 0 0.5rem;"><strong>The calendar includes provincial holidays for:</strong></p>
  <ul style="text-align: left; margin: 0; columns: 2; -webkit-columns: 2; -moz-columns: 2;">
    <li>Alberta (Family Day, Heritage Day)</li>
    <li>British Columbia (BC Day, Family Day)</li>
    <li>Manitoba (Louis Riel Day)</li>
    <li>New Brunswick (New Brunswick Day)</li>
    <li>Newfoundland & Labrador (St. Patrick's Day, St. George's Day, Discovery Day, etc.)</li>
    <li>Northwest Territories (National Indigenous Peoples Day)</li>
    <li>Nova Scotia (Heritage Day)</li>
    <li>Nunavut (Nunavut Day)</li>
    <li>Ontario (Family Day, Civic Holiday)</li>
    <li>Prince Edward Island (Islander Day)</li>
    <li>Quebec (National Patriots' Day, Saint-Jean-Baptiste Day)</li>
    <li>Saskatchewan (Family Day, Saskatchewan Day)</li>
    <li>Yukon (Discovery Day, National Indigenous Peoples Day)</li>
  </ul>
</div>

### 👥 Community Events

<div style="background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); padding: 1.5rem; border-radius: 12px; margin: 1rem 0;">
  <p style="margin: 0;"><strong>User-created events from the 3mpwrApp community:</strong></p>
  <ul style="text-align: left; margin: 0.5rem 0 0;">
    <li>Rallies and protests</li>
    <li>Support groups and meetups</li>
    <li>Workshops and training sessions</li>
    <li>Social gatherings</li>
    <li>Virtual events and webinars</li>
    <li>Advocacy campaigns</li>
    <li>And whatever else the community creates!</li>
  </ul>
</div>

<div class="info-box" style="margin: 2rem 0;">
  <p><strong>💡 Pro Tip:</strong> Even if you don't attend every event, having awareness days in your calendar helps you:</p>
  <ul style="text-align: left; max-width: 600px; margin: 1rem auto;">
    <li>Stay informed about important dates in the disability community</li>
    <li>Plan advocacy actions around awareness days</li>
    <li>Share information on social media during observances</li>
    <li>Never miss a holiday or provincial observance</li>
    <li>Connect with others around shared experiences and conditions</li>
  </ul>
</div>

---

## ❓ Need Help with Calendar Subscription?

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

<div style="margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; border: 2px solid #10b981;">
  <h4 style="margin-top: 0; color: #065f46;">📖 Comprehensive Support Available</h4>
  <p>We've provided detailed troubleshooting above. If you're still having issues:</p>
  <ul style="text-align: left; margin: 1.5rem auto; max-width: 600px;">
    <li>✅ Check the troubleshooting section above for common issues</li>
    <li>✅ Verify your calendar feed URL is correct</li>
    <li>✅ Force a manual refresh in your calendar app</li>
    <li>✅ Check that the calendar is enabled/visible</li>
    <li>✅ Visit the website directly for instant updates (refreshes every 5 minutes)</li>
  </ul>
  <p style="margin-top: 1rem;"><strong>� Still stuck?</strong> <a href="mailto:empowrapp08162025@gmail.com?subject=Calendar%20Subscription%20Help">Contact us</a> and we'll help you troubleshoot!</p>
</div>

---

## 📊 Calendar Feed Stats

<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
    <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 2rem; font-weight: bold; color: #0369a1;">5min</p>
      <p style="margin: 0.25rem 0 0; color: #075985; font-weight: 600;">Website Update Time</p>
    </div>
    <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 2rem; font-weight: bold; color: #0369a1;">1hr</p>
      <p style="margin: 0.25rem 0 0; color: #075985; font-weight: 600;">Calendar Feed Refresh</p>
    </div>
    <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 2rem; font-weight: bold; color: #0369a1;">131+</p>
      <p style="margin: 0.25rem 0 0; color: #075985; font-weight: 600;">Built-In Events</p>
    </div>
    <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 2rem; font-weight: bold; color: #0369a1;">∞</p>
      <p style="margin: 0.25rem 0 0; color: #075985; font-weight: 600;">Community Events</p>
    </div>
  </div>
</div>
      </li>
      <li><strong>Your calendar app's refresh rate:</strong>
        <ul>
          <li>Even after the ICS updates, your calendar app needs to sync</li>
          <li>iOS/macOS: Usually within a few hours</li>
          <li>Google Calendar: Up to 24 hours after ICS updates</li>
          <li>Total delay: 1-2 days from event creation to calendar app display</li>
        </ul>
      </li>
    </ol>
    <p style="margin-top: 1rem;"><strong>💡 For immediate updates:</strong> Check the website at <a href="/events/">3mpwrapp.pages.dev/events</a> which updates every 5 minutes!</p>
  </div>
</details>

<details class="accordion-item" style="margin: 1rem 0; padding: 1rem; border: 2px solid #fee2e2; border-radius: 8px; background: #fef2f2;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1.1rem; list-style: none;">
    <span style="display: inline-block; margin-right: 0.5rem;">🕐</span> Events showing wrong time or timezone
  </summary>
  <div style="margin-top: 1rem; padding-left: 1.5rem;">
    <p><strong>Timezone handling:</strong></p>
    <ul style="text-align: left;">
      <li>All events in the ICS feed are stored in UTC (Coordinated Universal Time)</li>
      <li>Your calendar app should automatically convert them to your local timezone</li>
      <li>If times look wrong:
        <ul>
          <li>Check your device's timezone settings</li>
          <li>Make sure "Set time automatically" is enabled</li>
          <li>Verify your location settings are correct</li>
        </ul>
      </li>
      <li>If you travel to a different timezone:
        <ul>
          <li>Events should automatically adjust to the new timezone</li>
          <li>Force a calendar refresh if they don't</li>
        </ul>
      </li>
    </ul>
  </div>
</details>

<details class="accordion-item" style="margin: 1rem 0; padding: 1rem; border: 2px solid #fee2e2; border-radius: 8px; background: #fef2f2;">
  <summary style="cursor: pointer; font-weight: bold; font-size: 1.1rem; list-style: none;">
    <span style="display: inline-block; margin-right: 0.5rem;">🗑️</span> How to unsubscribe from the calendar
  </summary>
  <div style="margin-top: 1rem; padding-left: 1.5rem;">
    <p><strong>To remove the calendar subscription:</strong></p>
    <p><strong>iOS/macOS:</strong></p>
    <ol style="text-align: left;">
      <li>Open Calendar app</li>
      <li>Tap/click "Calendars"</li>
      <li>Find "3mpwrApp Events"</li>
      <li>Tap/click the info (ℹ️) button</li>
      <li>Tap/click "Delete Calendar" or "Unsubscribe"</li>
      <li>Confirm</li>
    </ol>
    <p style="margin-top: 1rem;"><strong>Google Calendar:</strong></p>
    <ol style="text-align: left;">
      <li>Go to Settings</li>
      <li>Find "3mpwrApp Events" in the calendar list</li>
      <li>Click the three dots (⋮)</li>
      <li>Select "Remove calendar"</li>
      <li>Confirm</li>
    </ol>
    <p style="margin-top: 1rem;"><strong>Outlook:</strong></p>
    <ol style="text-align: left;">
      <li>Right-click on "3mpwrApp Events" in the calendar list</li>
      <li>Select "Delete Calendar"</li>
      <li>Confirm</li>
    </ol>
  </div>
</details>

<div class="info-box" style="margin: 2rem 0;">
  <p><strong>🆘 Still having issues?</strong></p>
  <p>Contact us at <a href="mailto:empowrapp08162025@gmail.com?subject=Calendar%20Subscription%20Help">empowrapp08162025@gmail.com</a> with:</p>
  <ul style="text-align: left; max-width: 600px; margin: 1rem auto;">
    <li>Your device/platform (iPhone, Android, Mac, Windows, etc.)</li>
    <li>Calendar app you're using (Apple Calendar, Google Calendar, Outlook, etc.)</li>
    <li>Screenshot of any error messages</li>
    <li>What you've already tried</li>
  </ul>
  <p style="margin-top: 1rem;">We'll help you get it working!</p>
</div>

---

## � Quick Reference Card

<span class="energy-cost" data-energy="1" aria-label="Energy cost: very light">🔋 Energy: Very Light</span>

<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 3px solid #0ea5e9; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
  <h3 style="margin-top: 0; text-align: center; color: #0369a1;">� Real-Time Calendar Sync is Live!</h3>
  
  <div style="background: white; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
    <p style="margin: 0 0 0.5rem; font-weight: bold; color: #0369a1;">🔗 Calendar Feed URL:</p>
    <div style="font-size: 0.85rem; margin: 0; background: #f0f9ff; padding: 0.75rem; border-radius: 6px; border: 1px solid #bae6fd; font-family: monospace; word-break: break-all;">
      https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production
    </div>
  </div>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">
    <div style="background: white; padding: 1rem; border-radius: 8px;">
      <p style="margin: 0; font-weight: bold; color: #0369a1;">📊 Total Events:</p>
      <p style="margin: 0.25rem 0 0; font-size: 1.5rem; font-weight: bold; color: #0c4a6e;">131+</p>
    </div>
    <div style="background: white; padding: 1rem; border-radius: 8px;">
      <p style="margin: 0; font-weight: bold; color: #0369a1;">🔄 Update Frequency:</p>
      <p style="margin: 0.25rem 0 0; font-size: 1.5rem; font-weight: bold; color: #0c4a6e;">Every 5 min</p>
    </div>
  </div>
  
  <div style="background: white; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
    <p style="margin: 0 0 0.5rem; font-weight: bold; color: #0369a1;">📅 Included:</p>
    <ul style="margin: 0; text-align: left; columns: 2; -webkit-columns: 2; -moz-columns: 2;">
      <li>User-created events</li>
      <li>Disability awareness days</li>
      <li>Health observances</li>
      <li>Canadian holidays</li>
      <li>Provincial holidays</li>
      <li>Auto-updates hourly</li>
    </ul>
  </div>
  
  <div style="background: white; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
    <p style="margin: 0 0 0.5rem; font-weight: bold; color: #0369a1;">✅ Compatible With:</p>
    <p style="margin: 0; text-align: center; font-size: 0.95rem;">
      📱 iPhone • 🤖 Android • 🍎 Mac • 🪟 Windows<br>
      📧 Outlook • 🌐 Google Calendar • 🗓️ Apple Calendar • ⚡ All standard calendar apps
    </p>
  </div>
  
  <div style="background: #dbeafe; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #0ea5e9;">
    <p style="margin: 0; font-weight: bold;">💡 Pro Tips:</p>
    <ul style="margin: 0.5rem 0 0; text-align: left;">
      <li>Subscribe once, stay updated forever</li>
      <li>New events appear automatically (within 1-24 hours)</li>
      <li>Website updates faster (every 5 minutes)</li>
      <li>All events include full accessibility info</li>
      <li>Free forever - no account needed to subscribe</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin-top: 1.5rem;">
    <a href="#subscribe-to-auto-updating-calendar" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      📲 See Subscription Instructions ↑
    </a>
  </div>
</div>

---

## �📞 Questions About Events?

**Want to organize an event?**  
📧 Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com?subject=Event%20Organization)

**Need help with accessibility planning?**  
📧 Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com?subject=Event%20Accessibility%20Help)

**Have a venue accessibility question?**  
📧 Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com?subject=Venue%20Accessibility)

**Technical issues with calendar feed?**  
📧 Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com?subject=Calendar%20Feed%20Technical%20Issue)

---

<div class="info-box-light">
  💙 <strong>Accessibility Commitment:</strong> If you encounter any event without complete accessibility information, please report it. All events are required to include full accessibility details - no exceptions.
</div>

---

{%- include page-feedback.html -%}

---

**📅 See you at the next event!**
