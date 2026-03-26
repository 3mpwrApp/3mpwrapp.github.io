# 🤖 Agent Feedback System - Complete Guide

**Status:** ✅ Active  
**Created:** January 21, 2026  
**Purpose:** AI-powered quality analysis and recommendations for all content

---

## What It Does

The Agent Feedback System automatically analyzes **all your content** and provides actionable recommendations:

### 📝 Blog Posts
- Quality scoring (0-10)
- Engagement potential analysis
- Accessibility checks (alt text, headings, readability)
- SEO optimization suggestions
- Disability community focus verification

### 📰 Curated Articles
- Source diversity analysis
- Topic coverage balance
- Disability Bulletin prominence check
- Content gap identification

### 📈 Trending Topics
- Identifies what's resonating with your audience
- Spots emerging themes
- Finds underrepresented topics
- Guides future content strategy

### #️⃣ Hashtag Performance
- Tracks which hashtags you're using
- Recommends disability community hashtags
- Identifies optimization opportunities

---

## How It Works

### Automated Daily Analysis

The system runs **automatically every night at 11 PM UTC** (6 PM EST) after all content generation completes.

**Workflow:**
1. Scans last 10 blog posts
2. Analyzes last 7 days of curated articles
3. Identifies trending topics from last 30 posts
4. Tracks hashtag usage and performance
5. Generates comprehensive recommendations
6. Saves JSON data + human-readable markdown report
7. Commits reports to `feedback/` directory

### Quality Scoring

Each blog post gets scored on:
- **Content length** - Is it substantial enough?
- **Structure** - Proper heading hierarchy?
- **Accessibility** - Alt text, readability, clear language?
- **Links** - Quality internal/external linking?
- **Engagement** - Call-to-action present?
- **Focus** - Disability community keywords?
- **Readability** - Sentence length, clarity?

**Score Scale:**
- **8-10**: Excellent quality
- **6-7**: Good quality, minor improvements
- **4-5**: Needs improvement
- **0-3**: Significant issues

---

## Running the Analysis

### Manual Run

```bash
# Run complete analysis
npm run feedback

# Or directly
node scripts/agent-feedback-system.js
```

### View Latest Report

```bash
# Display latest feedback in terminal
npm run feedback:latest

# Open markdown report
cat feedback/agent-feedback-YYYY-MM-DD.md
```

### Automated Schedule

The GitHub Actions workflow runs automatically:
- **Schedule:** Daily at 11 PM UTC
- **Workflow:** `.github/workflows/agent-feedback.yml`
- **Manual trigger:** Via GitHub Actions UI

---

## Understanding the Reports

### JSON Report (`agent-feedback-YYYY-MM-DD.json`)

Complete structured data including:

```json
{
  "generatedAt": "2026-01-21T23:00:00.000Z",
  "summary": {
    "postsAnalyzed": 10,
    "articlesAnalyzed": 147,
    "trendingTopicsIdentified": 18,
    "hashtagsTracked": 23
  },
  "results": {
    "posts": [/* detailed post analysis */],
    "articles": [/* curation analysis */],
    "trending": [/* topic trends */],
    "hashtags": [/* hashtag data */],
    "overall": {/* recommendations */}
  }
}
```

### Markdown Report (`agent-feedback-YYYY-MM-DD.md`)

Human-readable summary with:
- Average quality scores
- Top issues across all content
- Common strengths
- Source diversity metrics
- Trending topic list
- Hashtag recommendations
- Prioritized action items

**Example sections:**

```markdown
## 📝 Blog Posts Analysis

**Posts analyzed:** 10
**Average quality score:** 7.3/10

### Top Issues
- Images missing alt text (3 posts)
- Content too short (< 300 words) (2 posts)
- No H2 headings - poor structure (1 post)

### Top Strengths
- Comprehensive content (2000+ words) (5 posts)
- Good use of internal/external linking (7 posts)
- Strong disability community focus (8 posts)
```

---

## Acting on Feedback

### Priority Actions (Do First)

The system flags **priority issues** that need immediate attention:

⚠️ **Quality Alerts**
- Posts scoring < 6/10
- Missing accessibility features
- Low engagement potential

**How to fix:**
1. Review markdown report's "Priority" section
2. Open flagged files in editor
3. Address specific issues listed
4. Re-run feedback to verify improvements

### Recommended Workflow

**Weekly:**
1. Review latest feedback report (Monday mornings)
2. Fix any priority issues (< 1 hour)
3. Plan content based on trending topics
4. Update hashtag strategy if needed

