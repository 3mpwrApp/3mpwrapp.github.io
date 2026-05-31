---
layout: post
title: "Dev Diary: Building Offline-First: Network Access Should Never Be Required"
date: 2026-05-31 00:00:00 +0000
tags: [dev-diary, development, behind-the-scenes]
categories: [dev-diary]
excerpt: "How and why 3mpwrApp was built to work completely without internet - and what we learned along the way"
---
# Dev Diary: Building Offline-First: Network Access Should Never Be Required
*A behind-the-scenes look at how we build 3mpwrApp.*
---
A disability app that requires consistent internet access systematically excludes the people who need it most.
Consider where chronic illness and disability intersect with geography. Rural and remote communities in Canada have both higher disability rates and significantly worse internet infrastructure. Optimizing for urban, connected users would have been a betrayal of our mission.
The offline-first mandate created real technical challenges - every feature had to be audited for what it looks like without a network call. The upload queue was particularly complex: we needed silent, automatic retry logic that never lost data and never frustrated users.
---
## Technical Details
- AsyncStorage provides local-first persistence across all platforms
- Evidence upload queue retries silently when connectivity returns
- All crisis resources are pre-loaded to device memory at install
- Firestore offline mode syncs transparently when connection resumes
- The principle: if it requires internet, it isn't truly accessible
---
## In Practice
- A user in a rural area with no signal can access their full Evidence Locker
- Crisis resources load instantly because they are committed to local storage
- Upload queues retry on their own - users never need to remember to re-upload
---
## What We Learned
- Many of the most vulnerable community members live in rural areas with unreliable connectivity
- Offline-first is not a performance optimization - it is an equity decision
- Designing for offline means every feature had to work as a standalone, self-contained unit
---
## Follow Our Development
We believe in building in public - the community we serve has been failed by opaque institutions too many times.
- a [GitHub](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)
- Ya [Join Beta Testing](/app-waitlist/)
- Y [Community Discussion](/community/)