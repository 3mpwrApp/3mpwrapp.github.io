---
layout: post
title: "Feature Spotlight: Claim Journey Visualizer — See Your Case Through the System"
date: 2026-05-04 00:00:00 +0000
tags: [features, spotlight, visualizations, data-analysis, injured-workers, claim-navigation]
categories: [features]
excerpt: When you can see exactly where your claim stands, what has happened, and what comes next, you stop falling through cracks—and start navigating with confidence.
---

# Feature Spotlight: Claim Journey Visualizer — See Your Case Through the System

**Selected Feature:** Claim Journey Visualizer
**Reason for selection:** The Visualizations stage of the 3mpwrApp flywheel has no dedicated feature spotlight. All prior spotlights focus on data collection, analysis tools, knowledge base content, templates, or community features—but none yet illuminates how raw data becomes a navigable picture of a person's claim. This is the highest-impact gap to close.

---

## The Problem

Injured workers and people navigating disability claims face a system designed to be opaque. Submissions go in. Decisions come back—months later, with no explanation of what happened in between. Deadlines exist in policy documents most people never read. Denial letters reference sections of legislation without explaining what that means for next steps.

The result is predictable: people miss appeal windows because they did not know they were open. They re-submit evidence already in the file because they cannot see what has been received. They attend hearings without understanding how far along in the process they actually are.

Families and caregivers carrying additional coordination load face the same gap. Advocates trying to support multiple clients simultaneously cannot see the systemic patterns across cases without manually assembling timelines from scattered documents and notes.

This is not a personal failure. It is a gap in the system. Complex multi-stage processes—WSIB claims, CPP-D applications, HRTO filings, ODSP appeals—were not designed with the claimant's visibility in mind. They were designed for administrators.

The result is that people do not fall through the cracks because their cases are weak. They fall through the cracks because they could not see the cracks.

---

## The Feature

**What it does:**
The Claim Journey Visualizer renders a person's entire claim as an interactive, navigable timeline. Every recorded event—medical appointment, form submission, employer communication, denial letter, evidence upload, appeal filing, tribunal hearing date—is plotted in sequence on a single visual map of the case.

**How it works:**
The Visualizer pulls from data already captured in 3mpwrApp:

- Dates and notes logged in the Evidence Locker
- Deadlines tracked in the Deadlines & Reminders module
- Medical events from the Symptom/Pain Tracker and Medication Tracker
- Documents generated through the Master Letter Generator and Letter Templates
- Benefits status from the Benefits Tracker
- Milestones added manually by the user or their advocate

These inputs are assembled into a sequential visual timeline with three layers:

1. **What happened** — a chronological log of every recorded event, categorized by type (medical, administrative, legal, communications)
2. **Where you are now** — a highlighted "current position" marker showing the active stage of the process
3. **What comes next** — upcoming deadlines, expected decision windows, and pending steps, drawn from both user input and the knowledge base

The timeline is interactive: each event can be tapped or clicked to expand full notes, attached documents, and any linked templates or guides relevant to that stage.

**Who uses it:**
- Injured workers building awareness of where their WSIB or WCB claim stands
- Disabled individuals navigating multi-stage CPP-D, ODSP, or provincial benefit applications
- Families coordinating care and claims on behalf of a loved one
- Advocates managing caseloads who need a fast visual summary of each client's position
- Anyone preparing for a hearing, review, or appeal who needs to reconstruct a chronology

---

## Flywheel Integration

**Flywheel Stage(s):** Visualizations — with strong links to Analysis / Pattern Recognition and Real-World Impact

**Input → Output flow:**

| Stage | What Happens |
|-------|-------------|
| **Data Collection** | Trackers, Evidence Locker, Deadlines, and Documents feed raw events into the system |
| **Analysis / Pattern Recognition** | Events are categorized, sorted, and gap-detected — missing deadlines or unlogged periods surface automatically |
| **Knowledge Base** | The visualizer links each timeline stage to relevant policy summaries, appeal guides, and procedural timelines from the knowledge base |
| **Templates / Guides** | At each active stage, the appropriate template or checklist is surfaced — the right tool at the right point in the process |
| **Visualizations** | ← **This feature** — raw data becomes a navigable picture of the whole claim |
| **Real-World Impact** | Users arrive at hearings, reviews, and appointments with a clear, documented picture of their history — reducing overwhelm and increasing preparation quality |

**How it strengthens the next stage:**
By making the claim visible as a whole, the Visualizer creates the condition for Real-World Impact. Advocates can use exported timelines in tribunal submissions. Families can quickly brief a new legal representative. Workers can identify specific gaps—a period where symptoms were severe but no documentation exists—and act to address them before a hearing.

---

## In Practice

