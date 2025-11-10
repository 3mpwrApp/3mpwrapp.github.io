---
layout: default
title: Campaigns
description: "Join community-driven campaigns for disability rights, worker justice, and social change across Canada. Grassroots organizing, advocacy tools, and collective action for systemic transformation."
image: /assets/empwrapp-logo.png
image_alt: "3mpwrApp Campaigns - Community organizing and disability rights advocacy"
permalink: /campaigns/
---

<link rel="stylesheet" href="{{ '/assets/css/page-enhancements.css' | relative_url }}">

{%- include status-banner.html -%}

# 📣 Campaigns

📖 **3 minute read** | 🔋🔋 **Energy: Light**

<details class="tldr-box" open>
  <summary>⚡ Quick Summary (30 seconds)</summary>
  <ul>
    <li><strong>Coming Soon:</strong> When our app launches, community members can create campaigns and events</li>
    <li><strong>Auto-Sync:</strong> Campaigns created in-app will automatically appear here</li>
    <li><strong>Grassroots Power:</strong> Anyone can start a campaign for disability rights or workers' issues</li>
    <li><strong>All Accessible:</strong> Every event includes accessibility features and virtual options</li>
    <li><strong>Everyone Welcome:</strong> PWDs, injured workers, supporters, allies, unions, and general public can organize</li>
  </ul>
</details>

{%- include social-share.html title="Join 3mpwrApp Campaigns - Community-Driven Advocacy" description="Grassroots organizing for disability rights and worker justice" -%}

<div class="gradient-banner" role="region" aria-labelledby="campaigns-intro-heading">
  <h2 id="campaigns-intro-heading" class="sr-only">Who can organize campaigns</h2>
  <h3 style="margin: 0 0 0.5rem;">💪 Power to the People: ALL People</h3>
  <p style="margin: 0 0 1rem;">Campaigns and events are created by and for everyone fighting for disability justice and workers' rights.</p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75rem; margin: 1rem 0;" role="list">
    <div style="padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;" role="listitem">
      🦽 <strong>Persons with disabilities</strong>
    </div>
    <div style="padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;" role="listitem">
      🏗️ <strong>Injured workers</strong>
    </div>
    <div style="padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;" role="listitem">
      💙 <strong>Family & caregivers</strong>
    </div>
    <div style="padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;" role="listitem">
      🤝 <strong>Allies & advocates</strong>
    </div>
    <div style="padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;" role="listitem">
      🛠️ <strong>Union members</strong>
    </div>
    <div style="padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;" role="listitem">
      🌍 <strong>General public</strong>
    </div>
  </div>
  
  <p style="margin: 1rem 0 0; font-weight: 600;">
    ✊ Disability justice IS social justice. Everyone can organize!
  </p>
</div>

<div class="info-box" style="margin-bottom: 1.5rem;">
  <p><strong>🔗 Related:</strong> Looking for the events calendar? Visit <a href="/events/">Events</a> to subscribe to our ICS feed and get automatic updates on all community events.</p>
</div>

<div class="button-group" role="navigation" aria-label="Campaign actions">
  <a href="/beta/" class="btn btn-primary" aria-label="Sign up for Phase 1 to create campaigns">Sign Up for Phase 1</a>
  <a href="/user-guide#advocacy-tools" class="btn btn-secondary" aria-label="Learn about advocacy tools and features">Learn About Tools</a>
  <a href="/contact/?subject=Campaign Idea" class="btn btn-secondary" aria-label="Contact us to suggest a campaign idea">Suggest a Campaign</a>
</div>

---

## 📣 Active Campaigns (Live from App)

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

<div class="info-box" style="background: #d1fae5; border-left: 4px solid #047857; color: #1a1a1a;">
  <p style="margin: 0; color: #1a1a1a;"><strong>🔄 Real-Time Auto-Sync:</strong> Campaigns created in the 3mpwrApp automatically appear below. Updates every 30 seconds.</p>
  <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: #065f46;">
    <span id="sync-status" style="color: #065f46;">⏳ Checking for campaigns...</span> | 
    Last updated: <span id="last-update" style="color: #065f46;">Never</span>
  </p>
</div>

<section id="campaigns" style="background: transparent; color: #1a1a1a;">
  <div id="campaigns-list" style="margin: 2rem 0;">
    <div style="text-align: center; padding: 2rem; background: transparent;">
      <p style="font-size: 1.2rem; color: #1a1a1a;">⏳ Loading campaigns...</p>
    </div>
  </div>
</section>

<script>
  /**
   * ========================================
   * CAMPAIGNS REAL-TIME AUTO-SYNC
   * ========================================
   * 
   * Fetches campaigns from Cloudflare Worker API:
   * https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns
   * 
   * Data Flow:
   * 1. User creates campaign in 3mpwrApp (React Native)
   * 2. Campaign saved to Firestore (campaigns_production collection)
   * 3. Cloudflare Worker proxies Firestore with proper authentication
   * 4. Website fetches from Worker API every 30 seconds
   * 5. Campaigns display automatically below
   * 
   * Related:
   * - Campaigns API: https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns
   * - Events API: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events
   * - Events Page: https://3mpwrapp.pages.dev/events/
   * ========================================
   */

  /**
   * Parse Firestore field value from document
   * Firestore REST API returns fields in format: { stringValue: "...", integerValue: "...", etc }
   */
  function parseFirestoreValue(field) {
    if (!field) return null;
    
    // Handle different Firestore value types
    if (field.stringValue !== undefined) return field.stringValue;
    if (field.integerValue !== undefined) return parseInt(field.integerValue);
    if (field.doubleValue !== undefined) return parseFloat(field.doubleValue);
    if (field.booleanValue !== undefined) return field.booleanValue;
    if (field.timestampValue !== undefined) return new Date(field.timestampValue);
    if (field.arrayValue && field.arrayValue.values) {
      return field.arrayValue.values.map(v => parseFirestoreValue(v));
    }
    if (field.mapValue && field.mapValue.fields) {
      const obj = {};
      for (const [key, value] of Object.entries(field.mapValue.fields)) {
        obj[key] = parseFirestoreValue(value);
      }
      return obj;
    }
    if (field.nullValue !== undefined) return null;
    
    return null;
  }

  /**
   * Convert Firestore document to campaign object
   */
  function parseCampaignDocument(doc) {
    if (!doc || !doc.fields) return null;
    
    const fields = doc.fields;
    const campaign = {};
    
    // Extract document ID from name path
    if (doc.name) {
      const nameParts = doc.name.split('/');
      campaign.id = nameParts[nameParts.length - 1];
    }
    
    // Parse all fields
    for (const [key, value] of Object.entries(fields)) {
      campaign[key] = parseFirestoreValue(value);
    }
    
    return campaign;
  }

  /**
   * Display campaigns on the page
   * @param {Array} campaigns - Array of campaign objects from Firestore
   */
  function displayCampaigns(campaigns) {
    const container = document.getElementById('campaigns-list');
    
    if (!campaigns || campaigns.length === 0) {
      container.innerHTML = `
        <div class="warning-box">
          <h3 style="margin-top: 0;">🚀 Campaigns Coming Soon!</h3>
          <p style="font-size: 1.1rem;"><strong>No active campaigns yet - but when our app launches, this space will come alive with community-created campaigns!</strong></p>
          <p>Community members will be able to:</p>
          <ul style="text-align: left; max-width: 600px; margin: 1rem auto;">
            <li>🎯 Create campaigns directly in the app</li>
            <li>📱 Set campaigns as public to appear here automatically</li>
            <li>📊 Track petition signatures and participation</li>
            <li>📣 Organize rallies and events</li>
            <li>🤝 Connect with other advocates</li>
            <li>💪 Amplify grassroots movements</li>
          </ul>
          <p style="margin-top: 1.5rem;"><em>Stay tuned - powerful organizing tools are on the way!</em></p>
        </div>
      `;
      return;
    }
    
    // Display campaigns
    container.innerHTML = campaigns.map(campaign => `
        <article class="campaign-card" style="border: 3px solid #0066cc; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; background: #f8f9fa; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          <h3 style="margin-top: 0; color: #003d7a; font-size: 1.5rem; font-weight: 700;">
            ${campaign.icon || '📣'} ${campaign.title}
          </h3>
          
          ${campaign.summary ? `<p style="color: #1a1a1a; margin: 1rem 0; font-size: 1.05rem; line-height: 1.6;">${campaign.summary}</p>` : ''}
          
          ${campaign.goal ? `
            <div style="margin: 1rem 0;">
              <p style="margin: 0.5rem 0; color: #1a1a1a; font-weight: 600;">
                🎯 <strong>Goal:</strong> ${campaign.goal}
              </p>
              ${campaign.progress ? `
                <div style="background: #d1d5db; border-radius: 8px; height: 28px; overflow: hidden; margin: 0.5rem 0; border: 2px solid #1a1a1a;">
                  <div style="background: #047857; height: 100%; width: ${campaign.progress}%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 0.9rem;">
                    ${campaign.progress}%
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${campaign.organizer ? `<p style="color: #1a1a1a; font-size: 0.95rem; margin: 0.5rem 0;">👤 <strong>Organized by:</strong> ${campaign.organizer}</p>` : ''}
          
          ${campaign.tags && campaign.tags.length > 0 ? `
            <div style="margin: 1rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${campaign.tags.map(tag => `
                <span style="display: inline-block; padding: 6px 12px; background: #fde047; color: #1a1a1a; border: 2px solid #1a1a1a; border-radius: 6px; font-size: 0.9em; font-weight: 700;">
                  ${tag}
                </span>
              `).join('')}
            </div>
          ` : ''}
          
          <div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
            <button 
              onclick="joinCampaign('${campaign.id}', '${campaign.title}')" 
              class="btn btn-primary"
              style="padding: 12px 24px; background: #0052a3; color: #ffffff; border: 3px solid #003d7a; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem; min-height: 48px;"
            >
              💪 Join Campaign
            </button>
            
            <div class="share-buttons" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button onclick="shareCampaignToSocial('${campaign.title.replace(/'/g, "\\'")}', '${(campaign.summary || '').substring(0, 100).replace(/'/g, "\\'")}', 'twitter')" style="padding: 10px 16px; background: #0d47a1; color: #ffffff; border: 3px solid #002171; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 700; min-height: 44px;" title="Share on X/Twitter" aria-label="Share on X/Twitter">𝕏 Share</button>
              <button onclick="shareCampaignToSocial('${campaign.title.replace(/'/g, "\\'")}', '${(campaign.summary || '').substring(0, 100).replace(/'/g, "\\'")}', 'facebook')" style="padding: 10px 16px; background: #1565c0; color: #ffffff; border: 3px solid #003c8f; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 700; min-height: 44px;" title="Share on Facebook" aria-label="Share on Facebook">📘 Share</button>
              <button onclick="shareCampaignToSocial('${campaign.title.replace(/'/g, "\\'")}', '${(campaign.summary || '').substring(0, 100).replace(/'/g, "\\'")}', 'linkedin')" style="padding: 10px 16px; background: #005a9e; color: #ffffff; border: 3px solid #003d6b; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 700; min-height: 44px;" title="Share on LinkedIn" aria-label="Share on LinkedIn">💼 Share</button>
              <button onclick="copyCampaignDetails('${campaign.title.replace(/'/g, "\\'")}', '${(campaign.summary || '').substring(0, 100).replace(/'/g, "\\'")}', '${campaign.shareLink || ''}')" style="padding: 10px 16px; background: #047857; color: #ffffff; border: 3px solid #065f46; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 700; min-height: 44px;" title="Copy details" aria-label="Copy campaign details">📋 Copy</button>
            </div>
          </div>
        </article>
      `).join('');
  }

  /**
   * Fetch and display campaigns from Cloudflare Worker API
   * Updates automatically every 30 seconds
   */
  async function loadCampaigns() {
    try {
      console.log('🔄 Fetching campaigns from Cloudflare Worker...');
      
      // Update sync status
      const syncStatus = document.getElementById('sync-status');
      if (syncStatus) syncStatus.textContent = '🔄 Syncing...';
      
      // Fetch from Cloudflare Worker API (proxies Firestore with proper auth)
      const workerUrl = 'https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns';
      const response = await fetch(workerUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Worker returns campaigns in simplified format
      let campaigns = [];
      if (data.success && data.campaigns && Array.isArray(data.campaigns)) {
        campaigns = data.campaigns;
      }
      
      console.log(`✅ Loaded ${campaigns.length} campaigns from Worker API`);
      
      displayCampaigns(campaigns);
      
      // Update sync status - success
      if (syncStatus) {
        syncStatus.textContent = campaigns.length > 0 
          ? `✅ ${campaigns.length} active campaign${campaigns.length !== 1 ? 's' : ''}`
          : '📭 No active campaigns yet';
      }
      
      // Update last update time
      const lastUpdate = document.getElementById('last-update');
      if (lastUpdate) {
        lastUpdate.textContent = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to load campaigns:', error);
      
      // Update sync status - error
      const syncStatus = document.getElementById('sync-status');
      if (syncStatus) syncStatus.textContent = '⚠️ Connection issue';
      
      document.getElementById('campaigns-list').innerHTML = `
        <div class="warning-box">
          <h3 style="margin-top: 0;">⚠️ Connection Issue</h3>
          <p>Unable to load campaigns right now. This could mean:</p>
          <ul style="text-align: left; max-width: 600px; margin: 1rem auto;">
            <li>No campaigns have been created yet</li>
            <li>Temporary network issue</li>
            <li>Please refresh the page</li>
          </ul>
          <p style="margin-top: 1rem;">Please check back later or <a href="/contact/">contact us</a> if the problem persists.</p>
        </div>
      `;
    }
  }
  
  // Handle campaign join
  function joinCampaign(campaignId, campaignTitle) {
    // Try to deep link to app
    const appUrl = 'empowrapp://campaigns/' + campaignId;
    
    // Attempt to open app
    window.location.href = appUrl;
    
    // If app doesn't open after 2 seconds, show download options
    setTimeout(() => {
      if (confirm('3mpwrApp is required to join campaigns. Would you like to learn more about the app?')) {
        window.location.href = '/beta/';
      }
    }, 2000);
  }
  
  // Share campaign to specific social platform with #3mpwrApp hashtag
  function shareCampaignToSocial(title, description, platform) {
    const campaignUrl = 'https://3mpwrapp.pages.dev/campaigns/';
    const hashtag = '3mpwrApp';
    const shareText = `${title}\n\n${description}\n\nJoin the campaign on 3mpwr App! #${hashtag}`;
    
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(campaignUrl);
    const encodedTitle = encodeURIComponent(title);
    
    let shareUrl;
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}&hashtag=%23${hashtag}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
  
  // Copy campaign details with #3mpwrApp hashtag
  function copyCampaignDetails(title, description, shareLink) {
    const campaignUrl = shareLink || 'https://3mpwrapp.pages.dev/campaigns/';
    const copyText = `${title}\n\n${description}\n\nJoin the campaign: ${campaignUrl}\n\n#3mpwrApp\n\nPowered by 3mpwr App | https://3mpwrapp.pages.dev`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyText).then(() => {
        alert('✅ Campaign details copied with #3mpwrApp! Share it with your network.');
      }).catch(err => {
        console.error('Copy failed:', err);
        prompt('Copy this text to share:', copyText);
      });
    } else {
      prompt('Copy this text to share:', copyText);
    }
  }
  
  // Handle campaign share (legacy fallback)
  function shareCampaign(shareLink, campaignTitle) {
    const shareText = `Join this campaign on 3mpwrApp! ${campaignTitle} #3mpwrApp`;
    
    if (navigator.share) {
      navigator.share({
        title: campaignTitle,
        text: shareText,
        url: shareLink
      }).catch(err => console.log('Share cancelled'));
    } else {
      // Fallback: copy to clipboard with hashtag
      const fullText = `${shareText}\n${shareLink}`;
      navigator.clipboard.writeText(fullText).then(() => {
        alert('Campaign link copied to clipboard with #3mpwrApp hashtag! Share it with your network.');
      }).catch(() => {
        prompt('Copy this text to share:', fullText);
      });
    }
  }
  
  // Load campaigns when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCampaigns);
  } else {
    loadCampaigns();
  }
  
  // Auto-refresh every 30 seconds
  setInterval(loadCampaigns, 30 * 1000);
