# Community Curation Guidelines
## Invite Your Audience to Help Shape Daily News

**Status:** Framework for reader-contributed content  
**Launch:** February 2025

---

## Why Community Curation?

Currently: 3mpwr team curates 50 stories daily from 26 RSS feeds
**Problem:** You might miss stories readers care about

**Solution:** Open curation to community while maintaining quality

**Benefits:**
- Readers feel heard and included
- Discover new sources and perspectives
- Lighten team workload (crowdsourced filtering)
- Build deeper community loyalty
- Surface stories from underrepresented communities

---

## Community Contribution Methods

### Method 1: "Submit a Story" Form
**Placement:** Sidebar on blog, bottom of curation pages, footer  
**Effort to add:** Low (readers submit URL + brief explanation)

```html
<div class="submit-story-widget">
  <h3>Spotted something we missed?</h3>
  <p>Send us stories that matter to the disability community</p>
  
  <form>
    <input type="url" placeholder="Story URL" required>
    <textarea placeholder="Why should we cover this?" required></textarea>
    <select required>
      <option disabled selected>Which category?</option>
      <option>Workers Rights & Compensation</option>
      <option>Disability Benefits Navigation</option>
      <option>Accessibility & Inclusive Design</option>
      <option>Legal Victories & Rights</option>
      <option>Health & Wellness</option>
      <option>Community Action</option>
    </select>
    <button type="submit">Submit Story</button>
  </form>
</div>
```

**Workflow:**
1. Reader submits URL + category + explanation
2. Email sent to submission inbox
3. Team reviews (next curation cycle)
4. Featured story includes "Suggested by [reader name]" (if they opt in)

**Target:** 3-5 submissions per week

---

### Method 2: "Vote on Stories" System
**Placement:** Below each article in curation pages  
**Effort to add:** Minimal

```html
<div class="community-vote">
  <p>Is this story relevant?</p>
  <button data-vote="yes">👍 Yes - keep more like this</button>
  <button data-vote="no">👎 Not relevant for us</button>
  <span class="vote-tally">87 found this relevant</span>
</div>
```

**Data use:**
- Track which stories get highest community votes
- Adjust curator scoring if consensus disagrees with algorithm
- Identify blind spots in our curation

---

### Method 3: "Topic Request" System
**Placement:** Sidebar monthly widget  
**Effort to add:** Low

```html
<div class="topic-request-box">
  <h3>What should we cover more?</h3>
  <p>Vote on topics to see more coverage</p>
  
  <ul class="topic-votes">
    <li>Housing & accessibility (87 votes)</li>
    <li>Medical cannabis & disability (64 votes)</li>
    <li>Education funding (52 votes)</li>
    <li><input type="text" placeholder="Suggest a topic"></li>
  </ul>
  <button>Vote</button>
</div>
```

**Workflow:**
1. Monthly: Display top 5 requested topics
2. Team adds new RSS feeds or sources if demand is high
3. Increase keyword weights in curator.json

---

### Method 4: "Contribute Your News Source"
**For:** Readers who follow disability/accessibility news outlets  
**Pitch:** "Help us find stories we miss"

**Signup form:**
- Your favorite news source (URL)
- Why you recommend it (2-3 sentences)
- Category (which type of stories)
- Optional: Your name/profile

**Team process:**
1. Review 10 sources per month from community
2. Test RSS feed for quality & relevance
3. Add top candidates to curator.json
4. Credit reader: "Thanks to [name] for suggesting this source"

**Quality criteria:**
- Covers disability, accessibility, workers' rights, or related policy
- Updates at least weekly
- No spam or low-quality sites
- Accessible website required (baseline accessibility)

---

### Method 5: "Story Translation" Program
**For:** Bilingual/multilingual readers  
**Pitch:** Help us reach French, Spanish, Arabic, Portuguese, Chinese readers

**Contribution:**
- Submit summary of story in another language
- Or flag story for translation

**Credit:** Visible "Translated by [contributor]" or "Suggested by community"

---

## Moderation Policy

### What We Welcome
✅ News articles from credible sources  
✅ Government announcements  
✅ Research reports & data  
✅ Advocacy campaign announcements  
✅ Legal decisions  
✅ Op-eds from disability experts  
✅ Personal stories (with permission)

### What We Screen For
⚠️ Outdated news (published >2 years ago)  
⚠️ Misinformation or unsourced claims  
⚠️ Promotional content (undisclosed ads)  
⚠️ Hateful content toward any group  
⚠️ Medical advice (unless from credible health org)  
⚠️ Paywalled articles (if free version not available)

### What We Decline
❌ Spam, scams, or investment schemes  
❌ Products/services (unless newsworthy)  
❌ Duplicate submissions  
❌ Unverified personal claims  
❌ Political candidate endorsements  
❌ Anything violating our Editorial Standards (see below)

---

## Editorial Standards for Community Content

### Accuracy
- Sources must be credible (government, established news org, advocacy group, research institution)
- Claims must be verifiable
- No misinformation or disproven claims

### Relevance
- Story must directly affect disability community
- Connection to disability, accessibility, or workers' rights clear
- Helps readers navigate their lives or understand their rights

### Inclusivity
- Story respectful to disability community (no ableist framing)
- Centered on disabled people (not saviors/inspiration porn)
- Considers diversity within disability community
- Language: "persons with disabilities" or specific disabilities (not "sufferer," "victim," "confined," etc.)

