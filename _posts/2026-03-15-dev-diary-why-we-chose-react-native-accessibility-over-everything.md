---
layout: post
title: "Dev Diary: Why We Chose React Native: Accessibility Over Everything"
date: 2026-03-15 00:00:00 +0000
tags: [dev-diary, development, behind-the-scenes]
categories: [dev-diary]
excerpt: "The technical and ethical reasoning behind choosing React Native as the foundation for 3mpwrApp"
---

# Dev Diary: Why We Chose React Native: Accessibility Over Everything

*A behind-the-scenes look at how we build 3mpwrApp.*

* * *

When we started 3mpwrApp, we had a hard constraint: the framework had to support real, deep accessibility Ã¢â‚¬â€ VoiceOver, TalkBack, Switch Access, and the full spectrum of assistive technology Ã¢â‚¬â€ from day one, not as an afterthought.

React Native was the answer because it exposes the native accessibility APIs of both iOS and Android directly. A web-based hybrid approach would have meant fighting the underlying layer. React Native meant working with it.

The Expo ecosystem accelerated this enormously. Expo Router's file-based navigation is inherently screen-reader-transparent. The community has deep accessibility expertise. We didn't have to build the foundations Ã¢â‚¬â€ we stood on good ones.

* * *

## Technical Details

- React Native exposes native VoiceOver, TalkBack, and Switch Access APIs directly
- One codebase for iOS, Android, and web prevents accessibility quality divergence
- Expo Router's file-based navigation is transparent to screen readers by design
- React Native's animation system supports reduced motion preferences natively
- Expo's a11y linting caught issues before any human tester saw them

* * *

## In Practice

- VoiceOver and TalkBack integration required native API access that web-only frameworks couldn't provide
- Switch Access compatibility was built in from day one using React Native's focus management APIs
- Accessibility scanning in CI caught regressions before they reached beta testers

* * *

## What We Learned

- Framework choice is an accessibility decision, not just a technical preference
- Building cross-platform from the start prevents future divergence in accessibility quality
- The open-source React Native community's accessibility depth accelerated our work enormously

* * *

## Follow Our Development

We believe in building in public Ã¢â‚¬â€ the community we serve has been failed by opaque institutions too many times.

- Ã¢Â­Â [GitHub](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)
- Ã°Å¸Â§Âª [Join Beta Testing](/app-waitlist/)
- Ã°Å¸â€™Â¬ [Community Discussion](/community/)