</script>

<div class="info-box" style="margin: 2rem 0;">
  <p><strong>💡 Want to create a campaign?</strong> Sign up for Phase 1 and start organizing today! <a href="/beta/">Sign up now →</a></p>
</div>

<div class="info-box" style="margin: 2rem 0;">
  <p><strong>📅 Looking for Events?</strong> Check out our <a href="/events/">Events Calendar</a> for upcoming community events, rallies, and gatherings. Subscribe to the ICS feed for automatic updates!</p>
</div>

---

## 🔄 How Auto-Sync Works

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**When the app launches, organizing becomes effortless:**

**For Campaign Creators:**
1. 📱 Open the 3mpwrApp
2. ➕ Create a campaign or event
3. 🌐 Toggle "Make Public"
4. ✅ It instantly appears on this website

**For Community Members:**
- 👀 See all active campaigns without downloading the app
- 📱 Click to join, sign, or participate
- 📊 Watch real-time participation grow
- 🔔 Get notified of new campaigns that match your interests

**Benefits:**
- ✅ No duplicate data entry
- ✅ Real-time updates
- ✅ Website visitors can discover campaigns without app
- ✅ Seamless cross-platform experience
- ✅ All accessibility features built-in

---

## 🎯 Rep Tracker - Find Your Representatives

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

