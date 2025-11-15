# Add New TBDIWSG Events (November 18, 25, December 2, 9, 2025)
# Generates JSON file for syncing to Firestore

$PROJECT_ID = "empowrapp"

Write-Host "Syncing 4 NEW TBDIWSG Events..." -ForegroundColor Cyan
Write-Host ""

# Event 1: November 18, 2025
$event1 = @{
    id = "evt-tbdiwsg-nov18-2025"
    title = "Tuesday Information Sessions ZOOM - Open Discussion"
    description = "It seems our message is falling on deft ears. Share your thoughts and experiences on how to talk to friends and neighbours about the failures of the system.

Tuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group

Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/"
    date = "2025-11-18T15:00:00.000Z"
    endDate = "2025-11-18T17:00:00.000Z"
    location = "Thunder Bay & District Injured Workers Support Group"
    isVirtual = $true
    virtualLink = "https://thunderbayinjuredworkers.com/tuesday-events/"
    category = "community"
    organizer = "Thunder Bay & District Injured Workers Support Group"
    organizerContact = "tbiwsg@gmail.com"
    url = "https://thunderbayinjuredworkers.com/tuesday-events/"
    tags = @("injured-workers", "information-session", "discussion", "workers-rights", "advocacy", "zoom")
    status = "published"
    asl = $false
    captions = $false
    stepFree = $true
    wheelchairAccessible = $true
    serviceAnimalsWelcome = $true
    energyCost = "low"
    registrationRequired = $false
    accessibilityNotes = "Virtual event accessible from any device with internet connection. Contact organizers for accessibility accommodations."
    attendeeCount = 0
    imageUrl = ""
}

# Event 2: November 25, 2025
$event2 = @{
    id = "evt-tbdiwsg-nov25-2025"
    title = "Tuesday Information Sessions ZOOM - Duty to Accommodate"
    description = "Duty to Accommodate - Sandra Goodicks, PSAC OH&S Staff representative

Tuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group

Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/"
    date = "2025-11-25T15:00:00.000Z"
    endDate = "2025-11-25T17:00:00.000Z"
    location = "Thunder Bay & District Injured Workers Support Group"
    isVirtual = $true
    virtualLink = "https://thunderbayinjuredworkers.com/tuesday-events/"
    category = "community"
    organizer = "Thunder Bay & District Injured Workers Support Group"
    organizerContact = "tbiwsg@gmail.com"
    url = "https://thunderbayinjuredworkers.com/tuesday-events/"
    tags = @("injured-workers", "duty-to-accommodate", "PSAC", "workplace-rights", "occupational-health", "information-session", "zoom")
    status = "published"
    asl = $false
    captions = $false
    stepFree = $true
    wheelchairAccessible = $true
    serviceAnimalsWelcome = $true
    energyCost = "low"
    registrationRequired = $false
    accessibilityNotes = "Virtual event accessible from any device with internet connection. Contact organizers for accessibility accommodations."
    attendeeCount = 0
    imageUrl = ""
}

# Event 3: December 2, 2025
$event3 = @{
    id = "evt-tbdiwsg-dec2-2025"
    title = "Tuesday Information Session ZOOM - Guest Speaker IWC"
    description = "We will share the experience of the November 25th MPP lobby to repeal the discrimination against injured workers over age 65, including videos of workers' testimonies. In addition there will be a report on the December 8 day of action, aka the Christmas demonstration

Tuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group

Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/"
    date = "2025-12-02T15:00:00.000Z"
    endDate = "2025-12-02T17:00:00.000Z"
    location = "Thunder Bay & District Injured Workers Support Group"
    isVirtual = $true
    virtualLink = "https://thunderbayinjuredworkers.com/tuesday-events/"
    category = "community"
    organizer = "Thunder Bay & District Injured Workers Support Group & IWC"
    organizerContact = "tbiwsg@gmail.com"
    url = "https://thunderbayinjuredworkers.com/tuesday-events/"
    tags = @("injured-workers", "IWC", "advocacy", "workers-rights", "age-discrimination", "information-session", "zoom")
    status = "published"
    asl = $false
    captions = $false
    stepFree = $true
    wheelchairAccessible = $true
    serviceAnimalsWelcome = $true
    energyCost = "low"
    registrationRequired = $false
    accessibilityNotes = "Virtual event accessible from any device with internet connection. Contact organizers for accessibility accommodations."
    attendeeCount = 0
    imageUrl = ""
}

# Event 4: December 9, 2025
$event4 = @{
    id = "evt-3mpwr-intro-dec9-2025"
    title = "Introduction to 3mpwr App - Website & App Demo"
    description = "Empowering Canadians Through Inclusive Technology!

Join us for an engaging introduction to the 3mpwr App - a new accessibility-driven platform created for Injured Workers, Persons with Disabilities, and their Allies across Canada.

Built with accessibility, inclusion, and connection at its core, 3mpwr helps users navigate supports and services at both provincial and federal levels.

Presented by Lissa Beaulieu (Creator), this session will feature a walkthrough of the 3mpwr App website and a live demo of the app currently in closed beta testing.

Discover how 3mpwr is empowering communities through technology that makes connection, coordination, and accessibility easier for everyone.

Tuesday Information Session with The Thunder Bay & District Injured Workers Support Group and 3mpwr App! Injured Workers Unite

Learn more: 3mpwrapp.pages.dev
Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/"
    date = "2025-12-09T15:00:00.000Z"
    endDate = "2025-12-09T17:00:00.000Z"
    location = "Thunder Bay & District Injured Workers Support Group"
    isVirtual = $true
    virtualLink = "https://thunderbayinjuredworkers.com/tuesday-events/"
    category = "community"
    organizer = "Thunder Bay & District Injured Workers Support Group & 3mpwr App"
    organizerContact = "tbiwsg@gmail.com"
    url = "https://thunderbayinjuredworkers.com/tuesday-events/"
    tags = @("accessibility", "injured-workers", "app-demo", "information-session", "technology", "inclusion", "zoom")
    status = "published"
    asl = $false
    captions = $false
    stepFree = $true
    wheelchairAccessible = $true
    serviceAnimalsWelcome = $true
    energyCost = "low"
    registrationRequired = $false
    accessibilityNotes = "Virtual event accessible from any device with internet connection. Contact organizers for accessibility accommodations."
    attendeeCount = 0
    imageUrl = ""
}

$events = @($event1, $event2, $event3, $event4)

# Save to JSON
$eventsData = @{
    events = $events
    count = $events.Count
    syncDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    collections = @("events_preview", "events_production")
}

$eventsData | ConvertTo-Json -Depth 10 | Out-File -FilePath "new-tbdiwsg-events.json" -Encoding UTF8

Write-Host "Events data saved to: new-tbdiwsg-events.json" -ForegroundColor Green
Write-Host ""

# Display summary
Write-Host "Events ready for sync:" -ForegroundColor Cyan
foreach ($event in $events) {
    Write-Host "  - $($event.title)" -ForegroundColor White
    Write-Host "    Date: $($event.date)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "SYNC METHODS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Firebase Console (Manual):" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/empowrapp/firestore" -ForegroundColor White
Write-Host ""
Write-Host "2. Using the app (Automatic):" -ForegroundColor Yellow
Write-Host "   Events are already in data/events.ts" -ForegroundColor White
Write-Host "   They will appear automatically when you restart the app" -ForegroundColor White
Write-Host ""
Write-Host "3. Verify Cloudflare Worker:" -ForegroundColor Yellow
Write-Host "   https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community" -ForegroundColor White
Write-Host ""

Write-Host "DONE!" -ForegroundColor Green