### Accessibility
- Source website should be minimally accessible
- Video must have captions where possible
- Complex topics explained clearly

### Conflict of Interest
- If submitter has financial interest in story, must disclose
- If submitter works for organization mentioned, must disclose

---

## Contributor Recognition System

### Levels

**Bronze Contributor** (5-10 accepted submissions)
- "Suggested by [name]" credit on story
- Mention in monthly contributor roundup

**Silver Contributor** (11-25 accepted submissions)
- Monthly newsletter feature
- "Community Curator" badge on profile
- Direct email line to editor for priority feedback

**Gold Contributor** (26+ accepted submissions)
- Quarterly feature story: "Meet [Name], Our Community Curator"
- Invited to participate in monthly content planning call
- Co-author opportunities for evergreen guides

### Opt-In Profile
Contributors can create public profile:
- Name/username
- Bio (100 words)
- Why they contribute
- Topics they focus on
- Their story (optional)

**Privacy:** All opt-in. No tracking/exposure without consent.

---

## Implementation Roadmap

### Phase 1: Launch (February 2025)
- [ ] Add "Submit a Story" form to 3 key pages
- [ ] Set up moderation inbox & workflow
- [ ] Create Editorial Standards document (this page)
- [ ] Soft launch with existing newsletter subscribers

### Phase 2: Expand (March 2025)
- [ ] Add voting system to articles
- [ ] Launch topic request poll
- [ ] Create contributor recognition page
- [ ] Train team on moderation process

### Phase 3: Scale (April 2025)
- [ ] News source contribution program
- [ ] Promote on social media
- [ ] Monthly contributor roundup email
- [ ] Consider API for easier bulk submissions

### Phase 4: Optimize (Ongoing)
- [ ] Monthly analytics review
- [ ] Quarterly contributor survey
- [ ] Update curator.json based on community input
- [ ] Highlight top contributors in annual report

---

## How It Integrates With Curation

### Workflow
```
Monday-Friday:
1. Automated curator pulls 50 stories from RSS feeds
2. Community submissions reviewed & scored
3. High-quality community submissions mixed into daily curation
4. Final 50 stories published (mix of algorithm + community)

Weekly:
5. Voting data analyzed
6. Topic requests tallied
7. Trends noted for next week

Monthly:
8. Top contributors recognized
9. Community feedback reviewed
10. curator.json weights adjusted if patterns emerge
11. New RSS sources evaluated for addition
```

### Real Example
```
Day 1: Community submits story about new accessibility requirement
Day 2: Editor verifies source, adds to that day's curation
Day 3: Story appears in daily digest with "Suggested by Sarah"
Day 4: Readers vote "very relevant" on the story
Week 1: Story gets highest community engagement
Month 1: Pattern identified - readers want more housing accessibility stories
Month 2: Editor adds housing-focused RSS feed to sources
Month 3: Housing stories now appear 2x/week instead of 2x/month
```

---

## FAQs

**Q: Will contributing my story idea get me credit?**  
A: Yes, if accepted! Your name appears as "Suggested by [Your Name]" on the story (unless you prefer to stay anonymous).

**Q: What if my story doesn't get selected?**  
A: We can't cover everything, but we save all submissions for our archives. Declined stories help us understand what we're missing.

**Q: Can I suggest stories from my own blog/website?**  
A: We have conflict-of-interest guidelines. If you submit your own content, disclose it. We'll consider it alongside external sources.

**Q: How long until my story appears?**  
A: Typically 1-3 days if it meets our standards. Urgent/breaking news faster.

**Q: Can I see my submission status?**  
A: We'll send email confirmation. For major contributions, we'll invite you to community curator dashboard.

**Q: Do I get paid for contributions?**  
A: No, but you get recognition and community impact. Some top contributors are invited to collaborate on bigger projects.

**Q: What if I find misinformation in stories you've curated?**  
A: Please report it! Email editor@3mpwrapp.com with link + explanation. We'll review and correct.

---

## Handling Difficult Situations

### Submitter Disputes Rejection
**Response:**
1. Acknowledge receipt professionally
2. Explain which criteria it didn't meet (specific + kind)
3. Invite resubmission if issue can be fixed
4. Example: "Thanks for suggesting this article. It's from a blog rather than a verified source, and we focus on articles from established outlets. Do you have another version from a news site?"

### Misinformation Discovered Post-Publication
**Response:**
1. Remove or flag as "Under Review"
2. Email submitter with explanation
3. Post correction prominently
4. Note lesson learned for future moderation

### Spam/Scam Submissions
**Response:**
1. Delete silently (no engagement)
2. Block email/account if pattern
3. No public shaming—just filter

---

## Success Metrics

Track monthly:
- Submissions received vs. accepted
- Acceptance rate (target: 30-50%)
- Engagement on community-sourced articles vs. algorithmic
- New RSS sources added from community suggestions
- Active community curators (repeat contributors)

Review quarterly:
- Has community input improved curation quality?
- Are we catching stories we missed before?
- Community satisfaction (via survey)
- Time saved by team (vs. cost of moderation)

---

## Next Steps

1. **Get feedback** - Share guidelines with 10-20 engaged readers
2. **Refine** - Adjust based on feedback
3. **Set up tech** - Add forms, moderation workflows
4. **Test** - Soft launch with small group
5. **Train team** - Document moderation process
6. **Launch** - Announce to full community

---

**Created:** January 2025  
**Last Updated:** January 2, 2026  
**Maintained by:** Content Strategy Team