**Example scenario (illustrative only):**

A person has been navigating a WSIB claim for eleven months following a workplace injury. In that time, they have logged symptoms, uploaded medical records, tracked two denial letters, and drafted an appeal letter through the app.

Without a visual overview, they know roughly what has happened—but cannot quickly answer questions like: How long did the initial review take? Were there gaps in my medical documentation during the third and fourth months? What is the appeal deadline based on the date of the most recent denial?

Opening the Claim Journey Visualizer, they see a horizontal timeline from the date of their initial report to the present. Each event appears as a labelled node: Initial Report → Medical Assessment → First Decision → Denial → Appeal Filed → Awaiting Review. Gaps appear as unmarked stretches between nodes — in this case, a two-month gap in logged symptoms that coincides with the decision period. A tooltip surfaces: "No medical events recorded during this period. If symptoms were present, adding retroactive notes can strengthen your appeal record."

The upcoming deadline for requesting a higher-level review appears highlighted in amber: 14 days remaining. Tapping it opens the Request for Reconsideration template pre-populated with their case details.

They arrive at their next appointment knowing exactly where they stand in the process, what the gaps are, and what the next step requires.

---

## Why It Matters

Claims are lost in complexity more often than they are lost on merit.

The evidence often exists. The medical records are filed. The appeal grounds are valid. But when a person cannot see the shape of their own case, they cannot advocate effectively for themselves. They accept outcomes that should be challenged because they did not know a challenge window was open. They arrive at hearings under-prepared because they could not reconstruct their own timeline from scattered documents and memory.

For families and caregivers, the cognitive and logistical load of tracking a complex claim across months or years is compressive. The Claim Journey Visualizer reduces that load by externalizing the map of the process.

For advocates working with multiple clients, a fast visual summary of each case's current position is the difference between reactive and proactive support.

For the system as a whole: when people can see where they are, they make better decisions. They ask better questions. They submit more complete documentation. They meet deadlines. The Visualizer does not change the rules of the system—it changes how visible those rules are to the people most affected by them.

---

## What This Unlocks Next

**New capability:** Once users can see their full timeline, patterns across timelines become meaningful. Aggregate anonymized journey data enables the flywheel's community intelligence layer to identify where claimants most commonly experience delays, drop-offs, or documentation gaps — insights that flow back into the knowledge base as targeted guides.

**Future tools made possible:**
- Comparative timelines: "How does my claim duration compare to similar cases in the CanLII database?"
- Gap alerts: Automated detection of periods with no logged activity during decision windows
- Export for legal use: A formatted, printable timeline suitable for submission to a tribunal or inclusion in a legal brief
- Advocate dashboard: A multi-client view showing the active stage and next deadline for every person in a caseload

**How the flywheel strengthens:** The Visualizer closes the loop between data collection (what happened) and real-world impact (what to do). As more people use it, the patterns of where claims get stuck become visible at a system level—powering better guides, more targeted templates, and stronger collective knowledge for everyone who comes after.

---

## Closing System Statement

This is one part of the 3mpwrApp flywheel. As more experiences are captured and analyzed, they feed into a growing knowledge base—powering guides, templates, and visual tools that help injured workers, the disability community, families, and advocates navigate complex systems and avoid being overlooked.

---

## Learn More

- 📖 [Read the Complete User Guide](/user-guide/#claim-journey-visualizer)
- ✨ [Explore All Features](/features/)
- 🧪 [Join Beta Testing](/beta/)
- 📬 [Subscribe to Updates](/newsletter/)

---

## About 3mpwrApp

3mpwrApp is a community-driven platform built for injured workers and persons with disabilities across Canada. We provide practical tools, community support, and advocacy resources—all designed with accessibility, privacy, and cultural respect at the core.

**All features are:**
- ✅ Fully accessible (WCAG 2.2 AA+)
- 🔒 Privacy-first (local-first architecture)
- 🇨🇦 Canadian-focused (all provinces/territories)
- 🌐 Culturally inclusive (Indigenous languages supported)

---

## Social Posts

### Bluesky (284 characters)

Most injured workers don't know where their claim sits in the system—or that a deadline already passed. 3mpwrApp's Claim Journey Visualizer maps your case as an interactive timeline so you always know where you stand and what comes next. 🔗 https://3mpwrapp.pages.dev

---

### Mastodon (448 characters)

Most injured workers don't know where their claim stands in the system—or that a critical appeal deadline already passed. 3mpwrApp's Claim Journey Visualizer changes that. It maps your full case as an interactive timeline: medical events, submissions, denials, appeals, upcoming deadlines—all in one view. See the gaps. Know what's next. Because navigating a claim shouldn't require a law degree. 🔗 https://3mpwrapp.pages.dev
