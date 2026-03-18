#!/usr/bin/env python3
"""
Complete app-tour.md Update - SETTINGS & ONBOARDING
This script completes the final 78 images (42 settings + 36 onboarding)
Based on established patterns from the first 94 images
"""

import re
import os

BASE_PATH = "d:/1-EmpowrApp/empowrapp-site/3mpwrapp.github.io-main/3mpwrapp.github.io-main"
APP_TOUR_PATH = os.path.join(BASE_PATH, "app-tour.md")

print("="*60)
print("📝 COMPLETING APP-TOUR.MD UPDATE")
print("="*60) 
print(f"Progress: 94/172 images complete (54.7%)")
print(f"Remaining: 78 images (SETTINGS: 42, ONBOARDING: 36)\n")

# Read current content
with open(APP_TOUR_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# SETTINGS section (42 images) - Complete HTML
settings_html = '''<section id="settings" class="category-section">
  <h2>⚙️ Settings & Accessibility</h2>
  <p class="category-desc">Comprehensive accessibility options from WCAG AAA compliance to neurodivergent support, cultural safety, complexity modes, BYOC data ownership, and 42 powerful customization features.</p>
  
  <div class="preview-grid">
    <!-- Basic Settings -->
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Language settings">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings1-LanguageNotification.png" alt="Settings for language selection and notification preferences - multilingual accessibility - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Language & Notifications | <a href="/user-guide/#accessibility-settings">Configure</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Quiet hours">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings2-QuietHoursAlertTypes.png" alt="Settings quiet hours configuration and alert type customization - cognitive accessibility - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Quiet Hours | <a href="/user-guide/#accessibility-settings">Quiet</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Complexity modes">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings3-PushNotificationTypes-ComplexityModes.png" alt="Settings push notification types and complexity mode selection (simple, standard, power user) - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Notifications & Complexity | <a href="/user-guide/#complexity-mode">Modes</a></div>
    </div>
    
    <!-- Complexity Modes -->
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Bad Day Mode & Simple">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings-ComplexityModes1-BadDayModeANDSimpleMode.png" alt="Complexity modes: Bad Day Mode (5 features) and Simple Mode (20 features) for cognitive accessibility - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Bad Day & Simple Mode | <a href="/user-guide/#complexity-mode">Cognitive</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Standard & Power User">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings-ComplexityModes2- StandardANDPowerUserMode.png" alt="Complexity modes: Standard (50 features) and Power User (150+ features) for advanced advocacy - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Standard & Power User | <a href="/user-guide/#complexity-mode">Advanced</a></div>
    </div>
    
    <!-- More Settings -->
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Text size & format">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings1-Accessibility-TextSize-PreferredResourceFormat.png" alt="More settings accessibility options including text size, preferred format, and reading level - WCAG AAA - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Text Size & Format | <a href="/user-guide/#accessibility-settings">WCAG AAA</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cultural safety">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings2-QuickSettings-CulturalANDLanguage.png" alt="More settings quick access to cultural safety, language options, and personalization - 3mpwrApp diversity" loading="lazy">
      </a>
      <div class="caption">Cultural Safety | <a href="/beta-guide/#priority-february-2026-personalization">Culture</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#encryption?utm_source=app_tour&utm_campaign=visual_refresh" title="Privacy & security">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings3-PrivacySecurity-RequirePasscodeFeature.png" alt="More settings privacy and security including passcode protection and encryption options - 3mpwrApp data safety" loading="lazy">
      </a>
      <div class="caption">Privacy & Security | <a href="/user-guide/#encryption">Secure</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#data-ownership?utm_source=app_tour&utm_campaign=visual_refresh" title="Data management">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings4-AutoLockTimeout-Analytics-ErrorReporting-SaveSearchHistory-DataManagement.png" alt="More settings auto-lock timeout, analytics opt-in, error reporting, search history, and data management - 3mpwrApp privacy" loading="lazy">
      </a>
      <div class="caption">Data Management | <a href="/user-guide/#data-ownership">Control</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#where-to-send-feedback?utm_source=app_tour&utm_campaign=visual_refresh" title="Help & support">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings6-HelpANDSupport.png" alt="More settings help and support options with tutorials, FAQs, and contact channels - 3mpwrApp assistance" loading="lazy">
      </a>
      <div class="caption">Help & Support | <a href="/beta-guide/#where-to-send-feedback">Contact</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Troubleshooting">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings7-TroubleshootingANDHelp1.png" alt="More settings troubleshooting guide for common issues and bug fixes - 3mpwrApp support" loading="lazy">
      </a>
      <div class="caption">Troubleshooting Guide | <a href="/beta-guide/#frequently-asked-questions">FAQ</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Tutorials">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings8-TroubleshootingANDHelp2.png" alt="More settings help resources with video tutorials and step-by-step guides - 3mpwrApp learning" loading="lazy">
      </a>
      <div class="caption">Help Resources | <a href="/user-guide/#accessibility-settings">Tutorials</a></div>
    </div>
    <div class="preview-card">
      <a href="/beta-guide/#privacy--safety?utm_source=app_tour&utm_campaign=visual_refresh" title="Terms & policies">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings9-TermsANDPolicies.png" alt="More settings access to terms of service, privacy policy, and legal disclaimers - 3mpwrApp transparency" loading="lazy">
      </a>
      <div class="caption">Terms & Policies | <a href="/beta-guide/#privacy--safety">Legal</a></div>
    </div>
    
    <!--  Advanced Accessibility (6 images) -->
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="WCAG AAA overview">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility1.png" alt="Advanced accessibility settings overview with WCAG AAA compliance options - 3mpwrApp inclusive design" loading="lazy">
      </a>
      <div class="caption">Advanced Accessibility | <a href="/user-guide/#accessibility-settings">WCAG AAA</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Visual settings">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility2.png" alt="Advanced accessibility visual settings: contrast, color blindness modes, font options - 3mpwrApp vision" loading="lazy">
      </a>
      <div class="caption">Visual Accessibility | <a href="/user-guide/#accessibility-settings">Vision</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Motor settings">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility3.png" alt="Advanced accessibility motor settings: touch targets, dwell time, switch control - 3mpwrApp physical disabilities" loading="lazy">
      </a>
      <div class="caption">Motor Accessibility | <a href="/user-guide/#accessibility-settings">Motor</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cognitive settings">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility4.png" alt="Advanced accessibility cognitive settings: simplified language, reduced motion, focus indicators - 3mpwrApp neurodivergent" loading="lazy">
      </a>
      <div class="caption">Cognitive Accessibility | <a href="/user-guide/#accessibility-settings">Cognitive</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Auditory settings">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility5.png" alt="Advanced accessibility auditory settings: captions, visual alerts, haptic feedback - 3mpwrApp hearing" loading="lazy">
      </a>
      <div class="caption">Auditory Accessibility | <a href="/user-guide/#accessibility-settings">Hearing</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#personalization-setup?utm_source=app_tour&utm_campaign=visual_refresh" title="Custom presets">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessib

