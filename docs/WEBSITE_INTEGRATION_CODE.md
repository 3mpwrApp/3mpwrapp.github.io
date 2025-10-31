# 🌐 Website Integration - Exact Code to Copy/Paste

## Copy This Code Into Your Website

### 1. Events Calendar Integration

```html
<!-- Events Section on Your Website -->
<section id="events">
  <h2>Upcoming Events</h2>
  <div id="events-list">Loading events...</div>
</section>

<script>
  // Fetch and display events
  async function loadEvents() {
    try {
      const response = await fetch('https://3mpwrapp.pages.dev/api/events.json');
      const events = await response.json();
      
      const container = document.getElementById('events-list');
      
      if (events.length === 0) {
        container.innerHTML = '<p>No upcoming events at this time. Check back soon!</p>';
        return;
      }
      
      // Sort events by date
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Display events
      container.innerHTML = events.map(event => `
        <article class="event-card">
          <h3>${event.title}</h3>
          <p class="event-date">${formatDate(event.date)}</p>
          <p class="event-description">${event.description}</p>
          
          ${event.location ? `<p class="event-location">📍 ${event.location}</p>` : ''}
          ${event.isVirtual ? `<span class="badge">🌐 Virtual</span>` : ''}
          ${event.asl ? `<span class="badge">🤟 ASL</span>` : ''}
          ${event.captions ? `<span class="badge">📝 Captions</span>` : ''}
          ${event.stepFree ? `<span class="badge">♿ Accessible</span>` : ''}
          ${event.sensorySpace ? `<span class="badge">🎧 Sensory-Friendly</span>` : ''}
        </article>
      `).join('');
      
    } catch (error) {
      console.error('Failed to load events:', error);
      document.getElementById('events-list').innerHTML = 
        '<p>Unable to load events. Please try again later.</p>';
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
      minute: '2-digit'
    });
  }
  
  // Load events when page loads
  document.addEventListener('DOMContentLoaded', loadEvents);
</script>

<style>
  /* Basic Event Card Styling */
  .event-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background: white;
  }
  
  .event-card h3 {
    margin-top: 0;
    color: #333;
  }
  
  .event-date {
    color: #666;
    font-weight: bold;
  }
  
  .event-location {
    color: #555;
  }
  
  .badge {
    display: inline-block;
    padding: 4px 8px;
    margin-right: 8px;
    background: #e0f2fe;
    border-radius: 4px;
    font-size: 0.85em;
  }
</style>
```

---

### 2. Campaigns Integration

```html
<!-- Campaigns Section on Your Website -->
<section id="campaigns">
  <h2>Active Campaigns</h2>
  <div id="campaigns-list">Loading campaigns...</div>
</section>

<script>
  // Fetch and display campaigns
  async function loadCampaigns() {
    try {
      const response = await fetch('https://3mpwrapp.pages.dev/api/campaigns.json');
      const campaigns = await response.json();
      
      const container = document.getElementById('campaigns-list');
      
      if (campaigns.length === 0) {
        container.innerHTML = '<p>No active campaigns at this time. Check back soon!</p>';
        return;
      }
      
      // Display campaigns
      container.innerHTML = campaigns.map(campaign => `
        <article class="campaign-card">
          <h3>${campaign.title}</h3>
          <p>${campaign.summary}</p>
          <button onclick="joinCampaign('${campaign.id}')">Learn More</button>
        </article>
      `).join('');
      
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      document.getElementById('campaigns-list').innerHTML = 
        '<p>Unable to load campaigns. Please try again later.</p>';
    }
  }
  
  // Handle campaign join (customize as needed)
  function joinCampaign(campaignId) {
    // Option 1: Deep link to app
    window.location.href = `empowrapp://campaigns/${campaignId}`;
    
    // Option 2: Show modal with app download links
    // showAppDownloadModal();
  }
  
  // Load campaigns when page loads
  document.addEventListener('DOMContentLoaded', loadCampaigns);
</script>

<style>
  /* Basic Campaign Card Styling */
  .campaign-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background: white;
  }
  
  .campaign-card h3 {
    margin-top: 0;
    color: #333;
  }
  
  .campaign-card button {
    background: #0066cc;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
  }
  
  .campaign-card button:hover {
    background: #0052a3;
  }