<div class="info-box-bordered">
  <h3 style="margin-top: 0;">📍 Who Represents You?</h3>
  
  <p><strong>When our app launches, Rep Tracker will automatically:</strong></p>
  <ul>
    <li>🗺️ Detect your location</li>
    <li>👤 Show your federal MP, provincial MPP/MLA, and municipal councillor</li>
    <li>📊 Display their voting record on disability/workers' rights issues</li>
    <li>📧 Provide pre-written email templates for advocacy</li>
    <li>☎️ Give you phone scripts for calling their office</li>
    <li>📱 Show their social media for public advocacy</li>
    <li>📈 Track response rates: "This MPP responds to 78% of disability rights emails"</li>
  </ul>
  
  <p><strong>Make advocacy effortless:</strong></p>
  <ul>
    <li>✅ No more searching for who to contact</li>
    <li>✅ Know their track record before you reach out</li>
    <li>✅ Pre-written messages save your energy</li>
    <li>✅ See which representatives are responsive</li>
    <li>✅ Coordinate community campaigns targeting same reps</li>
  </ul>
  
  <p style="margin-top: 1.5rem;"><strong>Example:</strong> "Your MPP is Jane Smith. She voted FOR accessible transit bill. Here's a thank-you email template to send."</p>
  
  <p><em>Coming soon in the app - political advocacy made accessible!</em></p>
