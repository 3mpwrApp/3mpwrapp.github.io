#!/usr/bin/env node

/**
 * 3mpwrApp Article Generator
 * 
 * Auto-generates 2 blog posts per week about 3mpwrApp features, stories, and updates.
 * Creates Monday and Wednesday posts showcasing different aspects of the platform.
 * 
 * Article types:
 * - Feature spotlight
 * - User stories
 * - How-to guides
 * - Community highlights
 * - Accessibility achievements
 * - Resource round-ups
 */

const fs = require('fs');
const path = require('path');

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

// Article templates
const articleTemplates = [
  {
    title: 'Feature Highlight: ML-Powered Energy Forecasting & Smart Notifications',
    type: 'feature',
    day: 1, // Monday
    excerpt: 'Discover how 3mpwrApp\'s AI-powered energy prediction helps you plan your day and manage your capacity with personalized smart notifications.',
    content: `
## Know Your Energy Before You Need It

Managing a disability often means managing limited energy. Phase 6 of 3mpwrApp introduces AI-powered energy forecasting that learns your patterns and predicts your best times.

### What's Energy Forecasting?

Think of your energy like a battery. Some days you wake up charged. Other days you're running on fumes. 3mpwrApp learns YOUR pattern and predicts:

- ⚡ **When you'll have the most energy** (best for big tasks)
- 🔋 **When you'll have the least energy** (time to rest)
- 📊 **24-hour energy predictions** (plan your entire day)
- 🎯 **Optimal times for activities** (when you're strongest)

### How Machine Learning Helps

The app analyzes your patterns across:
- Your activity history
- When you use which tools
- Your mood and wellness tracking
- Your sleep and rest patterns
- Your symptom fluctuations

Then it uses AI algorithms to predict: **"Based on your patterns, you'll have peak energy at 2 PM tomorrow."**

### Smart Notifications That Actually Work

Instead of bothering you randomly, smart notifications:

✅ **Schedule for YOUR peak times** - Messages arrive when you have energy to read and act  
✅ **Learn what works** - App tests different times to find your optimal window  
✅ **Respect your capacity** - Fewer notifications during low-energy periods  
✅ **Adapt over time** - Gets smarter as it learns more about you  

### Weekly Wellness Reports

Every week, you get a comprehensive summary:
- 📈 Energy trends (are you improving or declining?)
- 😊 Mood patterns (what affects your mental health?)
- 🛠️ Tool usage insights (what helps most?)
- 🏆 Achievements (celebrate your wins!)
- ⭐ Wellness score (overall wellbeing snapshot)

### Real-World Example

> Maria uses a wheelchair and experiences pain that's worse in mornings.
>
> **Old way:** Tried to schedule important calls at 9 AM, but was always too sore.
>
> **With 3mpwrApp:** Energy forecast says her peak times are 2-4 PM. She now schedules calls then and gets way more done. Notifications about benefits appointments come at 1 PM when she has time to read and respond.
>
> **Result:** More accomplishments, less frustration, better energy management.

### Privacy First

All energy prediction happens **on your device**:
- Your data never leaves your phone
- No cloud processing of personal patterns
- You control what you share
- Delete anytime, no questions asked

### Getting Started with Energy Forecasting

1. Enable in Settings → Wellness → Energy Forecasting
2. Start with the Energy Coins tool (tracks your daily capacity)
3. Use mood tracking for a few days
4. Watch as the app learns your patterns
5. See 24-hour predictions appear on your dashboard

### Learn More

[Open Energy Forecasting Feature →](/features#energy-forecast)
[View Wellness Dashboard →](/wellness)
[Read the Complete User Guide →](/user-guide)

---

**3mpwrApp learns how you work—so the app adapts to your life, not the other way around.**
`
  },
  {
    title: 'How-To: Using the Disability Wizard for Personalized Recommendations',
    type: 'howto',
    day: 3, // Wednesday
    excerpt: 'Discover your best tools first. The Disability Wizard learns your needs and suggests exactly what you need, when you need it.',
    content: `
## Let AI Learn Your Needs

The Disability Wizard is like a smart personal assistant that learns your disability, energy patterns, and preferences—then recommends the perfect tool at the right time.

### What is the Disability Wizard?

Every time you open 3mpwrApp, you'll see three personalized recommendations:

- 🎯 **Today's Feature** - Highest priority for you right now
- ⭐ **Energy-Matched Tool** - What you can actually do today (not just tomorrow)
- 💡 **Hidden Gem** - A feature you might not have discovered yet

Each includes:
- Simple explanation of what it does
- How much energy it takes (🟢 Low / 🟠 Medium / 🔴 High)
- Time estimate (usually 2-15 minutes)
- Why it's recommended for YOU

### Step 1: Set Up Your Profile

**Takes 3 minutes:**

1. Open 3mpwrApp → Settings → Disability Wizard
2. Select your disability type (or multiple if relevant)
   - Physical disabilities
   - Neurodivergent (ADHD, autism, etc.)
   - Cognitive/learning disabilities
   - Mental health conditions
   - Chronic illness
   - Sensory disabilities
3. Choose your energy patterns
   - Morning person, evening person, or variable?
   - Generally high energy, low energy, or fluctuating?
4. Select accessibility needs
   - Screen reader, high contrast, large text, etc.
5. Tap Save

**That's it!** Your wizard is now personalized.

### Step 2: Let It Learn Your Patterns

The wizard gets smarter the more you use it. After a few days:

- It learns when YOU typically open the app
- It sees which tools you actually use
- It notices what types of tasks you complete
- It tracks your energy patterns over time

**After 1 week:** Recommendations become much more accurate  
**After 1 month:** Wizard knows you better than you know yourself

### Step 3: Follow the Recommendations

Try the suggestions it offers. You don't have to use them, but:

- ✅ **If it helps:** Tell the app "That was perfect" → recommendations improve
- ✅ **If it's not for you:** Just skip it → Wizard learns what you don't need
- ✅ **If you're not sure:** Read the description → You might discover something useful

### Real Example

**Meet Jamie:**
- Autism + chronic pain + ADHD
- Mornings are rough, productive from 2-5 PM
- Uses a screen reader
- Struggles with decision fatigue

**What the Wizard recommends:**

> **Tuesday Morning (11 AM)**
> 
> 🟢 Low Energy, 3 minutes
> 
> "Mood Reflection - You usually track mood in the morning. Take 60 seconds?"
>
> Why: You've been consistent with daily reflections
> What's next: Suggesting peer support after this

> **Tuesday Afternoon (2 PM)**
>
> 🟡 Medium Energy, 8 minutes
>
> "AI Translator - Someone shared a confusing benefits letter with you"
>
> Why: Your peak energy time + you've used this tool 4 times before
> What's next: Can save to your Evidence Locker

> **Tuesday Evening (4:30 PM)**
>
> 🟡 Medium Energy, 10 minutes
>
> "Disability Wizard Profile Check - Updating your patterns"
>
> Why: It's learning your real preferences based on what you actually use
> What's next: Tomorrow's recommendations will be even better

### Tips for Getting the Most Out of It

✅ **Open the app regularly** - More usage = better learning  
✅ **Try recommended tools** - Even if unsure, you might love it  
✅ **Give feedback** - "That helped" / "Not for me" improves recommendations  
✅ **Update your profile** - If your energy changes, tell the wizard  
✅ **Check different times** - You might get different recommendations at different times  

### What If Recommendations Aren't Working?

**The wizard learns from what you do, not just what you click.** If recommendations miss the mark:

1. **Update your profile** - Go to Settings, refresh your preferences
2. **Tell the wizard directly** - "I prefer..." feedback helps
3. **Reset and restart** - Sometimes a fresh start helps
4. **Try advanced setup** - More detailed profile = better predictions

### Privacy & Your Data

- ✅ All learning happens on YOUR device
- ✅ Your preferences never leave your phone
- ✅ No cloud processing of personal patterns
- ✅ Delete anytime with one click
- ✅ Complete control over your data

### Getting Started Right Now

[Open the Disability Wizard →](/features#disability-wizard)  
[Start the 5-minute setup →](/wizard-setup)  
[Read full documentation →](/user-guide#disability-wizard)  

---

**Your disability is unique. So should your tools. The Disability Wizard finds exactly what you need.**
`
  },
  {
    title: 'Join Phase 1 Closed Beta Testing - Help Shape 3mpwrApp',
    type: 'community',
    day: 1, // Monday
    excerpt: 'We\'re launching Phase 1 Closed Beta Testing! Test new features, share your feedback, and help us build tools that truly work for the disability community.',
    content: `
## 🧪 Phase 1 Closed Beta Testing is Live!

We're excited to announce the start of Phase 1 Closed Beta Testing for 3mpwrApp. **We need testers like you** to help us build the most accessible, useful tools for injured workers and persons with disabilities.

### What is Beta Testing?

Beta testing means you get to:
- ✅ **Try new features first** - Before they're available to everyone
- ✅ **Give direct feedback** - Your input shapes what we build next
- ✅ **Report bugs and issues** - Help us fix problems before full launch
- ✅ **Test accessibility** - Ensure the app works for everyone
- ✅ **Suggest improvements** - Tell us what would help you most

### What's Included in Phase 1?

Phase 1 focuses on core functionality including:

#### 🎯 Advocacy Tools
- Professional letter generator (22 templates)
- AI policy simplifier - understand complex regulations
- Case interpreter - break down legal documents
- Legal workflow automation - step-by-step guidance

#### 📚 Resources & Evidence
- Secure evidence locker for documents
- Resource directory for disability support
- Benefits eligibility checker
- Program finder across Canada

#### 🌍 Community & Support
- Connect with others in your province
- Share experiences and advice
- Support groups by disability type
- Peer-to-peer assistance

#### ♿ Accessibility Features
- Full screen reader support
- Dyslexia-friendly fonts and spacing
- High contrast mode
- Motor accessibility (dwell-click, touch targets)
- Multiple language options

### How to Join Beta Testing

**Phase 1 Testing is currently closed.** We're bringing testers on in waves to ensure quality feedback.

**Want to be notified when Phase 2 opens?**

[Sign up for Beta Testing Notifications →](/contact)

**Already a Phase 1 tester?** 

[Access the Beta App →](/beta)

### What We're Looking For in Testers

We're looking for testers with diverse experiences:
- People with various disability types
- Users with different tech skill levels
- Those using assistive technologies (screen readers, speech input, etc.)
- People on mobile devices and desktop
- English and French speakers
- People from all Canadian provinces and territories

### The Testing Process

1. **Download the app** - Get access to the beta version
2. **Try the features** - Use the tools with your actual needs
3. **Report issues** - Tell us what's not working
4. **Suggest improvements** - Share your ideas
5. **Get support** - Our team helps you test
6. **See changes** - Your feedback becomes real improvements

### Key Testing Areas - Phase 1

#### 🎯 Core Features to Test
- Does the letter generator create professional, usable letters?
- Can you find the resources you need quickly?
- Is the community feature easy to use?
- Do accessibility features work with your devices?

#### 🔍 Accessibility Testing
- Screen reader compatibility (VoiceOver, TalkBack, JAWS, NVDA)
- Keyboard navigation throughout the app
- Color contrast and visibility
- Text sizing and readability
- Motor accessibility features

#### 📱 Device Testing
- iPhone/iPad (iOS)
- Android phones and tablets
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Various screen sizes and resolutions
- Different internet speeds

### Your Feedback Helps Us Deliver

Every bug you report, every suggestion you make, and every accessibility issue you find helps us build better tools. **Your voice matters.**

---

## Want to Join?

### Beta Testers get:
✅ First access to new features  
✅ Direct communication with our team  
✅ Your name in our credits (if you want)  
✅ Priority support during testing  
✅ Free lifetime access (as a thank you)  

### Apply Now

[Learn More About Beta Testing →](/beta)
[Apply to Be a Tester →](/contact)

---

**Together, we're building disability justice through technology.**

Phase 1 closes November 15, 2025. Phase 2 opens December 2025.

---

Have questions about beta testing? [Get in touch →](/contact)
`
  },
  {
    title: 'Accessibility Achievement: Supporting All Disability Types with AI-Powered Tools',
    type: 'accessibility',
    day: 3, // Wednesday
    excerpt: 'Learn how 3mpwrApp supports physical, cognitive, sensory, and neurodivergent disabilities with accessible-first design.',
    content: `
## Building for Every Disability

At 3mpwrApp, we believe accessibility isn't a feature bolted on at the end—it's the foundation everything's built on. That's why we support **all disability types** with intelligent, accessible-first design.

### Our Commitment: Disability-Centered Design

We start every design decision by asking: **"Who are we leaving out?"**

Our commitment:
- ✅ **All disability types supported** - Physical, cognitive, sensory, neurodivergent, mental health, chronic illness
- ✅ **AI that adapts** - Machine learning personalizes to YOUR specific needs
- ✅ **Real accessibility testing** - We test with actual people using assistive tech
- ✅ **Continuous improvement** - Your feedback shapes what we build next
- ✅ **Privacy-first** - Your data stays on your device

### Features Built for Every Disability

#### 🦽 Physical & Mobility Disabilities
- **Motor Accessibility:** Dwell-click support (hold to activate, no tapping needed)
- **Touch Targets:** Large buttons (64x64pt minimum) for easier tapping
- **Tremor Compensation:** Ignore accidental rapid taps
- **One-Handed Mode:** Position controls for left or right hand
- **Voice Control:** Navigate and dictate without typing
- **Energy Tracking:** Plan activities based on your capacity

#### 👁️ Vision & Sight Disabilities
- **Screen Reader Compatible:** Full VoiceOver, TalkBack, JAWS, NVDA support
- **WCAG AAA Color Contrast:** Exceeds accessibility standards
- **Text Scaling:** 80-200% adjustable sizing
- **High Contrast Mode:** Special modes for low vision
- **No Color-Only Information:** Everything works in grayscale
- **Audio Descriptions:** Where relevant

#### 👂 Hearing & Deaf Disabilities
- **Captions & Transcripts:** Video has captions
- **Visual Indicators:** Notifications show visually, not just as sounds
- **No Audio-Only Information:** Everything has a text alternative
- **Vibration Options:** Haptic feedback where relevant

#### 🧠 Cognitive & Learning Disabilities
- **Plain Language:** Clear, simple explanations everywhere
- **Multiple Ways to Find Things:** Search, browse, recommendations
- **Dyslexia-Friendly Tools:** 5 fonts, 8 overlays, adjustable spacing
- **Step-by-Step Guides:** Break complex processes into simple steps
- **Simplified Mode:** Reduce choices, add progress tracking
- **Auto-Save:** Never lose your work

#### 🎭 Neurodivergent Support
- **Reduce Motion:** Animations can be turned off
- **Consistent Layout:** Predictable navigation (ADHD-friendly)
- **Clear Information Architecture:** Know where you are
- **Special Interest Support:** Customize your resource collections
- **Time Management Tools:** Break tasks into steps
- **Routine Support:** Daily planning and tracking

#### 💭 Mental Health Support
- **Trauma-Informed Design:** Optional features, always in control
- **Mood Tracking:** Understand your patterns over time
- **Peer Support:** Connect safely with others
- **Wellness Hub:** Self-care resources available
- **Crisis Resources:** 24/7 support links integrated
- **Privacy Controls:** Your mental health data stays private

### Machine Learning That Understands Disability

Our AI doesn't just serve everyone the same. It learns:

- **Your disability type** - Customize features for your specific needs
- **Your energy patterns** - Predict when you'll have capacity
- **Your communication style** - Text, voice, visual, or mixed
- **Your accessibility tools** - Screen reader? Adjust automatically
- **Your pain/symptom patterns** - Suggest breaks when needed
- **Your preferences** - Remember what works for you

### Real-World Accessibility Examples

**Marcus uses a screen reader (blindness):**
> The entire app works perfectly with JAWS. All buttons announce their purpose. Images have descriptions. Lists are properly marked up. He navigates via keyboard alone. The app says "New email received" instead of just playing a sound.

**Priya has ADHD and dyslexia:**
> She uses OpenDyslexic font with 3 pixels letter spacing and mint overlay (Irlen support). The app remembers these settings. She uses simplified mode to reduce choices. Auto-save means she never loses notes mid-thought. The Disability Wizard suggests time-blocking tools perfect for ADHD.

**David has chronic pain (physical disability):**
> Energy Coins help him plan realistic days. Voice input means he doesn't have to type when his hands hurt. Large buttons are easier to tap. The app predicts his pain patterns and suggests rest times.

**Sierra is Deaf:**
> All videos have captions. Notifications show as visual alerts. She communicates in the community using text. The app never requires voice.

### Technical Standards We Meet

- ✅ **WCAG 2.1 AA** (Web Content Accessibility Guidelines Level AA)
- ✅ **ADA Compliance** (Americans with Disabilities Act)
- ✅ **Section 508** (US federal accessibility standard)
- ✅ **AODA Compliance** (Accessibility for Ontarians with Disabilities Act)
- ✅ **Canadian Accessibility Standards** (CAP - in development)

### What "Accessible-First" Really Means

Traditional approach: Build it, then add accessibility  
**Our approach:** Accessibility is the foundation

This means:
1. **Design for disability first** - Not as an afterthought
2. **Test with real users** - People actually using assistive tech
3. **Iterate based on feedback** - Continuous improvement
4. **Privacy as default** - Not opt-in
5. **Redundant communication** - Text + visual + audio when relevant

### Accessibility Settings - Your Control

[Open Accessibility Settings →](/accessibility-settings)

Customize:
- Font size, family, spacing
- Color contrast and overlays  
- Motion and animation
- Sound and vibration
- Language and reading aids
- Input methods (touch, voice, keyboard)
- Simplification levels

### Get Support

- [Accessibility Walkthrough →](/accessibility-walkthrough) - Step-by-step setup
- [Accessibility FAQ →](/faq#accessibility) - Common questions
- [Video Tutorials →](/tutorials) - See features in action
- [Contact Support →](/contact) - Reach out directly

---

**Disability inclusion isn't a feature. It's who we are. Every disabled person deserves tools built for them.**

[Try 3mpwrApp →](/features)
`
  },
  {
    title: 'Tool Highlight: Master Letter Generator - 22 Professional Templates',
    type: 'roundup',
    day: 1, // Monday
    excerpt: 'Stop struggling with legal letters. The Master Letter Generator creates professional, personalized letters for workplace, benefits, and legal issues.',
    content: `
## Never Write Another Legal Letter From Scratch

The Master Letter Generator in 3mpwrApp does the hard work for you—creating professional, legally-sound letters in minutes.

### What's Included?

22 ready-to-use letter templates:
- 6 workplace & accommodation letters
- 7 benefits & disability program letters
- 5 legal & appeals letters
- 4 administrative & documentation letters

### How It Works

1. **Choose your letter type** - Browse by category or search
2. **Answer simple questions** - 5-10 questions about your situation
3. **Review the letter** - App generates a professional, personalized version
4. **Customize if needed** - Edit and adjust tone
5. **Save & share** - Download, print, or email directly
6. **Keep a copy** - Automatically saved to your Evidence Locker

### Why This Matters

✅ **Professional letters are more likely to be approved**  
✅ **You don't have to be a lawyer** - Templates do the work  
✅ **Save time** - Generate in 5 minutes instead of hours  
✅ **Consistent record** - Formal documentation protects you  
✅ **Reduce stress** - Know you've said it right  

### Success Stories

> "The app created a professional letter. My employer took it seriously and we got the accommodation approved in 3 weeks."  
> — Jordan, Ontario

> "The letter was so well-written that it impressed the adjudicator. I think it actually helped my case."  
> — Sam, British Columbia

### Get Started Right Now

[Open Letter Generator →](/resources#letter-generator)  
[See all 22 templates →](/resources#letters)  
[Read the complete guide →](/user-guide#master-letter)

---

**Professional letters don't require a lawyer. They require the right tool.**

[Create Your First Letter Today →](/resources)
`
  }
];

