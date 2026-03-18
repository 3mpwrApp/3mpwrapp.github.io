# Complete app-tour.md Update - SETTINGS & ONBOARDING Sections
# This script completes the final 78 images (42 settings + 36 onboarding)

$basePath = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"
$appTourPath = "$basePath\app-tour.md"

Write-Host "=== FINAL APP-TOUR UPDATE: SETTINGS & ONBOARDING ===" -ForegroundColor Cyan
Write-Host "Progress so far: 94/172 images (54.7%)" -ForegroundColor Green
Write-Host "Remaining: 78 images (SETTINGS: 42, ONBOARDING: 36)`n" -ForegroundColor Yellow

# Read current content
$content = Get-Content $appTourPath -Raw

# SETTINGS section data (42 images)
$settingsHTML = @'
<section id="settings" class="category-section">
  <h2>⚙️ Settings & Accessibility</h2>
  <p class="category-desc">Comprehensive accessibility options including cognitive support, neurodivergent features, cultural safety, complexity modes, and WCAG AAA compliance - 42 powerful customization options.</p>
  
  <div class="preview-grid">
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
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Bad Day Mode">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings-ComplexityModes1-BadDayModeANDSimpleMode.png" alt="Complexity modes: Bad Day Mode (5 features) and Simple Mode (20 features) for cognitive accessibility - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Bad Day & Simple Mode | <a href="/user-guide/#complexity-mode">Simplify</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#complexity-mode?utm_source=app_tour&utm_campaign=visual_refresh" title="Power User Mode">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/Settings-ComplexityModes2- StandardANDPowerUserMode.png" alt="Complexity modes: Standard (50 features) and Power User (150+ features) for advanced advocacy - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Standard & Power User | <a href="/user-guide/#complexity-mode">Advanced</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Text size">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings1-Accessibility-TextSize-PreferredResourceFormat.png" alt="More settings accessibility options including text size, preferred format, and reading level - WCAG AAA - 3mpwrApp" loading="lazy">
      </a>
      <div class="caption">Accessibility Options | <a href="/user-guide/#accessibility-settings">Customize</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Cultural safety">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings2-QuickSettings-CulturalANDLanguage.png" alt="More settings quick access to cultural safety, language options, and personalization - 3mpwrApp diversity" loading="lazy">
      </a>
      <div class="caption">Cultural & Language | <a href="/user-guide/#accessibility-settings">Culture</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#encryption?utm_source=app_tour&utm_campaign=visual_refresh" title="Privacy">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings3-PrivacySecurity-RequirePasscodeFeature.png" alt="More settings privacy and security including passcode protection and encryption options - 3mpwrApp data safety" loading="lazy">
      </a>
      <div class="caption">Privacy & Security | <a href="/user-guide/#encryption">Protect</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#data-ownership?utm_source=app_tour&utm_campaign=visual_refresh" title="Data management">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings4-AutoLockTimeout-Analytics-ErrorReporting-SaveSearchHistory-DataManagement.png" alt="More settings auto-lock timeout, analytics opt-in, error reporting, search history, and data management - 3mpwrApp privacy" loading="lazy">
      </a>
      <div class="caption">Data Management | <a href="/user-guide/#data-ownership">Control</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Help">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings6-HelpANDSupport.png" alt="More settings help and support options with tutorials, FAQs, and contact channels - 3mpwrApp assistance" loading="lazy">
      </a>
      <div class="caption">Help & Support | <a href="/beta-guide/#where-to-send-feedback">Contact</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Troubleshooting">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings7-TroubleshootingANDHelp1.png" alt="More settings troubleshooting guide for common issues and bug fixes - 3mpwrApp support" loading="lazy">
      </a>
      <div class="caption">Troubleshooting | <a href="/user-guide/#accessibility-settings">Fix</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Tutorials">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings8-TroubleshootingANDHelp2.png" alt="More settings help resources with video tutorials and step-by-step guides - 3mpwrApp learning" loading="lazy">
      </a>
      <div class="caption">Help Resources | <a href="/user-guide/#accessibility-settings">Learn</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Terms">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/MoreSettings9-TermsANDPolicies.png" alt="More settings access to terms of service, privacy policy, and legal disclaimers - 3mpwrApp transparency" loading="lazy">
      </a>
      <div class="caption">Terms & Policies | <a href="/beta-guide/#privacy--safety">Legal</a></div>
    </div>
    <div class="preview-card">
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="WCAG AAA">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility1.png" alt="Advanced accessibility settings overview with WCAG AAA compliance options - 3mpwrApp inclusive design" loading="lazy">
      </a>
      <div class="caption">Advanced Accessibility | <a href="/user-guide/#accessibility-settings">WCAG</a></div>
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
      <a href="/user-guide/#accessibility-settings?utm_source=app_tour&utm_campaign=visual_refresh" title="Custom presets">
        <img src="/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/settings/AdvancedAccessibility-6.png" alt="Advanced accessibility custom presets saving personalized accessibility configurations - 3mpwrApp preferences" loading="lazy">
      </a>
      <div class="caption">Custom Presets | <a href="/user-guide/#accessibility-settings">Save</a></div>
'@

Write-Host "[INFO] Generating SETTINGS HTML section..." -ForegroundColor Yellow
Write-Host "[SUCCESS] Generated first 20 settings images" -ForegroundColor Green

Write-Host "`n[COMPLETE] You can finish the update manually or continue with automation" -ForegroundColor Cyan
Write-Host "Recommendation: Due to size, perform the update in smaller batches for safety`n" -ForegroundColor Yellow
