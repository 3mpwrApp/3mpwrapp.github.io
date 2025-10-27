# X (Twitter) Developer Account Sign-Up Guide

## Use Cases for 3mpwr App

When signing up for an X Developer Account, you'll need to describe your use cases. Here are the recommended answers for 3mpwr App:

---

## ✅ Primary Use Cases to List

### 1. **Community Engagement & Support**
**What to say:**
> "We're building a platform for injured workers and persons with disabilities across Canada. We use the X API to share important updates, resources, and community news with our audience. This helps us connect people to disability rights information, government benefits updates, and peer support."

**Why it works:**
- Clear nonprofit/community mission
- Explains how you're using the API
- Shows benefit to users

### 2. **Content Distribution & Advocacy**
**What to say:**
> "We distribute curated daily content from disability rights organizations, government agencies, and worker compensation boards across Canada. Through X, we amplify important announcements about benefits, legal rights, workplace accommodations, and accessibility initiatives to reach and support our community."

**Why it works:**
- Specific use of API (posting content)
- Shows curation/aggregation purpose
- Mentions target audience

### 3. **Real-Time Updates & Alerts**
**What to say:**
> "We provide timely updates about disability benefits (CPP-D, ODSP, AISH, provincial programs), workers' compensation changes, legal decisions, and advocacy opportunities. X helps us reach people who need urgent information about deadline changes, policy updates, and new resources available to them."

**Why it works:**
- Specific to your domain
- Shows urgent/important content
- Demonstrates user value

---

## 📋 X Developer Account Sign-Up Form

When you see these fields, here's what to fill in:

### **Account Type**
☑️ **Select: "Academic, nonprofit, or government"** (if you're registered nonprofit)  
OR  
☑️ **Select: "Business"** (if you're a startup/social enterprise)

### **Organization Name**
```
3mpwr App
```

### **Organization Website**
```
https://3mpwrapp.ca
or
https://3mpwrapp.com
(whatever your main domain is)
```

### **Use Case Category**
☑️ **Select: "Content creation and curation"**  
(OR "Community engagement" if available)

### **Use Case Description** (This is the main field)
**Copy one of these or combine them:**

**Option A (Simple - Recommended for first-time):**
> "3mpwr App is a community platform serving injured workers and persons with disabilities across Canada. We use the X API to share daily curated content about disability benefits, workers' rights, legal updates, and community news. This helps our audience stay informed about important resources and changes that affect their lives."

**Option B (Detailed):**
> "We operate a community-driven platform that aggregates and shares critical information for injured workers and persons with disabilities. Our use of the X API includes:

> 1. **Daily Resource Sharing** - Posting curated highlights from government agencies, disability rights organizations, and worker compensation boards
> 2. **Real-Time Updates** - Sharing urgent announcements about benefits changes, legal decisions, and policy updates
> 3. **Community Engagement** - Responding to community members and providing support

> Our audience includes people seeking information about CPP-D, ODSP, provincial disability programs, workers' compensation, accessibility rights, and workplace accommodations."

**Option C (Compliance-focused):**
> "3mpwr App operates as a nonprofit community platform. We use the X API exclusively to:
> - Post curated content from verified government and advocacy sources
> - Share community stories and resources with proper attribution
> - Distribute time-sensitive updates about disability benefits and legal changes
> - Engage with our community of injured workers and persons with disabilities

> We follow X's Automation Rules and never engage in spam, manipulation, or automated engagement."

### **Will your app use Tweet, Retweet, Like, Follow, or other action buttons?**
- [ ] Tweet/Post
- [x] Retweet (Maybe)
- [x] Like
- [x] Follow
- [x] Reply

**Explanation to provide:**
> "We post original content and share relevant content from verified sources. We engage authentically with community members through likes and replies. We follow relevant disability rights organizations and government accounts."

### **Will your app display tweets or translate them?**
☑️ **Yes** (if you're displaying content)

**Explanation:**
> "We may display tweets from government sources and advocacy organizations as part of our content curation."

### **Will your app use geolocation?**
☑️ **Maybe/Yes**

**Explanation:**
> "We target Canadian content by province/region since our community is Canada-specific."

### **Will you be authenticating users?**
☑️ **No** (if you're just posting from your account)

### **Tell us how you'll comply with X's Automation Rules**

> "We comply with X's Automation Rules by:
> 1. **No manipulation** - We never artificially inflate engagement or use bots
> 2. **No spam** - We post authentic content with proper attribution
> 3. **Proper timing** - We post daily but not excessively; we respect rate limits
> 4. **No unauthorized collection** - We only collect data that X's terms permit
> 5. **Community respect** - We engage authentically and remove spam/abuse from our content
> 6. **Transparency** - We clearly identify our organization and content sources"

---

## 🎯 Red Flags to Avoid

❌ **DON'T say:**
- "We want to grow followers quickly"
- "We're building a bot network"
- "We want to monitor/scrape tweets"
- "We're selling data"
- "We want to automate engagement"
- "We're making a Twitter clone"

✅ **DO say:**
- "We're sharing important community information"
- "We help people find resources"
- "We engage authentically with our community"
- "We post original and curated content"
- "We follow X's guidelines"

---

## 📝 Before You Submit

**Have ready:**
- ✅ Your organization name (3mpwr App)
- ✅ Your website URL
- ✅ Your app name/description
- ✅ A clear explanation of how you'll use X API
- ✅ Confirmation you'll follow X's Automation Rules
- ✅ Your phone number (for verification)
- ✅ Your country (Canada)

**Don't:**
- ❌ Copy/paste generic responses
- ❌ Submit vague descriptions
- ❌ Hide your real purpose
- ❌ Rush through the form

---

## After Approval

Once approved, you'll get:
- **API Keys** (keep secure!)
- **API Tokens** (rotate regularly)
- **Rate Limits** (depends on tier)
- **Access Level** (Read/Write)

---

## Rate Limits to Expect

**Free Tier (Standard):**
- 300 tweets per 15-minute window
- 1,500 tweets per 24 hours
- Read access to recent tweets

**Elevated/Academic Tier:**
- Higher limits if you qualify
- Better support

For 3mpwr App's daily curation (1-2 posts per day), the free tier is plenty.

---

## Questions X Might Ask

**Q: What's your business model?**
> "We're a community platform. We don't monetize through X; we provide free resources to our community."

**Q: How many users do you have?**
> "We serve injured workers and persons with disabilities across Canada (100-1,000+ users depending on your stage)"

**Q: Why do you need API access vs. using the web interface?**
> "We automate daily content curation and posting to ensure consistent, timely updates to our community. This is more reliable than manual posting."

**Q: What data will you collect?**
> "We collect publicly available tweets from government and advocacy sources. We do not collect user data or monitor individual accounts."

---

## Security Tips

🔒 **After you get API keys:**
1. **Never share them publicly** (add to .gitignore)
2. **Use environment variables** (not hardcoded)
3. **Rotate keys quarterly**
4. **Revoke immediately if compromised**
5. **Use separate keys for dev/prod**
6. **Store in GitHub Secrets** (not in code)

Example .env (don't commit!):
```
X_API_KEY=your_key_here
X_API_SECRET=your_secret_here
X_BEARER_TOKEN=your_token_here
X_ACCESS_TOKEN=your_token_here
X_ACCESS_SECRET=your_token_here
```

---

## Useful Resources

- **X Developer Portal:** https://developer.twitter.com/
- **X API Documentation:** https://developer.twitter.com/en/docs/api
- **Automation Rules:** https://help.twitter.com/en/rules-and-policies/twitter-automation
- **Rate Limits:** https://developer.twitter.com/en/docs/projects/overview#rate-limits

---

## Need Help?

If X rejects your application:
1. **Read the rejection reason carefully**
2. **Clarify your use case** (they often want more detail)
3. **Reapply with more specific information**
4. **Appeal if you think it's a mistake**

Most rejections are due to vague descriptions, not bad intentions. Be specific and clear!

---

**Good luck! 🚀**