// Generate article
function generateArticle(template) {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  
  // Find next occurrence of target day (template.day)
  const daysUntilTarget = (template.day - dayOfWeek + 7) % 7 || 7;
  const targetDate = new Date(now.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000);
  const dateStr = toISODate(targetDate);
  
  // Check if already exists
  const filename = `${dateStr}-3mpwrapp-${template.type}.md`;
  const filepath = path.join(process.cwd(), '_posts', filename);
  
  if (fs.existsSync(filepath)) {
    console.log(`[article-gen] Article already exists: ${filename}`);
    return null;
  }
  
  // Build frontmatter
  const frontmatter = [
    '---',
    'layout: post',
    `title: "${template.title}"`,
    `date: ${dateStr}T09:00:00+00:00`,
    'tags: [3mpwrapp, features, community, guide]',
    'categories: [news, updates, education]',
    `excerpt: "${template.excerpt}"`,
    '---',
    '',
  ];
  
  const content = [...frontmatter, template.content.trim()].join('\n');
  
  try {
    fs.mkdirSync(path.join(process.cwd(), '_posts'), { recursive: true });
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`[article-gen] Created: ${filename}`);
    return { filename, title: template.title, type: template.type };
  } catch (e) {
    console.error(`[article-gen] Failed to create ${filename}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('[3mpwrapp-articles] Starting article generation...');
  
  const forceAll = process.env.FORCE_ALL === '1';
  const debug = process.env.DEBUG_ARTICLES === '1';
  
  const generated = [];
  
  // Generate articles
  for (const template of articleTemplates) {
    if (forceAll || Math.random() < 0.5) { // 50% chance per run to generate a template
      const result = generateArticle(template);
      if (result) {
        generated.push(result);
      }
    }
  }
  
  if (generated.length > 0) {
    console.log(`[3mpwrapp-articles] ✓ Generated ${generated.length} article(s)`);
    for (const a of generated) {
      console.log(`  - ${a.title}`);
    }
  } else {
    console.log('[3mpwrapp-articles] No new articles needed today');
  }
  
  console.log('[3mpwrapp-articles] Complete');
}

main().catch(err => {
  console.error('[3mpwrapp-articles] Error:', err.message);
  process.exit(1);
});