</style>
```

---

### 3. Combined Events + Campaigns (All-in-One)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3mpwr - Events & Campaigns</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    
    section {
      margin-bottom: 40px;
    }
    
    h2 {
      color: #333;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 10px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card h3 {
      margin-top: 0;
      color: #333;
    }
    
    .date {
      color: #666;
      font-weight: bold;
      margin: 10px 0;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      margin: 4px 4px 4px 0;
      background: #e0f2fe;
      border-radius: 4px;
      font-size: 0.85em;
    }
    
    button {
      background: #0066cc;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      margin-top: 10px;
    }
    
    button:hover {
      background: #0052a3;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  </style>
</head>
<body>

  <!-- Events Section -->
  <section id="events-section">
    <h2>📅 Upcoming Events</h2>
    <div id="events-container" class="loading">Loading events...</div>
  </section>

  <!-- Campaigns Section -->
  <section id="campaigns-section">
    <h2>🎯 Active Campaigns</h2>
    <div id="campaigns-container" class="loading">Loading campaigns...</div>
  </section>

  <script>
    const API_BASE = 'https://3mpwrapp.pages.dev/api';
    
    // Load everything when page loads
    document.addEventListener('DOMContentLoaded', () => {
      loadEvents();
      loadCampaigns();
    });
    
    // Fetch and display events
    async function loadEvents() {
      try {
        const response = await fetch(`${API_BASE}/events.json`);
        const events = await response.json();
        
        const container = document.getElementById('events-container');
        
        if (events.length === 0) {
          container.innerHTML = '<p>No upcoming events. Check back soon!</p>';
          container.className = '';
          return;
        }
        
        // Sort by date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Render events
        container.className = '';
        container.innerHTML = events.map(event => `
          <div class="card">
            <h3>${event.title}</h3>
            <p class="date">📅 ${formatDate(event.date)}</p>
            <p>${event.description}</p>
            ${event.location ? `<p>📍 ${event.location}</p>` : ''}
            <div>
              ${event.isVirtual ? '<span class="badge">🌐 Virtual</span>' : ''}
              ${event.asl ? '<span class="badge">🤟 ASL</span>' : ''}
              ${event.captions ? '<span class="badge">📝 Captions</span>' : ''}
              ${event.stepFree ? '<span class="badge">♿ Accessible</span>' : ''}
              ${event.sensorySpace ? '<span class="badge">🎧 Sensory-Friendly</span>' : ''}
            </div>
          </div>
        `).join('');
        
      } catch (error) {
        console.error('Failed to load events:', error);
        document.getElementById('events-container').innerHTML = 
          '<p class="error">Unable to load events. Please try again later.</p>';
      }
    }
    
    // Fetch and display campaigns
    async function loadCampaigns() {
      try {
        const response = await fetch(`${API_BASE}/campaigns.json`);
        const campaigns = await response.json();
        
        const container = document.getElementById('campaigns-container');
        
        if (campaigns.length === 0) {
          container.innerHTML = '<p>No active campaigns. Check back soon!</p>';
          container.className = '';
          return;
        }
        
        // Render campaigns
        container.className = '';
        container.innerHTML = campaigns.map(campaign => `
          <div class="card">
            <h3>${campaign.title}</h3>
            <p>${campaign.summary}</p>
            <button onclick="downloadApp()">Join Campaign in App</button>
          </div>
        `).join('');
        
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        document.getElementById('campaigns-container').innerHTML = 
          '<p class="error">Unable to load campaigns. Please try again later.</p>';
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
        minute: '2-digit'
      });
    }
    
    // Download app action
    function downloadApp() {
      // Customize this with your actual app download links
      const android = 'https://play.google.com/store/apps/details?id=com.app3mpwr.app3mpwr';
      const ios = 'https://apps.apple.com/app/3mpwr/idXXXXXXXXX'; // Update when iOS available
      
      // Detect platform
      const isAndroid = /android/i.test(navigator.userAgent);
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      
      if (isAndroid) {
        window.location.href = android;
      } else if (isIOS) {
        alert('iOS app coming soon! Please check back later.');
        // window.location.href = ios; // Uncomment when iOS ready
      } else {
        // Desktop - show options
        const choice = confirm('Download 3mpwr app?\n\nOK = Android\nCancel = Show Options');
        if (choice) {
          window.location.href = android;
        } else {
          alert('Visit on your mobile device to download the app!');
        }
      }
    }
  </script>

</body>
</html>
```

---

## 📋 Quick Answers to Your Questions

### 1. ✅ Sample Data Updated
- **Events**: 1 example event (holidays auto-generated from `data/holidays-ca.ts`)
- **Campaigns**: 1 example campaign
- You can replace these examples with real events/campaigns anytime

### 2. ✅ Updates Go to Production Automatically
**Yes!** Here's the workflow:

```bash
# 1. Edit data
code data/events.ts
code data/campaigns.ts

# 2. Sync to JSON
npm run sync:data

# 3. Commit and push
git add data/ public/api/
git commit -m "feat: update events"
git push
```

**Cloudflare Pages automatically deploys** when you push to `main`. 
Your website gets the updates within ~1 minute! 🚀

### 3. ✅ Production Build Complete
Great! Google Sign-In is now configured in the production build.

### 4. ✅ Exact Website Integration Code
Use the code blocks above! They're copy-paste ready.

---

## 🚀 How Data Flows

```
┌─────────────────┐
│  data/events.ts │  ← YOU EDIT HERE
│data/campaigns.ts│
└────────┬────────┘
         │
         ▼
  npm run sync:data
         │
         ▼
┌────────────────────┐
│ public/api/*.json  │  ← Auto-generated
└────────┬───────────┘
         │
         ▼
   git commit + push
         │
         ▼
┌─────────────────────┐
│ Cloudflare Pages    │  ← Auto-deploys
│ 3mpwrapp.pages.dev  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  YOUR WEBSITE       │  ← Fetches from API
│  (JavaScript code)  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   MOBILE APP        │  ← Also fetches from API
│  (services/*.ts)    │
└─────────────────────┘
```

---

## 🎯 Live URLs

- **Events JSON**: https://3mpwrapp.pages.dev/api/events.json
- **Campaigns JSON**: https://3mpwrapp.pages.dev/api/campaigns.json

Test them in your browser right now!

---

## 📝 Notes

- **Cache**: JSON files are cached for 5 minutes
- **CORS**: Enabled for all domains
- **Updates**: Live within ~1 minute after push to main
- **Holidays**: Auto-generated (Canadian holidays + disability observances)
- **Format**: Standard JSON, no special processing needed

---

**Need help?** Check `docs/DATA_SYNC_GUIDE.md` for full documentation.
