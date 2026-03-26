#!/usr/bin/env node
/**
 * POST-TBDIWSG-PROMO.JS
 * Posts Thunder Bay Tuesday session promotions to social media
 * 
 * Features:
 * - Rotates through 48 prepared promotional posts
 * - Posts to Mastodon, Bluesky, Discord
 * - Tracks state to avoid repetition
 * - Monday posts: "Tomorrow's session!"
 * - Thursday posts: "This coming Tuesday!"
 * 
 * Runs twice weekly via GitHub Actions
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Post templates organized by day and platform
const POSTS = {
  // Full TBDIWSG promotional content
  weekly_monday: [
    // Week 1
    {
      mastodon: `🤝 Tomorrow 10am EST: Thunder Bay & District Injured Workers Tuesday Session!

Connect with other injured workers navigating WSIB, CPP-D, ODSP. Share experiences in a safe, supportive space. Learn about advocacy tools. Get answers to your questions.

📧 Email tbiwsg@gmail.com for Zoom link
🏠 https://thunderbayinjuredworkers.com/tuesday/events/

Everyone welcome: injured workers, disabled people, allies. Virtual event with live captions.

#InjuredWorkers #ThunderBay #DisabilityRights #PeerSupport`,
      bluesky: `Tomorrow 10am EST: TBDIWSG Tuesday session! 

Safe space for injured workers to connect, share, get support navigating systems.

Email tbiwsg@gmail.com for Zoom link.

Every Tuesday through June!

#InjuredWorkers #ThunderBay`,
      discord: `**📅 Tomorrow 10am EST: Thunder Bay Tuesday Session**

Weekly support group for injured workers & disabled people!

**What**: Peer support, advocacy tools, Q&A
**Who**: Injured workers, allies welcome
**Join**: Email tbiwsg@gmail.com for Zoom link

🏠 More info: https://thunderbayinjuredworkers.com/tuesday/events/`
    },
    // Week 2
    {
      mastodon: `💪 Tomorrow 10am EST: Join the TBDIWSG Tuesday morning session!

Whether you're new to the group or a regular, your voice matters. Share your wins, challenges, questions about WSIB, CPP-D, ODSP, or workplace accommodations.

📧 tbiwsg@gmail.com for Zoom link
🗓️ Every Tuesday 10am-12pm EST

Accessible virtual event with captions.

#WorkersRights #ThunderBay #CommunitySupport`,
      bluesky: `💪 Tomorrow 10am: TB Injured Workers Tuesday meetup!

Share your story, get support, ask questions about benefits & rights.

Email tbiwsg@gmail.com for link.

#ThunderBay #InjuredWorkers`,
      discord: `**💪 Tomorrow 10am EST: Tuesday Session**

Your experiences matter. Join other injured workers for support, info sharing, and advocacy.

Email tbiwsg@gmail.com for Zoom link.

Everyone welcome! 🤝`
    },
    // Week 3
    {
      mastodon: `📍 Tomorrow 10am EST: Thunder Bay Injured Workers Tuesday Session

Safe space to discuss navigating systems, advocating for yourself, connecting with peers who understand. No judgment, just support.

This week: Bring your questions about workplace rights, disability benefits, or just come to listen.

📧 tbiwsg@gmail.com for Zoom
🌐 https://thunderbayinjuredworkers.com/tuesday/events/

#DisabilityJustice #ThunderBay`,
      bluesky: `📍 Tomorrow 10am: Weekly TB Injured Workers meetup!

Questions about rights? Need support? Want to connect?

Email tbiwsg@gmail.com for Zoom link.

#ThunderBay #WorkersRights`,
      discord: `**📍 Tomorrow 10am EST: Tuesday Support Session**

Bring your questions, share your experiences, connect with peers.

Email tbiwsg@gmail.com for Zoom link.

Every Tuesday through June! 🗓️`
    },
    // Week 4
    {
      mastodon: `🌟 Tomorrow 10am EST: Thunder Bay Tuesday Session for Injured Workers

Connect with others navigating similar challenges. Get practical advocacy tips. Share resources. Ask questions in a supportive environment.

New members always welcome! No preparation needed, just show up.

📧 tbiwsg@gmail.com for Zoom
🏠 Info: https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #InjuredWorkers #PeerSupport`,
      bluesky: `🌟 Tomorrow 10am: TB Injured Workers Tuesday!

No prep needed. Just show up, connect, share, learn.

Email tbiwsg@gmail.com for Zoom.

New members welcome! 🤝

#ThunderBay`,
      discord: `**🌟 Tomorrow 10am EST: Tuesday Session**

New? No problem! Jump in anytime.

Regular? Your voice helps newcomers feel welcome.

Email tbiwsg@gmail.com for Zoom link.`
    },
    // Week 5
    {
      mastodon: `🗣️ Tomorrow 10am EST: Your voice, your experience, your community - Thunder Bay Tuesday Session

Every injured worker has knowledge to share. Whether you're fighting WSIB, navigating CPP-D/ODSP, or supporting someone else - you belong here.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday 10-12pm EST

Virtual, accessible, supportive.

#InjuredWorkers #ThunderBay #Solidarity`,
      bluesky: `🗣️ Tomorrow 10am: Your experience matters!

TB Injured Workers Tuesday session - come share, learn, connect.

Email tbiwsg@gmail.com

#ThunderBay #WorkersRights`,
      discord: `**🗣️ Tomorrow 10am EST: Tuesday Peer Support**

Your story can help someone else. Your questions lead to answers for all.

Email tbiwsg@gmail.com for Zoom link.`
    },
    // Week 6
    {
      mastodon: `🔄 Tomorrow 10am EST: Thunder Bay Tuesday - Because you don't have to do this alone

Navigating injury claims, disability benefits, and workplace accommodation is overwhelming. Join other injured workers who get it.

📧 tbiwsg@gmail.com for Zoom link
🌐 https://thunderbayinjuredworkers.com/tuesday/events/

Weekly sessions through June 2026.

#DisabilityRights #ThunderBay #MutualAid`,
      bluesky: `🔄 Tomorrow 10am: You're not alone!

TB Injured Workers Tuesday - support, info, connection.

Email tbiwsg@gmail.com

Every Tuesday! 🗓️

#ThunderBay`,
      discord: `**🔄 Tomorrow 10am EST: Tuesday Together**

You don't have to navigate this alone.

Join: tbiwsg@gmail.com for Zoom link.`
    },
    // Week 7
    {
      mastodon: `📚 Tomorrow 10am EST: Thunder Bay Tuesday - Learn from lived experience

This week's discussion: sharing strategies that worked (and what didn't) for navigating WSIB, CPP-D, ODSP. Bring your questions, tips, and stories.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday 10am-12pm EST

Accessible virtual event.

#InjuredWorkers #ThunderBay #LearningTogether`,
      bluesky: `📚 Tomorrow 10am: Share what worked!

TB Tuesday session - strategies for navigating systems.

Email tbiwsg@gmail.com for link.

#ThunderBay #WorkersRights`,
      discord: `**📚 Tomorrow 10am EST: Strategy Sharing**

What worked for you? What didn't? Let's learn together.

Email tbiwsg@gmail.com for Zoom.`
    },
    // Week 8
    {
      mastodon: `🌈 Tomorrow 10am EST: Thunder Bay Tuesday - All experiences welcome

Newly injured? Long-term claim? Supporting a loved one? Curious ally? There's room for everyone at our table.

Come with questions or just to listen. Your presence helps build our community.

📧 tbiwsg@gmail.com for Zoom
🏠 https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #InclusiveCommunity`,
      bluesky: `🌈 Tomorrow 10am: All welcome!

New to this? Long-timer? Ally? Join us.

TB Tuesday: tbiwsg@gmail.com

#ThunderBay #Community`,
      discord: `**🌈 Tomorrow 10am EST: Everyone Welcome**

Wherever you are in your journey, there's space for you.

Email tbiwsg@gmail.com for Zoom link.`
    },
    // Week 9
    {
      mastodon: `⚖️ Tomorrow 10am EST: Thunder Bay Tuesday - Know your rights, share your power

Injured workers have rights - even when systems make you feel powerless. This group helps you understand those rights & use them effectively.

Join for peer support, practical advocacy, real talk.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday through June

#WorkersRights #ThunderBay #Advocacy`,
      bluesky: `⚖️ Tomorrow 10am: Know your rights!

TB Tuesday - practical advocacy & peer support.

Email tbiwsg@gmail.com

#ThunderBay #WorkersRights`,
      discord: `**⚖️ Tomorrow 10am EST: Rights & Advocacy**

Understanding your rights is the first step to using them.

Join: tbiwsg@gmail.com`
    },
    // Week 10
    {
      mastodon: `💬 Tomorrow 10am EST: Thunder Bay Tuesday - The conversation you've been needing

Tired of explaining your situation to people who don't get it? Join injured workers who understand without explanation.

Safe space for real talk about WSIB, benefits, workplace rights, and life after injury.

📧 tbiwsg@gmail.com for Zoom
🌐 Info: https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #PeerSupport`,
      bluesky: `💬 Tomorrow 10am: Talk to people who GET IT.

TB Tuesday - no explaining needed.

Email tbiwsg@gmail.com for link.

#ThunderBay`,
      discord: `**💬 Tomorrow 10am EST: Real Talk Tuesday**

Connect with people who just... understand.

Email tbiwsg@gmail.com for Zoom.`
    },
    // Week 11
    {
      mastodon: `🛡️ Tomorrow 10am EST: Thunder Bay Tuesday - Building collective strength

One voice can be ignored. But a community of injured workers supporting each other? That's power.

Join the Tuesday morning sessions to connect, share resources, learn advocacy strategies.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday 10-12pm EST

#ThunderBay #CollectivePower #InjuredWorkers`,
      bluesky: `🛡️ Tomorrow 10am: Stronger together!

TB Tuesday - build community, share power.

Email tbiwsg@gmail.com

#ThunderBay #Solidarity`,
      discord: `**🛡️ Tomorrow 10am EST: Collective Strength**

Together we're stronger. Join the community.

Email: tbiwsg@gmail.com`
    },
    // Week 12
    {
      mastodon: `🎯 Tomorrow 10am EST: Thunder Bay Tuesday - Practical help, peer support, real results

Not just talk - actionable strategies for navigating disability systems. Learn from others' successes and mistakes. Get specific questions answered.

Every Tuesday morning through June 2026.

📧 tbiwsg@gmail.com for Zoom link
🏠 https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #DisabilityRights`,
      bluesky: `🎯 Tomorrow 10am: Practical strategies!

TB Tuesday - real help for real challenges.

Email tbiwsg@gmail.com for Zoom.

#ThunderBay`,
      discord: `**🎯 Tomorrow 10am EST: Practical Tuesday**

Actionable help, real strategies, peer support.

Join: tbiwsg@gmail.com`
    },
    // Week 13
    {
      mastodon: `🌱 Tomorrow 10am EST: Thunder Bay Tuesday - Your journey, your community

Whether you're just starting to navigate injury systems or you've been at this for years, your experience matters here.

Join other injured workers for support, information sharing, and solidarity.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday 10am-12pm EST through June

#InjuredWorkers #ThunderBay #Community`,
      bluesky: `🌱 Tomorrow 10am: Your journey matters!

TB Tuesday - all stages welcome.

Email tbiwsg@gmail.com for link.

#ThunderBay #InjuredWorkers`,
      discord: `**🌱 Tomorrow 10am EST: Tuesday Community**

Your journey, our support, collective wisdom.

Email tbiwsg@gmail.com for Zoom.`
    }
  ],

  // Thursday "This coming Tuesday" reminders
  weekly_thursday: [
    // Week 1
    {
      mastodon: `🗓️ Reminder: This coming Tuesday 10am EST - Thunder Bay Injured Workers Support Session

Mark your calendar! Join us in 5 days for community support, advocacy tips, and connection with other injured workers.

📧 Email tbiwsg@gmail.com for Zoom link
🏠 https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #InjuredWorkers #CommunitySupport`,
      bluesky: `🗓️ This Tuesday 10am EST!

TB Injured Workers session in 5 days.

Email tbiwsg@gmail.com for Zoom link.

#ThunderBay`,
      discord: `**🗓️ Save the Date: This Tuesday 10am EST**

Thunder Bay Injured Workers Support Session coming up!

Email tbiwsg@gmail.com for Zoom link.`
    },
    // Week 2
    {
      mastodon: `📅 This coming Tuesday 10am EST - Join Thunder Bay's injured worker community

5 days away! Whether you're dealing with WSIB, CPP-D/ODSP, or workplace accommodation challenges - you belong here.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday through June 2026

#ThunderBay #WorkersRights`,
      bluesky: `📅 This Tuesday: TB injured workers meetup!

Email tbiwsg@gmail.com for link.

5 days to go! 🗓️

#ThunderBay`,
      discord: `**📅 Coming Up: Tuesday 10am EST**

TB Injured Workers session - mark your calendar!

Email: tbiwsg@gmail.com`
    },
    // Week 3
    {
      mastodon: `🔔 Mark your calendar: This Tuesday 10am EST - TBDIWSG Support Session

In just 5 days! Connect with injured workers, share experiences, get practical advocacy tips.

New members always welcome. Virtual event with live captions.

📧 tbiwsg@gmail.com for Zoom link
🌐 Full calendar: https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #DisabilityJustice`,
      bluesky: `🔔 This Tuesday 10am: Don't miss it!

TB Injured Workers support session.

Email tbiwsg@gmail.com

#ThunderBay #WorkersRights`,
      discord: `**🔔 This Tuesday 10am EST: Support Session**

5 days away! Get the Zoom link: tbiwsg@gmail.com`
    },
    // Week 4
    {
      mastodon: `⏰ Coming up this Tuesday 10am EST - Thunder Bay Injured Workers Session

5 days until our next meetup! Bring your questions, experiences, and support for others navigating injury/disability systems.

First time? Perfect! We'll help you get oriented.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday 10-12pm EST

#InjuredWorkers #ThunderBay`,
      bluesky: `⏰ This Tuesday 10am EST!

First time or regular - all welcome.

Email tbiwsg@gmail.com for link.

#ThunderBay`,
      discord: `**⏰ This Tuesday: Peer Support 10am EST**

New or returning - join us! tbiwsg@gmail.com`
    },
    // Week 5
    {
      mastodon: `📍 This coming Tuesday 10am EST - Your voice needed at Thunder Bay session

5 days out! Every injured worker's experience helps the community. Whether you speak or just listen, your presence matters.

Email for Zoom link: tbiwsg@gmail.com
Info: https://thunderbayinjuredworkers.com/tuesday/events/

Accessible virtual event. 

#ThunderBay #PeerSupport #InjuredWorkers`,
      bluesky: `📍 This Tuesday 10am: Your presence matters!

TB Injured Workers session.

tbiwsg@gmail.com for link.

#ThunderBay`,
      discord: `**📍 This Tuesday 10am EST**

Your voice helps. Your presence counts.

Join: tbiwsg@gmail.com`
    },
    // Week 6
    {
      mastodon: `🌟 Save Tuesday morning! 10am EST Thunder Bay Injured Workers Support

In 5 days: Connect with peers, share strategies, get questions answered about WSIB, disability benefits, workplace rights.

You don't have to navigate this alone.

📧 tbiwsg@gmail.com for Zoom
🗓️ Weekly sessions through June

#ThunderBay #MutualAid`,
      bluesky: `🌟 This Tuesday 10am: Not alone!

TB support session - strategies & solidarity.

Email tbiwsg@gmail.com

#ThunderBay`,
      discord: `**🌟 This Tuesday 10am EST**

Navigate together, not alone.

Email tbiwsg@gmail.com for link.`
    },
    // Week 7
    {
      mastodon: `💭 This Tuesday 10am EST - Thunder Bay injured workers gathering

5 days away! Space for questions, answers, experiences, support. Bring what you need, share what you can.

First-timers and regulars both welcome.

📧 tbiwsg@gmail.com for Zoom link
🏠 https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #Community`,
      bluesky: `💭 This Tuesday 10am: Q&A + Support

TB Injured Workers session.

Email tbiwsg@gmail.com for link.

#ThunderBay`,
      discord: `**💭 This Tuesday 10am EST**

Questions welcome. Support provided.

tbiwsg@gmail.com`
    },
    // Week 8
    {
      mastodon: `🤝 This coming Tuesday 10am EST - Join Thunder Bay's injured worker community

5 days out! Whether you're new to injury navigation or experienced in advocacy, your perspective enriches our group.

Virtual meetup with captions. All welcome.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday through June 2026

#ThunderBay #InjuredWorkers`,
      bluesky: `🤝 This Tuesday 10am: All perspectives welcome!

Email tbiwsg@gmail.com for Zoom.

#ThunderBay #WorkersRights`,
      discord: `**🤝 This Tuesday 10am EST**

New or experienced - all perspectives valued.

tbiwsg@gmail.com`
    },
    // Week 9
    {
      mastodon: `⚡ This Tuesday 10am EST - Thunder Bay Injured Workers Power Hour

In 5 days! Learn advocacy strategies, share what worked, connect with people who understand.

Come with questions or just to listen. Both are valuable.

📧 tbiwsg@gmail.com for Zoom link
🌐 Info: https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #Advocacy`,
      bluesky: `⚡ This Tuesday 10am: Power Hour!

Learn, share, connect.

Email tbiwsg@gmail.com

#ThunderBay`,
      discord: `**⚡ This Tuesday 10am EST: Power Hour**

Advocacy strategies + peer support.

tbiwsg@gmail.com`
    },
    // Week 10
    {
      mastodon: `🎯 This coming Tuesday 10am EST - Real talk for injured workers

5 days until Thunder Bay's weekly peer support session. Bring your challenges, victories, questions, or just yourself.

Safe space for honest conversation.

📧 tbiwsg@gmail.com for Zoom
🗓️ Every Tuesday 10-12pm EST

#ThunderBay #PeerSupport`,
      bluesky: `🎯 This Tuesday 10am: Real talk!

Safe space, real challenges, peer support.

tbiwsg@gmail.com

#ThunderBay`,
      discord: `**🎯 This Tuesday 10am EST: Real Talk**

Honest space for real challenges.

tbiwsg@gmail.com`
    },
    // Week 11
    {
      mastodon: `🛠️ This Tuesday 10am EST - Thunder Bay injury navigation toolkit

In 5 days! Learn practical strategies from experienced injured workers. Share your own tips. Build your advocacy toolkit.

First time joining? We'll help you get started.

📧 tbiwsg@gmail.com for Zoom link
🏠 https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #DisabilityRights`,
      bluesky: `🛠️ This Tuesday 10am: Build your toolkit!

Practical strategies from peers.

Email tbiwsg@gmail.com

#ThunderBay`,
      discord: `**🛠️ This Tuesday 10am EST: Toolkit Building**

Learn strategies that work.

tbiwsg@gmail.com`
    },
    // Week 12
    {
      mastodon: `💪 This coming Tuesday 10am EST - Collective strength for injured workers

5 days out! TB session focuses on mutual support, shared knowledge, community power.

Your experience helps others. Others' experience helps you.

📧 tbiwsg@gmail.com for Zoom
🗓️ Weekly through June 2026

#ThunderBay #Solidarity`,
      bluesky: `💪 This Tuesday 10am: Stronger together!

Collective wisdom + mutual support.

tbiwsg@gmail.com

#ThunderBay`,
      discord: `**💪 This Tuesday 10am EST: Collective Strength**

Together we're powerful.

tbiwsg@gmail.com`
    },
    // Week 13
    {
      mastodon: `🌱 This Tuesday 10am EST - Thunder Bay injured workers growing together

In 5 days! Join our community for support, education, advocacy, and connection.

Whether you're just starting or years into this journey - you belong here.

📧 tbiwsg@gmail.com for Zoom link
🌐 https://thunderbayinjuredworkers.com/tuesday/events/

#ThunderBay #InjuredWorkers #Community`,
      bluesky: `🌱 This Tuesday 10am: Growing together!

All stages of the journey welcome.

Email tbiwsg@gmail.com

#ThunderBay`,
      discord: `**🌱 This Tuesday 10am EST: Community Building**

Your journey, our support.

tbiwsg@gmail.com`
    }
  ]
};

class TBDIWSGPoster {
  constructor() {
    this.statePath = path.join(process.cwd(), 'public', 'tbdiwsg-promo-state.json');
    this.testMode = process.env.TEST_MODE === 'true';
    
    this.config = {
      mastodon: {
        enabled: !!process.env.MASTO_TOKEN,
        instance: process.env.MASTO_INSTANCE || 'https://mastodon.social',
        token: process.env.MASTO_TOKEN || '',
      },
      bluesky: {
        enabled: !!process.env.BLUESKY_HANDLE && !!process.env.BLUESKY_PASSWORD,
        handle: process.env.BLUESKY_HANDLE || '',
        password: process.env.BLUESKY_PASSWORD || '',
        pds: process.env.BLUESKY_PDS || 'https://bsky.social',
      },
      discord: {
        enabled: !!process.env.DISCORD_WEBHOOK_URL,
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
      }
    };

    this.results = {
      mastodon: { success: false, message: '' },
      bluesky: { success: false, message: '' },
      discord: { success: false, message: '' }
    };
  }

  /**
   * Load or initialize state
   */
  loadState() {
    if (fs.existsSync(this.statePath)) {
      return JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
    }
    
    // Initialize state
    return {
      monday_index: 0,
      thursday_index: 0,
      last_monday_post: null,
      last_thursday_post: null,
      total_posts: 0
    };
  }

  /**
   * Save state
   */
  saveState(state) {
    const dir = path.dirname(this.statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Get today's posts
   */
  getTodaysPosts() {
    const state = this.loadState();
    const dayOfWeek = new Date().getDay();
    
    // Monday = 1, Thursday = 4
    let posts, postType, currentIndex;
    
    if (dayOfWeek === 1) {
      // Monday
      postType = 'monday';
      currentIndex = state.monday_index;
      posts = POSTS.weekly_monday[currentIndex % POSTS.weekly_monday.length];
      state.monday_index = (currentIndex + 1) % POSTS.weekly_monday.length;
      state.last_monday_post = new Date().toISOString();
    } else if (dayOfWeek === 4) {
      // Thursday
      postType = 'thursday';
      currentIndex = state.thursday_index;
      posts = POSTS.weekly_thursday[currentIndex % POSTS.weekly_thursday.length];
      state.thursday_index = (currentIndex + 1) % POSTS.weekly_thursday.length;
      state.last_thursday_post = new Date().toISOString();
    } else {
      // Manual run on other day - use Monday posts
      console.log('⚠️  Not Monday or Thursday - using Monday posts');
      postType = 'monday';
      currentIndex = state.monday_index;
      posts = POSTS.weekly_monday[currentIndex % POSTS.weekly_monday.length];
    }
    
    state.total_posts++;
    this.saveState(state);
    
    return { posts, postType, index: currentIndex };
  }

  /**
   * Make HTTPS request
   */
  async httpsRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body), headers: res.headers });
          } catch {
            resolve({ statusCode: res.statusCode, body, headers: res.headers });
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Post to Mastodon
   */
  async postToMastodon(content) {
    if (!this.config.mastodon.enabled) {
      return { success: false, message: 'Mastodon not configured' };
    }

    if (this.testMode) {
      console.log('\n📝 [TEST MODE] Would post to Mastodon:');
      console.log(content);
      return { success: true, message: 'Test mode - no actual post' };
    }

    try {
      console.log('📤 Posting to Mastodon...');

      const instance = this.config.mastodon.instance.replace(/^https?:\/\//, '');
      const url = new URL(`https://${instance}/api/v1/statuses`);

      const options = {
        method: 'POST',
        hostname: url.hostname,
        path: url.pathname,
        headers: {
          'Authorization': `Bearer ${this.config.mastodon.token}`,
          'Content-Type': 'application/json'
        }
      };

      const body = {
        status: content,
        visibility: 'public'
      };

      const response = await this.httpsRequest(options, body);

      if (response.statusCode === 200 || response.statusCode === 201) {
        console.log('✅ Posted to Mastodon');
        return { success: true, message: 'Posted successfully' };
      } else {
        console.error('❌ Mastodon error:', response.statusCode, response.body);
        return { success: false, message: `HTTP ${response.statusCode}` };
      }
    } catch (error) {
      console.error('❌ Mastodon error:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Post to Bluesky
   */
  async postToBluesky(content) {
    if (!this.config.bluesky.enabled) {
      return { success: false, message: 'Bluesky not configured' };
    }

    if (this.testMode) {
      console.log('\n📝 [TEST MODE] Would post to Bluesky:');
      console.log(content);
      return { success: true, message: 'Test mode - no actual post' };
    }

    try {
      console.log('📤 Posting to Bluesky...');

      const pdsUrl = new URL(this.config.bluesky.pds);

      // 1. Create session
      const loginOptions = {
        method: 'POST',
        hostname: pdsUrl.hostname,
        path: '/xrpc/com.atproto.server.createSession',
        headers: { 'Content-Type': 'application/json' }
      };

      const loginBody = {
        identifier: this.config.bluesky.handle,
        password: this.config.bluesky.password
      };

      const loginResponse = await this.httpsRequest(loginOptions, loginBody);

      if (loginResponse.statusCode !== 200) {
        throw new Error(`Login failed: ${loginResponse.statusCode}`);
      }

      const { accessJwt, did } = loginResponse.body;

      // 2. Create post
      const postOptions = {
        method: 'POST',
        hostname: pdsUrl.hostname,
        path: '/xrpc/com.atproto.repo.createRecord',
        headers: {
          'Authorization': `Bearer ${accessJwt}`,
          'Content-Type': 'application/json'
        }
      };

      const postBody = {
        repo: did,
        collection: 'app.bsky.feed.post',
        record: {
          text: content,
          createdAt: new Date().toISOString(),
          $type: 'app.bsky.feed.post'
        }
      };

      const postResponse = await this.httpsRequest(postOptions, postBody);

      if (postResponse.statusCode === 200 || postResponse.statusCode === 201) {
        console.log('✅ Posted to Bluesky');
        return { success: true, message: 'Posted successfully' };
      } else {
        console.error('❌ Bluesky post error:', postResponse.statusCode);
        return { success: false, message: `HTTP ${postResponse.statusCode}` };
      }
    } catch (error) {
      console.error('❌ Bluesky error:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Post to Discord
   */
  async postToDiscord(content) {
    if (!this.config.discord.enabled) {
      return { success: false, message: 'Discord not configured' };
    }

    if (this.testMode) {
      console.log('\n📝 [TEST MODE] Would post to Discord:');
      console.log(content);
      return { success: true, message: 'Test mode - no actual post' };
    }

    try {
      console.log('📤 Posting to Discord...');

      const webhookUrl = new URL(this.config.discord.webhookUrl);

      const options = {
        method: 'POST',
        hostname: webhookUrl.hostname,
        path: webhookUrl.pathname + webhookUrl.search,
        headers: { 'Content-Type': 'application/json' }
      };

      const body = {
        content: content,
        username: '3mpwrApp Events',
        avatar_url: 'https://3mpwrapp.pages.dev/assets/empwrapp-logo.png'
      };

      const response = await this.httpsRequest(options, body);

      if (response.statusCode === 204 || response.statusCode === 200) {
        console.log('✅ Posted to Discord');
        return { success: true, message: 'Posted successfully' };
      } else {
        console.error('❌ Discord error:', response.statusCode);
        return { success: false, message: `HTTP ${response.statusCode}` };
      }
    } catch (error) {
      console.error('❌ Discord error:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Main posting logic
   */
  async run() {
    console.log('🚀 TBDIWSG Tuesday Promotion Poster');
    console.log('═'.repeat(60));
    
    if (this.testMode) {
      console.log('⚠️  TEST MODE - No actual posts will be made\n');
    }

    // Get today's posts
    const { posts, postType, index } = this.getTodaysPosts();
    console.log(`\n📅 Post Type: ${postType.toUpperCase()}`);
    console.log(`📊 Rotation Index: ${index + 1} of 13\n`);

    // Post to each platform
    this.results.mastodon = await this.postToMastodon(posts.mastodon);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit buffer

    this.results.bluesky = await this.postToBluesky(posts.bluesky);
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.results.discord = await this.postToDiscord(posts.discord);

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 POSTING SUMMARY');
    console.log('═'.repeat(60));
    
    const successful = Object.values(this.results).filter(r => r.success).length;
    const total = Object.keys(this.results).length;
    
    console.log(`✅ Successful: ${successful}/${total}`);
    console.log(`\nMastodon: ${this.results.mastodon.success ? '✅' : '❌'} ${this.results.mastodon.message}`);
    console.log(`Bluesky:  ${this.results.bluesky.success ? '✅' : '❌'} ${this.results.bluesky.message}`);
    console.log(`Discord:  ${this.results.discord.success ? '✅' : '❌'} ${this.results.discord.message}`);

    if (successful === 0) {
      process.exit(1);
    }
  }
}

// Run
const poster = new TBDIWSGPoster();
poster.run().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
