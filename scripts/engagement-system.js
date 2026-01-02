/**
 * ENGAGEMENT SYSTEM: Voting, Polls, and Community Feedback
 * Allows readers to indicate article relevance and participate in content curation
 */

const engagementUI = {
  article_relevance_voting: {
    description: "Let readers vote: 'How relevant is this to you?'",
    placement: "Below article excerpt on blog/curation page",
    html: `
<div class="engagement-voting" data-article-id="{article_id}" role="region" aria-label="Article relevance voting">
  <p class="engagement-prompt">Was this relevant to you?</p>
  <div class="voting-buttons">
    <button class="vote-btn" data-value="very-relevant" aria-label="Vote: Very relevant">
      <span class="vote-icon">👍</span>
      Very relevant
      <span class="vote-count" aria-label="Very relevant votes"></span>
    </button>
    <button class="vote-btn" data-value="somewhat-relevant" aria-label="Vote: Somewhat relevant">
      <span class="vote-icon">👌</span>
      Somewhat relevant
      <span class="vote-count" aria-label="Somewhat relevant votes"></span>
    </button>
    <button class="vote-btn" data-value="not-relevant" aria-label="Vote: Not relevant">
      <span class="vote-icon">👎</span>
      Not relevant
      <span class="vote-count" aria-label="Not relevant votes"></span>
    </button>
  </div>
  <p class="engagement-note">Your feedback helps us improve the daily curation</p>
</div>
    `.trim()
  },
  
  topic_preference_poll: {
    description: "Ask readers: 'What topics matter most to you?'",
    placement: "Sidebar or after blog post",
    html: `
<div class="engagement-poll" role="region" aria-label="Topic preference poll">
  <h3>What matters to you?</h3>
  <p class="poll-prompt">Help us know what to cover more:</p>
  <div class="poll-options">
    <label class="poll-option">
      <input type="checkbox" name="topic" value="workers-rights" aria-label="Workers Rights & Compensation">
      <span>⚖️ Workers Rights & Compensation</span>
    </label>
    <label class="poll-option">
      <input type="checkbox" name="topic" value="disability-benefits" aria-label="Disability Benefits">
      <span>💰 Disability Benefits Navigation</span>
    </label>
    <label class="poll-option">
      <input type="checkbox" name="topic" value="accessibility" aria-label="Accessibility & Design">
      <span>♿ Accessibility & Inclusive Design</span>
    </label>
    <label class="poll-option">
      <input type="checkbox" name="topic" value="legal-victories" aria-label="Legal Victories">
      <span>⚔️ Legal Victories & Wins</span>
    </label>
    <label class="poll-option">
      <input type="checkbox" name="topic" value="health-wellness" aria-label="Health & Wellness">
      <span>🧘 Health & Wellness Support</span>
    </label>
    <label class="poll-option">
      <input type="checkbox" name="topic" value="community" aria-label="Community">
      <span>🤝 Community Action & Events</span>
    </label>
  </div>
  <button class="poll-submit" aria-label="Submit your topic preferences">Submit</button>
</div>
    `.trim()
  },
  
  action_taken_tracking: {
    description: "Let readers indicate if they took action on story",
    placement: "Below article with action (e.g., apply for benefit)",
    html: `
<div class="engagement-action-tracking" data-article-id="{article_id}" role="region" aria-label="Did you take action on this story?">
  <h4>Did this story help you?</h4>
  <p class="action-prompt">Let us know if you took action:</p>
  <div class="action-options">
    <button class="action-btn" data-action="applied" aria-label="I applied for this benefit or service">
      ✅ I applied / took action
    </button>
    <button class="action-btn" data-action="bookmarked" aria-label="I saved this for later">
      🔖 I saved for later
    </button>
    <button class="action-btn" data-action="shared" aria-label="I shared with someone">
      📤 I shared this
    </button>
    <button class="action-btn" data-action="learned" aria-label="I just learned from this">
      💡 I learned something new
    </button>
  </div>
  <p class="engagement-note">This helps us understand what's most valuable</p>
</div>
    `.trim()
  },
  
  missing_story_form: {
    description: "Allow readers to suggest news stories or topics",
    placement: "Blog sidebar or footer",
    html: `
<div class="engagement-suggest-story" role="region" aria-label="Suggest a story">
  <h3>Missing something?</h3>
  <p>Spotted a story we should cover?</p>
  <form class="suggest-story-form">
    <input type="text" placeholder="Story title or topic" required aria-label="Story title">
    <input type="url" placeholder="Link (if you have one)" aria-label="Story link">
    <textarea placeholder="Why should we cover this?" aria-label="Why this story matters"></textarea>
    <button type="submit" aria-label="Submit story suggestion">Suggest it</button>
  </form>
  <p class="form-note">Great tips help shape our daily curation</p>
</div>
    `.trim()
  },
  
  saved_articles_feature: {
    description: "Let readers save articles for reading later",
    placement: "Each article card",
    html: `
<div class="engagement-save-article" data-article-id="{article_id}">
  <button class="save-btn" aria-label="Save this article to read later" aria-pressed="false">
    <span class="save-icon">📌</span>
    <span class="save-text">Save</span>
  </button>
</div>
    `.trim()
  }
};

