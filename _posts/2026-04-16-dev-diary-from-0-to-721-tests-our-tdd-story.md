---
layout: post
title: "Dev Diary: From 0 to 721 Tests: Our TDD Story"
date: 2026-04-16 00:00:00 +0000
tags: [dev-diary-updates, development, behind-the-scenes]
categories: [dev-diary-updates]
excerpt: "How 3mpwrApp grew from a prototype to a production codebase with 721 tests across 121 suites - and why test count is a side-effect, not the goal"
---

# Dev Diary: From 0 to 721 Tests: Our TDD Story

*A behind-the-scenes look at how we build 3mpwrApp.*

---

Test-driven development means writing the test before writing the code - articulating exactly what you want it to do, in a verifiable way, before a single implementation line exists.

We chose TDD because this app handles sensitive legal and medical data, crisis support, and accessibility requirements that non-disabled developers might not notice if they broke. We needed a way to verify that the things that matter most to our community kept working.

721 is not a number we targeted. It is the number you arrive at when you write a test for every meaningful behaviour in the codebase. Test coverage of critical paths was the commitment - the count followed from that.

---

## Technical Details

- 721 tests across 121 suites - zero test debt intentionally accumulated
- Test-driven development used for every critical path in the codebase
- Dedicated security test suite verifies encryption implementation is correct
- Accessibility tested both programmatically and by community testers
- 0 ESLint errors, 0 TypeScript errors maintained as a non-negotiable standard

---

## In Practice

- The Evidence Locker has 23 dedicated tests verifying no plaintext reaches storage
- Letter Generator templates tested against output format and legal language requirements
- Accessibility labels tested in CI to catch regressions before human testers see them

---

## What We Learned

- A regression in a feature a disabled person depends on can cause real harm - tests prevent that
- High test count means nothing without test quality - our tests verify real behaviour
- TDD forces you to articulate exactly what you want code to do before you write it

---

## Follow Our Development

We believe in building in public - the community we serve has been failed by opaque institutions too many times.

-  [GitHub](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)
-  [Join Beta Testing](/app-waitlist/)
-  [Community Discussion](/community/)