**Monthly:**
1. Analyze trends across 4 weekly reports
2. Identify recurring issues
3. Update content templates/guidelines
4. Adjust agent prompts if needed

---

## Integration with Existing Agents

### Curation Agent
- Feedback informs source selection
- Topic gaps guide feed additions
- Diversity score guides curation strategy

### Blog Post Agent
- Quality issues guide prompt refinements
- Trending topics inform content calendar
- Engagement data optimizes CTAs

### Social Media
- Hashtag analysis improves reach
- Trending topics guide social posts
- Engagement metrics inform strategy

---

## Configuration

### Environment Variables

```bash
# Optional - for future AI-powered analysis
ANTHROPIC_API_KEY=your_key_here
```

### File Paths

Default directories (auto-created):
- **Posts:** `_posts/`
- **Curation:** `_curation/`
- **Feedback output:** `feedback/`
- **Logs:** `logs/feedback/`

Custom configuration:

```javascript
const feedbackSystem = new AgentFeedbackSystem({
  postsDir: 'path/to/posts',
  curationDir: 'path/to/curation',
  feedbackDir: 'path/to/feedback',
  aiModel: 'claude-3.5-sonnet'
});
```

---

## What Gets Analyzed

### Blog Posts
- ✅ Last 10 posts
- ✅ Word count, structure, headings
- ✅ Images and alt text
- ✅ Links (internal/external)
- ✅ Call-to-action presence
- ✅ Disability keywords
- ✅ Readability (sentence length)
- ✅ Engagement potential

### Curated Articles
- ✅ Last 7 days of curations
- ✅ Source diversity (unique domains)
- ✅ Topic distribution
- ✅ Disability Bulletin presence
- ✅ Content balance

### Trending Analysis
- ✅ Last 30 posts scanned
- ✅ 18 disability-focused topics tracked
- ✅ Frequency analysis
- ✅ Gap identification
- ✅ Balance checking

### Hashtags
- ✅ Last 20 posts scanned
- ✅ Usage frequency
- ✅ Recommended vs. actual
- ✅ Diversity metrics

---

## Quality Metrics Explained

### Quality Score Components

| Component | Weight | Good Practice |
|-----------|--------|---------------|
| Length | ±2 | 500-2000 words optimal |
| Structure | ±1 | Multiple H2/H3 headings |
| Alt Text | ±1 | All images have descriptive alt |
| Links | ±1 | 3+ quality links |
| CTA | ±1 | Clear engagement prompts |
| Keywords | ±2 | 5+ disability-focused terms |
| Readability | ±1 | Avg 15-20 words/sentence |

**Base:** 5/10 (neutral)  
**Range:** 0-10

### Engagement Potential

Calculated from:
- Word count (> 500 = +2)
- Heading count (≥ 3 = +1)
- Links (≥ 3 = +1)
- CTA present (+1)
- Keyword focus (+2)

**Levels:**
- **High** (6+ points): Ready to engage
- **Medium** (3-5 points): Solid baseline
- **Low** (< 3 points): Needs improvement

### Diversity Score

For curated articles:
- Articles per source (lower = better)
- Topic concentration (lower = better)
- Disability Bulletin presence (+2)
- Unique sources count

**Scale:** 0-10 (higher = more diverse)

---

## Example Reports

### Sample Post Analysis

```json
{
  "filename": "2026-01-15-accessible-housing-rights.md",
  "qualityScore": 8.5,
  "engagementPotential": "high",
  "issues": [],
  "strengths": [
    "Comprehensive content (2000+ words)",
    "Well-structured with multiple sections",
    "All images have alt text",
    "Good use of internal/external linking",
    "Strong disability community focus"
  ],
  "recommendations": [
    "Consider adding more diverse sources"
  ]
}
```

### Sample Trending Analysis

```json
{
  "trendingTopics": [
    { "topic": "accessibility", "mentions": 47 },
    { "topic": "housing", "mentions": 31 },
    { "topic": "employment", "mentions": 28 },
    { "topic": "healthcare", "mentions": 24 },
    { "topic": "advocacy", "mentions": 19 }
  ],
  "recommendations": [
    "Consider covering: transportation (3 mentions), education (2 mentions)"
  ]
}
```

---

## Troubleshooting

### No Reports Generated

**Check:**
1. Does `_posts/` directory exist?
2. Are there markdown files in `_posts/`?
3. Check `logs/feedback/` for errors
4. Verify file permissions