const engagementStyles = `
/* Engagement UI Styles */
.engagement-voting,
.engagement-poll,
.engagement-action-tracking,
.engagement-suggest-story,
.engagement-save-article {
  font-family: inherit;
  margin: 1.5rem 0;
}

.engagement-prompt,
.poll-prompt,
.action-prompt {
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--text-color, #333);
}

.voting-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--link-color, #007bff);
  border-radius: 6px;
  background: white;
  color: var(--link-color, #007bff);
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.vote-btn:hover {
  background: var(--link-color, #007bff);
  color: white;
}

.vote-btn.voted {
  background: var(--link-color, #007bff);
  color: white;
}

.vote-icon {
  font-size: 1.2rem;
}

.vote-count {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-left: 0.25rem;
}

.poll-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.poll-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.poll-option:hover {
  background: var(--hover-bg, #f5f5f5);
}

.poll-option input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.poll-submit,
.action-btn,
.save-btn,
.suggest-story-form button {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  background: var(--button-bg, white);
  color: var(--button-text, var(--link-color, #007bff));
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.poll-submit:hover,
.action-btn:hover,
.save-btn:hover,
.suggest-story-form button:hover {
  background: var(--link-color, #007bff);
  color: white;
  border-color: var(--link-color, #007bff);
}

.action-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}

.action-btn {
  padding: 0.75rem;
  text-align: center;
  white-space: normal;
}

.suggest-story-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.suggest-story-form input,
.suggest-story-form textarea {
  padding: 0.6rem;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.95rem;
}

.suggest-story-form textarea {
  resize: vertical;
  min-height: 80px;
}

.engagement-note,
.form-note {
  font-size: 0.85rem;
  color: var(--text-muted, #666);
  margin-top: 0.75rem;
}

/* Accessibility: Focus states */
.vote-btn:focus,
.poll-submit:focus,
.action-btn:focus,
.save-btn:focus,
.suggest-story-form button:focus,
.poll-option input:focus {
  outline: 2px solid var(--focus-color, #0056b3);
  outline-offset: 2px;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .voting-buttons {
    flex-direction: column;
  }
  
  .vote-btn {
    width: 100%;
    justify-content: center;
  }
  
  .action-options {
    grid-template-columns: 1fr;
  }
}
`;

const engagementAnalytics = {
  tracking: {
    vote_metrics: "Track which articles get highest relevance votes",
    topic_preferences: "Aggregate topic checkbox votes to see what readers care about",
    action_taken: "Monitor which stories drive actual behavior change",
    save_rate: "Which articles are saved most often (evergreen value indicator)",
    suggested_stories: "What topics/stories readers wish we covered"
  },
  
  implementation: {
    storage: "Use localStorage for client-side + POST to backend for analytics",
    backend_endpoint: "/api/engagement/{article-id}",
    analytics_dashboard: "Show top engagement articles on site dashboard",
    feedback_loop: "Use data to refine curator.json scoring weights"
  }
};

const curationImpactLoop = `
## FEEDBACK LOOP: Make Curation Smarter

1. **Daily Reading Engagement**
   - Track which articles get 'very relevant' votes
   - Monitor which topic gets highest demand

2. **Weekly Analysis**
   - Identify patterns: What topics drive engagement?
   - Which story suggestions appear repeatedly?

3. **Monthly Optimization**
   - Adjust curator.json weights based on data
   - Add new RSS feeds for high-demand topics
   - Remove low-engagement sources

4. **Quarterly Strategy**
   - Compare engagement metrics with community feedback
   - Identify blind spots or gaps in coverage
   - Interview 5-10 top engagers about needs

## EXAMPLE OPTIMIZATION CYCLE

Monday: Reader votes 3 articles about housing subsidies as "very relevant"
- Suggests housing is underrepresented

Wednesday: Two readers suggest CMHC policies as story
- Confirms pattern

Friday: Add "CMHC Housing Benefit" to high_priority keywords
- Score boost from 3 → 4

Next week: Housing stories now appearing higher in curation
- Engagement increases 25% on housing articles

Next month: Add housing-focused RSS feed
- More consistent coverage
`;

module.exports = {
  engagementUI,
  engagementStyles,
  engagementAnalytics,
  curationImpactLoop
};