</div>

### Manual Representative Search (While We Build)

**For now, you can find your representatives here:**

**Federal (MP):**
- 🔍 [Find Your MP](https://www.ourcommons.ca/members/en)
- 📧 Contact template: [Email Your MP About Disability Rights]

**Provincial:**
- 🔍 **Ontario:** [Find Your MPP](https://www.ola.org/en/members/current)
- 🔍 **British Columbia:** [Find Your MLA](https://www.leg.bc.ca/learn-about-us/members)
- 🔍 **Alberta:** [Find Your MLA](https://www.assembly.ab.ca/members/members-of-the-legislative-assembly)
- 🔍 **Quebec:** [Find Your MNA](https://www.assnat.qc.ca/en/deputes/index.html)
- 🔍 **All Provinces:** [Provincial Legislature Websites](https://www.canada.ca/en/government/dept.html)

**Municipal:**
- 🔍 Search "[Your City] city councillor" to find your local representative

**What to Say:**
- ✅ State your issue clearly
- ✅ Share your personal story (if comfortable)
- ✅ Make a specific ask (support Bill X, oppose Bill Y, meet with community)
- ✅ Be respectful but firm
- ✅ Follow up if no response in 2 weeks

---

## 🎯 Campaign Ideas You Can Start

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**Need inspiration? Here are campaigns our community might create:**

**🏛️ Workers' Rights:**
- Fair WSIB/WCB appeals processes
- Living wage for disabled workers
- Workplace accommodation funding
- Return-to-work policy reform
- End employer retaliation against injured workers
- Mandatory ergonomic assessments
- Workers' compensation coverage for mental health injuries

**♿ Disability Rights & Accessibility:**
- Accessible public transit (buses, trains, stations)
- Barrier-free healthcare facilities
- ASL interpretation as standard in healthcare
- Accessible housing initiatives
- Automatic door openers on all public buildings
- Audio crosswalk signals province-wide
- Accessible voting locations and materials
- Disability representation in government
- End subminimum wage for disabled workers
- Accessible emergency services and shelters
- Disability-inclusive education policies

**🏥 Healthcare:**
- Pain management access without stigma
- Mental health support for injured workers
- Chronic illness recognition in compensation
- Accessible telehealth as permanent option
- Home care funding increases
- Disability-competent medical training
- Patient advocates in hospitals
- Prescription coverage for disability-related medications

**💼 Employment:**
- End sub-minimum wage for disabled workers
- Flexible work policies
- Disability hiring initiatives
- Entrepreneurship support for disabled business owners
- Job protection during flare-ups
- Paid sick days for chronic conditions
- Remote work accommodation rights

**📣 Awareness:**
- Invisible disability recognition
- Chronic pain education
- Spoon theory public awareness
- Anti-ableism campaigns
- Disability pride celebrations
- Mental health destigmatization
- Neurodiversity acceptance

**🏘️ Community & Social:**
- Accessible recreation facilities
- Disability-inclusive event planning
- Accessible restaurant compliance
- Service animal rights protection
- Companion care funding
- Disability dating app safety
- Accessible tourism initiatives

**⚖️ Legal & Policy:**
- Strengthen accessibility legislation
- Enforce existing disability rights laws
- Criminal justice reform for disabled people
- End institutionalization
- Disability impact assessments for all new policies
- Legal aid for disability discrimination cases

*These are just ideas - you can create a campaign about any issue affecting disabled people, injured workers, or the broader community!*

---

## � Campaign Ideas By Organizer Type

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

<div class="info-box">
  <strong>🎯 Different perspectives, same goal:</strong> Here are campaign ideas tailored to different organizers. Pick what resonates with YOUR experience and position!
</div>

### 🦽 For Persons with Disabilities

**You know what needs to change - here's how to organize it:**
- 📱 Accessible transportation campaigns (based on YOUR daily barriers)
- 🏠 Housing accessibility improvements in YOUR neighbourhood
- 🏥 Healthcare access for YOUR condition/disability
- 💼 Employment discrimination YOU'VE faced
- 🚫 Anti-ableism awareness from YOUR lived experience
- ♿ Accessibility audits of YOUR local businesses

**Your expertise:** Lived experience of disability, direct knowledge of barriers

---

### 🏗️ For Injured Workers

**You understand the system's failures - fight back:**
- ⚖️ WSIB/WCB reform (appeal process, benefit levels, claim delays)
- 🏭 Workplace safety enforcement
- 💪 Return-to-work rights and protections
- 🏢 Employer accountability for workplace injuries
- 🧠 Mental health injury recognition
- 💰 Fair compensation for permanent impairments

**Your expertise:** Workers' comp system navigation, workplace injury reality

---

### 💙 For Family Supporters & Caregivers

**You see gaps others miss - fill them:**
- 👨‍👩‍👧‍👦 Caregiver support program campaigns
- 💵 Respite care funding
- 📚 Family navigation resource development
- 🏫 Disability education in schools
- 🏥 Family inclusion in healthcare decisions
- 💼 Caregiver employment protections

**Your expertise:** Family perspective, caregiver challenges, system navigation from outside

---

### 🛠️ For Unions & Labour Organizations

**You have collective power - use it:**
- 📋 Disability inclusion in collective agreements
- ♿ Workplace accessibility audits and fixes
- 🤝 Accommodations enforcement
- 💪 Joint campaigns with disability organizations
- 🏭 Workplace injury prevention programs
- 📊 Disability data tracking in workplaces
- 🎓 Anti-ableism training for members

**Your expertise:** Collective organizing, bargaining power, worker solidarity

---

### 🤝 For Non-Disabled Allies

**Solidarity means action - here's how:**
- 📢 Amplify disabled-led campaigns (share, don't lead)
- ♿ Community accessibility audits (business compliance checks)
- 🏢 Corporate accountability campaigns
- 🎓 Public education on disability justice
- 💰 Fundraising for disabled-led organizations
- 🏛️ Political advocacy on behalf of community asks

**Your role:** Support, amplify, take direction from disabled leadership

---

### 🏥 For Healthcare Providers

**You see system failures daily - advocate for change:**
- 🏥 Patient-centered care policy reforms
- 📚 Disability-competent medical training
- 💊 Pain management access without stigma
- ⚕️ Healthcare accessibility improvements
- 🧠 Mental health parity in treatment
- 📋 Plain-language medical information

**Your expertise:** Clinical perspective, system knowledge, patient advocacy

---

### ⚖️ For Legal Advocates

**You understand legal barriers - dismantle them:**
- 📝 Accessible legal information campaigns
- ⚖️ Disability discrimination case support
- 📋 Know-your-rights workshops
- 🏛️ Accessibility legislation strengthening
- 💼 Employment law reform
- 🏠 Housing rights enforcement

**Your expertise:** Legal knowledge, rights-based advocacy, policy interpretation

---

### 🏢 For Progressive Employers

**Show genuine commitment - not performance:**
- ♿ Workplace accessibility beyond minimum compliance
- 💼 Inclusive hiring from disability community
- 🎓 Authentic accommodation training
- 📊 Disability inclusion metrics and transparency
- 🤝 Partnership with disability organizations
- 💡 Innovation in accessible workplace design

**Your role:** Leadership by example, resource commitment, humility

---

### 🌍 For General Public

**Education is activism - start here:**
- 📚 Ableism awareness campaigns
- ♿ Local accessibility advocacy
- 🤝 Community inclusion initiatives
- 📢 Social media education campaigns
- 🎓 Disability justice learning circles
- 💪 Bystander intervention training

**Your role:** Learn, unlearn ableism, show up, listen, support

---

### ✊ For Social Justice Organizations

**Cross-movement solidarity builds power:**
- 🌈 Intersectional campaigns (disability + race + gender + class)
- 🏘️ Housing justice with accessibility requirements
- � Anti-poverty campaigns centered on disabled people
- ⚖️ Criminal justice reform for disabled prisoners
- 🌍 Environmental justice with accessibility focus
- 📣 Coalition building across movements
- 🤝 Mutual aid networks

**Your role:** Build bridges, center marginalized voices, fight interconnected oppression

**We believe:** All liberation movements are connected. You can't fight racism without fighting ableism. You can't fight poverty without fighting for disability rights. We're stronger together.

---

## �💡 How to Get Involved

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

### Ways to Participate (All Energy Levels Welcome!)

**🌐 Online Activism (Low Energy - 🔋):**
- Sign petitions
- Share campaigns on social media
- Email templates to representatives
- Join virtual town halls from bed
- Post supportive comments

**🤝 Behind-the-Scenes Support (Medium Energy - 🔋🔋):**
- Help draft campaign materials
- Research policy positions
- Design graphics
- Moderate forums
- Coordinate with partner organizations

**📢 Front-Line Organizing (Higher Energy - 🔋🔋🔋🔋):**
- Attend rallies and protests
- Speak at events
- Meet with elected officials
- Give media interviews
- Lead organizing committees

**💰 Financial Support (Any Energy Level):**
- Contribute to campaign funds
- Sponsor accessibility features at events
- Support travel costs for attendees
- Fund legal challenges

**Remember:** ALL participation is valuable. Do what you can, when you can. Rest is resistance too.

---

## 🏆 Community Impact

<span class="energy-cost" data-energy="1" aria-label="Energy cost: very light">🔋 Energy: Very Light</span>

**As our community grows, this section will showcase:**

- ✅ Petition signatures and campaign wins
- ✅ Policy changes we've influenced
- ✅ Rallies and events organized
- ✅ Media coverage and public awareness
- ✅ Individual success stories
- ✅ Partnerships formed
- ✅ Lives changed

*This space will grow with every victory - big and small!*

---

## 📋 Campaign Guidelines

<span class="energy-cost" data-energy="2" aria-label="Energy cost: light">🔋🔋 Energy: Light</span>

**When creating campaigns in the app, we follow these principles:**

**✅ Community-Centered:**
- Led by disabled people and injured workers
- "Nothing About Us Without Us"
- Diverse perspectives welcomed
- Grassroots-driven

**✅ Accessible:**
- All events include accessibility information
- Virtual participation always available
- Multiple ways to engage
- Respect for varying energy levels

**✅ Evidence-Based:**
- Backed by research and lived experience
- Clear, achievable goals
- Measurable outcomes
- Transparent about progress

**✅ Inclusive:**
- Welcoming to all disability types
- Intersectional approach
- Language accessibility
- No gatekeeping

**✅ Sustainable:**
- Pacing for organizers with disabilities
- Shared leadership
- Burnout prevention
- Long-term thinking

---

## 📞 Questions About Campaigns?

**Have an idea for a campaign?**  
📧 Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com?subject=Campaign%20Idea)

**Want to organize an event?**  
📧 Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com?subject=Event%20Organization)

**Need organizing support?**  
� Email: [empowrapp08162025@gmail.com](mailto:empowrapp08162025@gmail.com?subject=Organizing%20Support)

**Partnership inquiries?**  
📝 Visit our [Connect page](/connect/)

---

<div class="info-box-light">
  💙 <strong>Accessibility Commitment:</strong> Every campaign and event will include full accessibility details - wheelchair access, ASL interpretation, quiet rooms, virtual options, energy costs, and more. Accessibility is not optional; it's mandatory.
</div>

---

{%- include page-feedback.html -%}

---

**💪 Together, we organize. Together, we win.**
