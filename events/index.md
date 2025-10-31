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

<details class="tldr-box" open>
  <summary>⚡ Quick Summary (30 seconds)</summary>
  <ul>
    <li><strong>Coming Soon:</strong> Subscribe to our ICS calendar feed for automatic event updates</li>
    <li><strong>Auto-Sync:</strong> Events created in-app automatically appear here and in your calendar</li>
    <li><strong>All Accessible:</strong> Every event includes accessibility details, virtual options, and energy costs</li>
    <li><strong>Community-Organized:</strong> Anyone can create events - workshops, meetups, rallies, support groups</li>
    <li><strong>Privacy-First:</strong> Only public events appear here; private/group events stay in-app only</li>
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
  // Fetch and display events from app
  async function loadEvents() {
    try {
      const response = await fetch('https://3mpwrapp.pages.dev/api/events.json');
      const events = await response.json();
      
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

<div class="info-box" style="margin: 2rem 0;">
  <p><strong>📲 Subscribe to Calendar Feed:</strong> Once the ICS feed is available, you'll be able to subscribe and get automatic calendar updates. <em>Coming during Beta Phase 1!</em></p>
</div>

---

## 🔄 How Event Auto-Sync Works

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**When the app launches, organizing events becomes effortless:**

**For Event Organizers:**
1. 📱 Create event in the 3mpwrApp
2. ✅ Add all accessibility details (wheelchair access, ASL, quiet room, etc.)
3. 🌐 Toggle "Make Public" to list it here
4. 🔔 Attendees get automatic reminders

**For Event Attendees:**
- 👀 Browse all public events on this website
- 📅 Subscribe to ICS feed for automatic calendar sync
- 📲 Get updates if event details change
- ♿ See all accessibility info before attending
- 🎟️ RSVP directly from calendar or website

**Technical Details (For Calendar Nerds):**
- 📡 **ICS Feed:** Standard text/calendar format
- ⏱️ **Cache:** 5-minute refresh window (balance between freshness and performance)
- 🔗 **Integration:** Works with Google Calendar, Apple Calendar, Outlook, Thunderbird, etc.
- 🔒 **Privacy:** Only events marked "public" appear in feed
- 🌍 **Timezones:** Automatic conversion to your local timezone

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

## 📞 Questions About Events?

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

<div class="crisis-resources" role="alert">
  <p><strong>🆘 Need immediate help?</strong></p>
  <p>24/7 Crisis Line: <a href="tel:1-833-456-4566">1-833-456-4566</a> | <a href="/crisis-resources">More resources →</a></p>
</div>

{%- include page-feedback.html -%}

---

**📅 See you at the next event!**
