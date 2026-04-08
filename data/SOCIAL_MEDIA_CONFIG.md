# Social Media Configuration - Official Links & Contact

**Updated:** April 8, 2026  
**Purpose:** Authoritative reference for all social media automation, blog posts, and communications

---

## 📧 Official Contact Email

**ONLY use this email:**
- `empowrapp08162025@gmail.com`

**❌ DO NOT USE these (old/fake emails):**
- ~~contact@3mpwrapp.com~~
- ~~feedback@3mpwrapp.com~~
- ~~thunderbay@3mpwrapp.com~~

---

## 🌐 Official Social Media Links

### Active Platforms (In Priority Order)

1. **Discord**
   - Invite: `https://discord.gg/P2qQyjxV`
   - Use for: Community support, live chat, feedback, beta tester coordination
   - Moderation: Manual (no automation)
   - Primary communication channel

2. **X / Twitter**
   - Handle: `@3mpwrApp0816`
   - URL: `https://x.com/3mpwrApp0816`
   - Use for: Quick updates, news, daily features
   - Automation: `scripts/post-to-x.js`

3. **Facebook**
   - Page: `3mpowrapp`
   - URL: `https://www.facebook.com/3mpowrapp/`
   - Use for: Community engagement, Thunder Bay local groups
   - Automation: TBD (manual posting for now)

4. **Mastodon**
   - Handle: `@3mpwrapp@mastodon.social`
   - URL: `https://mastodon.social/@3mpwrapp`
   - Use for: Tech-savvy audience, transparency updates, open source community
   - Automation: `scripts/post-to-mastodon.js`

5. **Bluesky**
   - Handle: `@3mpwrapp.bsky.social`
   - URL: `https://bsky.app/profile/3mpwrapp.bsky.social`
   - Use for: Progressive audience, social justice content
   - Automation: `scripts/post-to-bluesky.js`

---

## 👤 Author Attribution

**Use this format for all content:**

```
Author: 3mpwrApp, Lissa Beaulieu
```

**❌ DO NOT USE:**
- ~~3mpwrApp Team~~
- ~~The 3mpwrApp Team~~
- ~~3mpwrApp Development Team~~

---

## 🎯 Key Messaging

### Primary Audience
**"Injured workers and persons with disabilities"**

**Use this phrasing consistently:**
- ✅ "Tools for injured workers and persons with disabilities"
- ✅ "Build tools for injured workers and persons with disabilities"
- ❌ "Tools for injured workers" (not inclusive enough)

### Hashtags (Use Consistently)

**Primary:**
- `#DataDrivenJustice`
- `#InjuredWorkers`
- `#DisabilityRights`
- `#AccessToJustice`
- `#ThunderBay`
- `#OpenData`

**Secondary (when relevant):**
- `#WSIB`
- `#OpenSource`
- `#CivicTech`
- `#SocialImpact`
- `#TransparentDevelopment`

---

## 📱 Platform-Specific Best Practices

### X / Twitter (@3mpwrApp0816)
- **Frequency:** 3-5 times/day
- **Character limit:** 280
- **Best times:** 9 AM, 1 PM, 6 PM ET
- **Format:** Short, punchy, include image/link
- **Automation:** Daily via GitHub Actions

### Facebook (3mpowrapp)
- **Frequency:** 1-2 times/day
- **Best times:** 12 PM, 7 PM ET (when Thunder Bay users active)
- **Format:** Longer posts (500-800 words), community focus
- **Groups:** Tag Thunder Bay community groups
- **Automation:** TO DO - Add to automation scripts

### Discord (P2qQyjxV)
- **Purpose:** Real-time community support
- **Channels needed:**
  - #general
  - #thunder-bay-pilot
  - #wsib-appeals
  - #tech-support
  - #feedback
- **Moderation:** Manual (Lissa + volunteers)
- **No automation:** Human-first community space

### Mastodon (@3mpwrapp@mastodon.social)
- **Frequency:** 2-3 times/day
- **Character limit:** 500
- **Audience:** Tech-savvy, privacy-focused, open source advocates
- **Format:** Detailed threads (6-10 posts), transparency updates
- **Automation:** Weekly updates via GitHub Actions

### Bluesky (@3mpwrapp.bsky.social)
- **Frequency:** 1-2 times/day
- **Character limit:** 300
- **Audience:** Progressive, engaged, justice-focused
- **Format:** Impact stories, pattern analysis, data visualization
- **Automation:** 2-3 times/week via GitHub Actions

---

## 🔗 Link Formats for Content

### Blog Posts (Footer)

```markdown
## Contact & Feedback

**Email:** empowrapp08162025@gmail.com

**Follow our journey:**
- **Blog:** [3mpwrapp.com/blog](https://3mpwrapp.com/blog)
- **Discord:** [Join Community](https://discord.gg/P2qQyjxV)
- **X/Twitter:** [@3mpwrApp0816](https://x.com/3mpwrApp0816)
- **Facebook:** [3mpowrapp](https://www.facebook.com/3mpowrapp/)
- **Mastodon:** [@3mpwrapp@mastodon.social](https://mastodon.social/@3mpwrapp)
- **Bluesky:** [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)
```

### Social Media Posts (Signature)

