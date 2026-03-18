#!/usr/bin/env python3
"""Update app-tour.md with all new screenshots, SEO alt text, and deep links"""

import re
import json

# Define all category data based on APP_TOUR_COMPLETE_UPDATE.md
CATEGORIES = {
    "advocacy": {
        "title": "⚖️ Advocacy Hub",
        "desc": "AI-powered tools for building your case, managing evidence, finding legal help, and generating professional letters.",
        "primary_link": "/user-guide/#legal-action-hub",
        "images": [
            {"file": "AdvocacyHub1-WhatDoYouNeedHelpWithToday.png", "caption": "Advocacy Hub Dashboard", "alt": "Advocacy Hub main dashboard asking 'What do you need help with today?' - personalized legal support for injured workers - 3mpwrApp", "link": "/user-guide/#legal-action-hub"},
            {"file": "AdvocacyHub2-Jusrisdiction-AppealDeadlineCalculator.png", "caption": "Jurisdiction & Deadlines", "alt": "Jurisdiction selection and appeal deadline calculator - track critical legal deadlines for workers compensation - 3mpwrApp", "link": "/user-guide/#appeal-command-center"},
            {"file": "AdvocacyHub3-FormHelper-SearchTools.png", "caption": "Form Helper & Search", "alt": "Form helper and search tools for navigating complex legal documents - disability rights advocacy - 3mpwrApp", "link": "/user-guide/#ai-advocacy-suite"},
            {"file": "AdvocacyHub4-MainHubs-QuickTools.png", "caption": "Main Hubs & Quick Access", "alt": "Main advocacy hubs with quick tools for evidence, appeals, and legal action - workers comp case management - 3mpwrApp", "link": "/user-guide/#legal-action-hub"},
            {"file": "AIAdvocacySuite.png", "caption": "AI Advocacy Suite", "alt": "Complete AI Advocacy Suite with 6 AI-powered tools - document translator, form helper, letter generator - 3mpwrApp", "link": "/user-guide/#ai-advocacy-suite"},
            {"file": "AllyANDSupportNetwork.png", "caption": "Ally & Support Network", "alt": "Connect with allies and build your support network for disability advocacy - community organizing - 3mpwrApp", "link": "/user-guide/#community-hub"},
            {"file": "CollectiveLegalActionHub.png", "caption": "Collective Legal Action", "alt": "Collective Legal Action Hub for organizing group advocacy and class action support - workers rights - 3mpwrApp", "link": "/user-guide/#campaigns"},
            {"file": "EvidenceCommandCenter.png", "caption": "Evidence Command Center", "alt": "Evidence Command Center - encrypted document storage, timeline builder, voice memos for legal cases - 3mpwrApp", "link": "/user-guide/#evidence-command-center"},
            {"file": "LegalActionHub.png", "caption": "Legal Action Hub", "alt": "Legal Action Hub with 5 tabs - evidence, appeals, lawyers, case tracking, self-advocacy coach - 3mpwrApp", "link": "/user-guide/#legal-action-hub"},
            {"file": "SelfAdvocacyCoach.png", "caption": "Self-Advocacy Coach", "alt": "Self-Advocacy Coach providing guidance and templates for representing yourself - disability rights - 3mpwrApp", "link": "/user-guide/#ai-advocacy-suite"},
        ]
    },
    "wellness": {
        "title": "💚 Wellness Center",
        "desc": "Comprehensive health tracking, mental wellness support, movement guidance, and crisis resources with 41 tools across 6 categories.",
        "primary_link": "/user-guide/#wellness-hub",
        "images": [
            {"file": "Wellness1-Tab.png", "caption": "Wellness Hub - Main Interface", "alt": "Wellness Hub main interface with 41 tools across 6 categories - chronic pain management, fatigue tracking, mental health support - 3mpwrApp", "link": "/user-guide/#wellness-hub"},
            {"file": "Wellness2-12MentalHealthCrisisTools.png", "caption": "Mental Health Crisis Tools", "alt": "12 mental health crisis intervention tools - DBT distraction games, breathing exercises, emergency contacts - 3mpwrApp wellness", "link": "/user-guide/#wellness-hub"},
            {"file": "Wellness3-EnergyMoodDashboard.png", "caption": "Energy & Mood Dashboard", "alt": "Energy and mood dashboard with AI-enhanced tracking and pattern recognition - spoon theory digital management - 3mpwrApp", "link": "/user-guide/#mood-tracker-20"},
            {"file": "Wellness4-EmotionalFirstAid1-CrisisIntervention-TripleTapEmergencyCrisisContact.png", "caption": "Emotional First Aid - Crisis", "alt": "Emotional First Aid crisis intervention with triple-tap emergency contact activation - mental health support - 3mpwrApp", "link": "/user-guide/#wellness-hub"},
            {"file": "Wellness5-EmotionalFirstAid2-DBTDistractionGames.png", "caption": "Emotional First Aid - DBT", "alt": "Emotional First Aid DBT distraction games for managing anxiety and panic - dialectical behavior therapy tools - 3mpwrApp", "link": "/user-guide/#wellness-hub"},
        ]
    }
}

def generate_section_html(category_id, data):
    """Generate HTML for a category section"""
    html = f'''
<section id="{category_id}" class="category-section">
  <h2>{data["title"]}</h2>
  <p class="category-desc">{data["desc"]}</p>
  
  <div class="preview-grid">
'''
    
    for img in data["images"]:
        img_path = f"/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/{category_id}/{img['file']}"
        utm = "?utm_source=app_tour&utm_campaign=visual_refresh"
        beta_link = "/beta-guide/#what-to-test"
        
        html += f'''    <div class="preview-card">
      <a href="{img['link']}{utm}" title="Learn more about this feature">
        <img src="{img_path}" alt="{img['alt']}" loading="lazy">
      </a>
      <div class="caption">{img['caption']} | <a href="{beta_link}">Beta</a></div>
    </div>
'''
    
    html += '''  </div>
</section>'''
    
    return html

# Read current app-tour.md
with open('d:/1-EmpowrApp/empowrapp-site/3mpwrapp.github.io-main/3mpwrapp.github.io-main/app-tour.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Update each section
for category_id, data in CATEGORIES.items():
    new_html = generate_section_html(category_id, data)
    
    # Find and replace the section
    pattern = rf'<section id="{category_id}" class="category-section">.*?</section>'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, new_html.strip(), content, flags=re.DOTALL)
        print(f"✅ Updated {category_id.upper()} section ({len(data['images'])} images)")
    else:
        print(f"⚠️  Could not find {category_id} section")

# Write updated content
with open('d:/1-EmpowrApp/empowrapp-site/3mpwrapp.github.io-main/3mpwrapp.github.io-main/app-tour.md', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print("\n✅ app-tour.md updated successfully!")
print("📝 Sections updated so far: HOME (manual), ADVOCACY, WELLNESS")
print("⏭️  Remaining: RESOURCES (38), RESEARCH (5), CAMPAIGNS (2), EVENTS (6), COMMUNITY (5), PROFILE (10), SETTINGS (42), ONBOARDING (36)")
