# Update app-tour.md with new screenshots and SEO alt text
# This script updates all image references in app-tour.md

Write-Host "[INFO] Starting app-tour.md image update process..." -ForegroundColor Cyan

$basePath = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"
$appTourPath = "$basePath\app-tour.md"
$inventoryPath = "$basePath\screenshot-inventory.txt"
$updateDataPath = "$basePath\APP_TOUR_COMPLETE_UPDATE.md"

# Check files exist
if (-not (Test-Path $appTourPath)) {
    Write-Host "[ERROR] app-tour.md not found!" -ForegroundColor Red
    exit 1
}

# Read the current app-tour.md
$content = Get-Content $appTourPath -Raw

Write-Host "[SUCCESS] Read app-tour.md ($($ content.Length) characters)" -ForegroundColor Green

# Define image data for each category
$categories = @{
    home = @(
        @{ file="AIAssistantTab1-YouNext3Steps-RecommendedTools.png"; caption="AI Assistant - Next Steps"; alt="AI Assistant showing personalized next steps and recommended tools for disability advocacy -  3mpwrApp home dashboard"; link="/user-guide/#ai-advocacy-suite" }
        @{ file="AIAssistantTab2-HelpfulRessources-NeedMoreHelp.png"; caption="AI Assistant - Resources"; alt="AI Assistant providing helpful resources and additional support options - 3mpwrApp AI advocacy tools"; link="/user-guide/#ai-advocacy-suite" }        @{ file="HomeScreenTab1.png"; caption="Home Dashboard"; alt="3mpwrApp home dashboard with personalized widgets, quick actions, and AI assistant for disability rights advocacy"; link="/user-guide/#personalization-setup" }
        @{ file="HomeScreenTab2.png"; caption="Home Features"; alt="3mpwrApp home screen showing wellness tracking, evidence management, and community support features"; link="/user-guide/#personalization-setup" }
        @{ file="HomeCommunityHubSimpleMode.png"; caption="Community Hub - Simple Mode"; alt="Community Hub in simple complexity mode - accessible interface for disability community connection - 3mpwrApp"; link="/user-guide/#complexity-mode" }
        @{ file="HomeEvidenceVault-EvidenceCommandCenter.png"; caption="Evidence Vault"; alt="Quick access to Evidence Command Center from home - encrypted document storage for workers compensation cases - 3mpwrApp"; link="/user-guide/#evidence-command-center" }
        @{ file="HomeWellnessCommand.png"; caption="Wellness Command"; alt="Wellness Hub quick access with health tracking, mood logging, and energy management tools - 3mpwrApp"; link="/user-guide/#wellness-hub" }
        @{ file="Step1-StartYourFirstCase.png"; caption="Tutorial Step 1"; alt="Start your first workers compensation case - guided onboarding tutorial - 3mpwrApp beta"; link="/user-guide/#quick-start" }
        @{ file="Step2-UploadDocumentsIntoEvidenceCommandCenter.png"; caption="Tutorial Step 2"; alt="Upload and encrypt documents into Evidence Command Center - secure storage tutorial - 3mpwrApp"; link="/user-guide/#evidence-command-center" }
        @{ file="Step3-FindYourPeople-CommunityHub.png"; caption="Tutorial Step 3"; alt="Find your support community - join 24 disability support groups - 3mpwrApp community"; link="/user-guide/#community-hub" }
        @{ file="bg_emberforge.png"; caption="Theme: Ember Forge"; alt="Ember Forge theme background - customizable accessibility theme - 3mpwrApp personalization"; link="/user-guide/#personalization-setup" }
        @{ file="bg_LanternAscension.jpeg"; caption="Theme: Lantern Ascension"; alt="Lantern Ascension theme background - visual accessibility options - 3mpwrApp settings"; link="/user-guide/#accessibility-settings" }
        @{ file="bg_VerdantSanctuary.png"; caption="Theme: Verdant Sanctuary"; alt="Verdant Sanctuary theme background - calming visual design for neurodivergent users - 3mpwrApp accessibility"; link="/user-guide/#accessibility-settings" }
    )
}

# Generate HTML for HOME section
$homeHTML = @"
<section id="home" class="category-section">
  <h2>🏠 Home Dashboard</h2>
  <p class="category-desc">Your personalized command center with AI assistant, quick actions, and real-time updates.</p>
  
  <div class="preview-grid">
"@

foreach ($img in $categories.home) {
    $imgPath = "/assets/images/screenshots/1-Official3mpwrAppScreenshots/laptop/home/$($img.file)"
    $homeHTML += @"

    <div class="preview-card">
      <a href="$($img.link)?utm_source=app_tour&utm_medium=visual_refresh&utm_campaign=march2026" title="Learn more about this feature">
        <img src="$imgPath" alt="$($img.alt)" loading="lazy">
      </a>
      <div class="caption">$($img.caption) | <a href="/beta-guide/#priority-february-2026-personalization">Beta Testing</a></div>
    </div>
"@
}

$homeHTML += @"

  </div>
</section>
"@

# Find and replace HOME section
$pattern = '(?s)<section id="home" class="category-section">.*?</section>'
if ($content -match $pattern) {
    $content = $content -replace $pattern, $homeHTML
    Write-Host "[SUCCESS] Updated HOME section (13 images)" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Could not find HOME section to replace" -ForegroundColor Yellow
}

# Write updated content back
Set-Content -Path $appTourPath -Value $content -NoNewline -Encoding UTF8

Write-Host "`n[COMPLETE] app-tour.md HOME section updated!" -ForegroundColor Green
Write-Host "[INFO] Verify changes at: file:///$($appTourPath.Replace('\', '/'))" -ForegroundColor Cyan