**Fix:**
```bash
# Ensure directories exist
mkdir -p feedback logs/feedback

# Run with verbose logging
node scripts/agent-feedback-system.js
```

### Low Quality Scores

**Common causes:**
- Short posts (< 300 words)
- Missing headings
- No alt text on images
- Limited disability keywords

**Solutions:**
1. Review specific issues in report
2. Follow recommendations
3. Use content templates
4. Re-run analysis

### Workflow Not Running

**Check:**
1. Workflow file exists: `.github/workflows/agent-feedback.yml`
2. GitHub Actions enabled for repo
3. Recent commits to trigger workflow
4. Check Actions tab for errors

---

## Advanced Usage

### Custom Analysis

```javascript
const AgentFeedbackSystem = require('./scripts/agent-feedback-system');

// Custom configuration
const feedback = new AgentFeedbackSystem({
  postsDir: './custom-posts',
  minQualityScore: 7.0
});

// Run specific analysis
await feedback.analyzeBlogPosts();
await feedback.analyzeTrendingTopics();

// Get status
console.log(feedback.getStatus());
```

### Integration with CI/CD

Add to your existing workflows:

```yaml
- name: Quality Check
  run: |
    npm run feedback
    
    # Fail if quality below threshold
    LATEST=$(ls -t feedback/*.json | head -1)
    QUALITY=$(node -e "
      const data = require('./$LATEST');
      const avg = data.results.posts.reduce((sum, p) => sum + p.qualityScore, 0) / data.results.posts.length;
      console.log(avg);
    ")
    
    if (( $(echo "$QUALITY < 6.0" | bc -l) )); then
      echo "❌ Quality below threshold: $QUALITY"
      exit 1
    fi
```

---

## Maintenance

### Weekly
- ✅ Review latest feedback report
- ✅ Address priority issues
- ✅ Update content based on trends

### Monthly
- ✅ Analyze 4-week trends
- ✅ Update content guidelines
- ✅ Refine quality thresholds
- ✅ Archive old reports

### Quarterly
- ✅ Full content audit
- ✅ Update keyword lists
- ✅ Refresh recommended hashtags
- ✅ Review automation effectiveness

---

## Benefits

### Content Quality
- ✅ Consistent quality standards
- ✅ Automated accessibility checks
- ✅ Early issue detection
- ✅ Data-driven improvements

### Efficiency
- ✅ Automated daily analysis
- ✅ No manual quality reviews needed
- ✅ Prioritized action items
- ✅ Clear recommendations

### Strategy
- ✅ Trending topic insights
- ✅ Content gap identification
- ✅ Source diversity monitoring
- ✅ Hashtag optimization

### Disability Focus
- ✅ Keyword coverage tracking
- ✅ Accessibility enforcement
- ✅ Community-centered metrics
- ✅ Disability Bulletin monitoring

---

## Quick Reference

### Commands
```bash
npm run feedback              # Run complete analysis
npm run feedback:latest       # View latest report
cat feedback/agent-feedback-*.md  # Read reports
```

### File Locations
```
feedback/
  ├── agent-feedback-2026-01-21.json  # Structured data
  ├── agent-feedback-2026-01-21.md    # Human-readable
  └── agent-feedback-2026-01-20.json  # Previous day

logs/feedback/
  └── [timestamp].log  # Execution logs
```

### Quality Thresholds
- **Excellent:** 8-10
- **Good:** 6-7
- **Needs Work:** 4-5
- **Poor:** 0-3

---

## Next Steps

1. **Review First Report**
   ```bash
   npm run feedback
   npm run feedback:latest
   ```

2. **Address Priority Items**
   - Fix posts with quality < 6
   - Add missing alt text
   - Improve engagement CTAs

3. **Monitor Trends**
   - Weekly review of feedback
   - Adjust content strategy
   - Update hashtags

4. **Iterate**
   - Let system run daily
   - Track improvements over time
   - Refine based on data

---

**🎉 Your content now has 24/7 AI quality monitoring!**

*Questions? Check the code: `scripts/agent-feedback-system.js`*

## Orchestrator Directive

- Role: You are the orchestrator; subagents execute.
- Do not build, verify, or code inline. Your job is to plan, prioritize, and coordinate.
- Pre-task requirement: Before starting any task, read the full project context and check what other agents have completed relevant to each subagent's prompt.

Model / runtime notes (informational):

- Install / use: `kimi k`
- Install / use: `deepseek v3.2`
- Install / use: `qwen3.5-397b`

Add these notes to onboarding or deployment scripts so subagents know which models to request or expect.