```
Follow us:
• Discord: https://discord.gg/P2qQyjxV
• X: https://x.com/3mpwrApp0816
• Facebook: https://www.facebook.com/3mpowrapp/
• Mastodon: @3mpwrapp@mastodon.social
• Bluesky: @3mpwrapp.bsky.social

Email: empowrapp08162025@gmail.com
```

### Knowledge Base Articles (Footer)

```markdown
## Questions or Feedback?

**Email:** empowrapp08162025@gmail.com

**Join our community:**
- [Discord](https://discord.gg/P2qQyjxV) - Live chat & support
- [X/Twitter](https://x.com/3mpwrApp0816) - Daily updates
- [Facebook](https://www.facebook.com/3mpowrapp/) - Community groups
- [Mastodon](https://mastodon.social/@3mpwrapp) - Tech community
- [Bluesky](https://bsky.app/profile/3mpwrapp.bsky.social) - Social justice updates
- [X/Twitter](https://x.com/3mpwrApp0816) - Daily updates
- [Facebook](https://www.facebook.com/3mpowrapp/) - Community groups
```

---

## 🤖 Automation Scripts to Update

### Existing Scripts (Need Facebook support added)
1. `scripts/post-to-x.js` ✅ (Already configured)
2. `scripts/post-to-mastodon.js` ✅ (Already configured)
3. `scripts/post-to-bluesky.js` ✅ (Already configured)
4. `scripts/post-daily-feature.js` - Add Facebook posting
5. `scripts/weekly-update-generator.js` - Add Facebook posting

### New Scripts Needed
1. `scripts/post-to-facebook.js` - Facebook Graph API integration
2. `scripts/post-to-discord.js` - Webhook for announcements channel (optional)

### GitHub Actions Workflows to Update
- `.github/workflows/daily-feature.yml` - Add Facebook step
- `.github/workflows/weekly-update.yml` - Add Facebook step
- `.github/workflows/content-curator.yml` - Add Facebook step

---

## 📊 Analytics Tracking

### Email Opens/Clicks
- Track via: Gmail insights (manual)
- Alternative: Set up Mailchimp or similar (future)

### Social Media Engagement
- **X/Twitter:** Twitter Analytics
- **Facebook:** Facebook Insights
- **Discord:** Server stats (members, active users, messages)
- **Mastodon:** Instance stats (basic)
- **Bluesky:** Built-in analytics (limited)

### Key Metrics to Track
- Thunder Bay pilot signups (email)
- Knowledge base page views (Google Analytics)
- Appeal template downloads
- Discord community growth
- Social media referrals to blog/templates

---

## 🔐 Credentials Location

**GitHub Secrets (for automation):**
- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`
- `MASTODON_ACCESS_TOKEN`
- `BLUESKY_HANDLE`
- `BLUESKY_APP_PASSWORD`
- `FACEBOOK_PAGE_ACCESS_TOKEN` (TO ADD)
- `DISCORD_WEBHOOK_URL` (optional, for announcements)

**Never commit credentials to git!**

---

## ✅ Checklist: New Content Publishing

When creating new blog posts, social media campaigns, or knowledge base articles:

- [ ] Author: `3mpwrApp, Lissa Beaulieu`
- [ ] Email: `empowrapp08162025@gmail.com`
- [ ] Audience: "injured workers and persons with disabilities"
- [ ] Social links: X, Facebook, Discord, Mastodon, Bluesky (in that order)
- [ ] Hashtags: Include #DisabilityRights + #InjuredWorkers
- [ ] Test all links before publishing
- [ ] Schedule across all 5 platforms
- [ ] Monitor Discord for questions/feedback

---

## 📅 Posting Schedule Template

**Daily:**
- 9 AM ET: X/Twitter (morning update)
- 12 PM ET: Facebook (community post)
- 6 PM ET: X/Twitter (evening engagement)

**Weekly:**
- Monday 9 AM: Blog post goes live
- Monday 10 AM: Mastodon thread (transparency update)
- Wednesday 12 PM: Bluesky (data/impact story)
- Friday 6 PM: Facebook (community roundup)

**Monthly:**
- First Monday: Email newsletter
- Mid-month: Discord AMA session
- Last week: Pattern analysis update (all platforms)

---

## 🌟 Thunder Bay Pilot-Specific

**Email signature for Thunder Bay communications:**

```
Questions? empowrapp08162025@gmail.com

Join Thunder Bay Pilot:
• Discord: https://discord.gg/P2qQyjxV (#thunder-bay-pilot channel)
• Email updates: empowrapp08162025@gmail.com

3mpwrApp, Lissa Beaulieu
Building tools for injured workers and persons with disabilities
```

---

## 📝 Notes for Future Updates

**When adding new platforms:**
1. Update this file first
2. Add to automation scripts
3. Update all blog post templates
4. Update social media post templates
5. Test posting workflow
6. Document credentials needed

**If changing email:**
1. Update this file
2. Search/replace in all content files
3. Update email signature
4. Notify community via all platforms
5. Set up forwarding from old email (if applicable)

---

*Last updated: April 8, 2026*  
*Maintained by: Lissa Beaulieu*  
*Location: `data/SOCIAL_MEDIA_CONFIG.md`*
