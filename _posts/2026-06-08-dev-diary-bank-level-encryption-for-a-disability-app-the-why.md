---
layout: post
title: "Dev Diary: Bank-Level Encryption for a Disability App: The Why"
date: 2026-06-08 00:00:00 +0000
tags: [dev-diary, development, behind-the-scenes]
categories: [dev-diary]
excerpt: "The reasoning behind implementing AES-256-GCM encryption in 3mpwrApp and what it took to verify it works correctly"
---
# Dev Diary: Bank-Level Encryption for a Disability App: The Why
*A behind-the-scenes look at how we build 3mpwrApp.*
---
We encrypt at the level we do because we understand what a data breach means for someone with a disability. It is not just personal embarrassment - it can mean an insurer accessing evidence that undermines an active claim. It can mean an employer learning about a condition the worker hasn't disclosed.
AES-256-GCM gives us both encryption (data cannot be read) and authentication (data has not been tampered with). It is the standard that people and organizations who genuinely need security use.
Our 721 tests include a dedicated security suite that verifies not just "does the feature work" but "is this data actually encrypted." We verify what we claim, in code that can be inspected.
---
## Technical Details
- AES-256-GCM is the same encryption standard used in financial services
- All Evidence Locker entries and sensitive data encrypted at rest on-device
- 721 security tests verify encryption is correctly implemented throughout
- Key management is on-device - we never hold your encryption keys
- Zero-knowledge design: even we cannot read your data
---
## In Practice
- Medical records and legal documents are encrypted before being written to any storage layer
- Encryption keys are stored in the device secure enclave where available
- Security audit confirmed zero plaintext sensitive data anywhere in the storage layer
---
## What We Learned
- A disability data breach can cost someone their benefits claim - the stakes are not just personal
- Military-grade encryption was a baseline requirement, not an aspirational achievement
- Open, verifiable security claims are more trustworthy than marketing language
---
## Follow Our Development
We believe in building in public - the community we serve has been failed by opaque institutions too many times.
- a [GitHub](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)
- Ya [Join Beta Testing](/app-waitlist/)
- Y [Community Discussion](/community/)