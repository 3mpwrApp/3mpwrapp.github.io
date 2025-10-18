#!/bin/bash

# Manual Daily Curation Trigger
# This script uses the GitHub CLI to trigger the daily-curation workflow manually

# Prerequisites:
# 1. GitHub CLI (gh) installed: https://cli.github.com/
# 2. Authenticated with: gh auth login
# 3. In the repository directory

# Trigger with default settings (just post today's curation)
gh workflow run daily-curation.yml

echo "✅ Daily curation workflow triggered!"
echo "   Check status: gh run list"
echo "   Watch live: gh run watch"
echo ""
echo "📍 View results at: https://github.com/3mpowrApp/3mpwrapp.github.io/actions"
