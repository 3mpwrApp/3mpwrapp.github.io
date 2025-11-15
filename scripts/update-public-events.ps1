# Update public/api/events.json with new TBDIWSG events
# This script adds the 4 new events to the existing events.json file

Write-Host "Updating public/api/events.json with new events..." -ForegroundColor Cyan
Write-Host ""

# Read existing events
$existingEventsPath = "public\api\events.json"
$existingEvents = Get-Content $existingEventsPath | ConvertFrom-Json

Write-Host "Existing events: $($existingEvents.Count)" -ForegroundColor Yellow

# Define new events
$newEvents = @(
    @{
        id = "evt-tbdiwsg-nov18-2025"
        title = "Tuesday Information Sessions ZOOM - Open Discussion"
        description = "It seems our message is falling on deft ears. Share your thoughts and experiences on how to talk to friends and neighbours about the failures of the system.`n`nTuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group`n`nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!`nhttps://thunderbayinjuredworkers.com/tuesday-events/"
        date = "2025-11-18T15:00:00.000Z"
        endDate = "2025-11-18T17:00:00.000Z"
        location = "Virtual"
        category = "community"
        isVirtual = $true
        url = "https://thunderbayinjuredworkers.com/tuesday-events/"
        organizer = "Thunder Bay & District Injured Workers Support Group"
        imageUrl = ""
        attendeeCount = 0
        tags = @("injured-workers", "information-session", "discussion", "workers-rights", "advocacy", "zoom")
        status = "published"
    },
    @{
        id = "evt-tbdiwsg-nov25-2025"
        title = "Tuesday Information Sessions ZOOM - Duty to Accommodate"
        description = "Duty to Accommodate - Sandra Goodicks, PSAC OH&S Staff representative`n`nTuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group`n`nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!`nhttps://thunderbayinjuredworkers.com/tuesday-events/"
        date = "2025-11-25T15:00:00.000Z"
        endDate = "2025-11-25T17:00:00.000Z"
        location = "Virtual"
        category = "community"
        isVirtual = $true
        url = "https://thunderbayinjuredworkers.com/tuesday-events/"
        organizer = "Thunder Bay & District Injured Workers Support Group"
        imageUrl = ""
        attendeeCount = 0
        tags = @("injured-workers", "duty-to-accommodate", "PSAC", "workplace-rights", "occupational-health", "information-session", "zoom")
        status = "published"
    },
    @{
        id = "evt-tbdiwsg-dec2-2025"
        title = "Tuesday Information Session ZOOM - Guest Speaker IWC"
        description = "We will share the experience of the November 25th MPP lobby to repeal the discrimination against injured workers over age 65, including videos of workers' testimonies. In addition there will be a report on the December 8 day of action, aka the Christmas demonstration`n`nTuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group`n`nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!`nhttps://thunderbayinjuredworkers.com/tuesday-events/"
        date = "2025-12-02T15:00:00.000Z"
        endDate = "2025-12-02T17:00:00.000Z"
        location = "Virtual"
        category = "community"
        isVirtual = $true
        url = "https://thunderbayinjuredworkers.com/tuesday-events/"
        organizer = "Thunder Bay & District Injured Workers Support Group & IWC"
        imageUrl = ""
        attendeeCount = 0
        tags = @("injured-workers", "IWC", "advocacy", "workers-rights", "age-discrimination", "information-session", "zoom")
        status = "published"
    },
    @{
        id = "evt-3mpwr-intro-dec9-2025-updated"
        title = "Introduction to 3mpwr App - Website & App Demo"
        description = "Empowering Canadians Through Inclusive Technology!`n`nJoin us for an engaging introduction to the 3mpwr App - a new accessibility-driven platform created for Injured Workers, Persons with Disabilities, and their Allies across Canada.`n`nBuilt with accessibility, inclusion, and connection at its core, 3mpwr helps users navigate supports and services at both provincial and federal levels.`n`nPresented by Lissa Beaulieu (Creator), this session will feature a walkthrough of the 3mpwr App website and a live demo of the app currently in closed beta testing.`n`nDiscover how 3mpwr is empowering communities through technology that makes connection, coordination, and accessibility easier for everyone.`n`nTuesday Information Session with The Thunder Bay & District Injured Workers Support Group and 3mpwr App! Injured Workers Unite`n`nLearn more: 3mpwrapp.pages.dev`nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!`nhttps://thunderbayinjuredworkers.com/tuesday-events/"
        date = "2025-12-09T15:00:00.000Z"
        endDate = "2025-12-09T17:00:00.000Z"
        location = "Virtual"
        category = "community"
        isVirtual = $true
        url = "https://thunderbayinjuredworkers.com/tuesday-events/"
        organizer = "Thunder Bay & District Injured Workers Support Group & 3mpwr App"
        imageUrl = ""
        attendeeCount = 0
        tags = @("accessibility", "injured-workers", "app-demo", "information-session", "technology", "inclusion", "zoom")
        status = "published"
    }
)

# Get IDs of existing events
$existingIds = @{}
foreach ($event in $existingEvents) {
    $existingIds[$event.id] = $true
}

# Add new events if they don't exist
$addedCount = 0
foreach ($newEvent in $newEvents) {
    if (-not $existingIds.ContainsKey($newEvent.id)) {
        $existingEvents += $newEvent
        $addedCount++
        Write-Host "Added: $($newEvent.title)" -ForegroundColor Green
    } else {
        Write-Host "Already exists: $($newEvent.title)" -ForegroundColor Yellow
    }
}

# Sort by date
$sortedEvents = $existingEvents | Sort-Object { [DateTime]$_.date }

# Save back to file
$sortedEvents | ConvertTo-Json -Depth 10 | Out-File -FilePath $existingEventsPath -Encoding UTF8

Write-Host ""
Write-Host "Updated events.json:" -ForegroundColor Cyan
Write-Host "  - Total events: $($sortedEvents.Count)" -ForegroundColor White
Write-Host "  - New events added: $addedCount" -ForegroundColor Green
Write-Host ""
Write-Host "File saved: $existingEventsPath" -ForegroundColor Green
Write-Host ""
Write-Host "The Cloudflare Worker will automatically serve these events" -ForegroundColor Cyan
Write-Host "once they are synced to Firestore!" -ForegroundColor Cyan
