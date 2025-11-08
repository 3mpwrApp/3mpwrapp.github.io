# Add TBDIWSG Events to Firestore via REST API
# This script uses Wrangler secrets to authenticate and add events

$PROJECT_ID = "empowrapp"

Write-Host "Adding 3 TBDIWSG events to Firestore..." -ForegroundColor Cyan
Write-Host ""

# Event 1: December 16, 2025
$event1 = @{
    id = "tbdiwsg-dec16-2025"
    title = "TBDIWSG Tuesday Information Session ZOOM"
    description = @"
Thunder Bay & District Injured Workers Support Group 
Dec 16 - Guest Kevon Stewart, District 6 Director, USW

Kevon will discuss in the presentation:
- The criminal liability and prosecution of organizations who do not follow the Westray law.
- Why enforcement of the Westray law is not currently happening.
- The actions USW District 6 is taking for more dedicated investigators, prosecutors, and training for legal and police officials.

Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/

Powered by 3mpwr App
https://3mpwrapp.pages.dev/events/
"@
    date = "2025-12-16T10:00:00-05:00"
    endDate = "2025-12-16T12:00:00-05:00"
    location = "Virtual"
    isVirtual = $true
    category = "community"
    organizer = "Thunder Bay & District Injured Workers Support Group"
    url = "https://thunderbayinjuredworkers.com/tuesday-events/"
    tags = @("workers-rights", "zoom", "information-session", "westray-law", "usw")
    createdBy = "empowrapp08162025@gmail.com"
    createdAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    status = "published"
    asl = $false
    captions = $false
    stepFree = $true
    sensorySpace = $false
}

# Event 2: November 20, 2025
$event2 = @{
    id = "tbdiwsg-nov20-2025"
    title = "TBDIWSG Community Meeting In Person & ZOOM"
    description = @"
Join the Thunder Bay & District Injured Workers Support Group for a community meeting at 7:00 PM (doors open at 6:30) on Thursday November 20th at the OPSEU Office at 326 Memorial Ave. (beside the Merla Mae) Thunder Bay ON

- Share your experiences with WSIB
- Get updates on local actions including the Dryden RB4 exposures and the annual December Rally

Everyone Welcome
thunderbayinjuredworkers.com/

Powered by 3mpwr App
https://3mpwrapp.pages.dev/events/
"@
    date = "2025-11-20T18:30:00-05:00"
    endDate = "2025-11-20T20:00:00-05:00"
    location = "OPSEU Office, 326 Memorial Ave, Thunder Bay ON (beside the Merla Mae)"
    isVirtual = $false
    category = "community"
    organizer = "Thunder Bay & District Injured Workers Support Group"
    url = "https://thunderbayinjuredworkers.com/"
    tags = @("workers-rights", "hybrid-meeting", "wsib", "community-meeting")
    createdBy = "empowrapp08162025@gmail.com"
    createdAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    status = "published"
    asl = $false
    captions = $false
    stepFree = $false
    sensorySpace = $false
}

# Event 3: November 11, 2025
$event3 = @{
    id = "tbdiwsg-nov11-2025"
    title = "TBDIWSG Tuesday Information Session ZOOM"
    description = @"
Thunder Bay & District Injured Workers Support Group
November 11 - IWC - The WSIB Surplus: A Political Slush Fund
Guest Speakers: Chris Grawey & Bonnie Heath

Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/

Virtual Event
2025-11-11 10-12
Powered by 3mpwr App
https://3mpwrapp.pages.dev/events/
"@
    date = "2025-11-11T10:00:00-05:00"
    endDate = "2025-11-11T12:00:00-05:00"
    location = "Virtual"
    isVirtual = $true
    category = "community"
    organizer = "Thunder Bay & District Injured Workers Support Group"
    url = "https://thunderbayinjuredworkers.com/tuesday-events/"
    tags = @("workers-rights", "zoom", "wsib", "information-session", "iwc")
    createdBy = "empowrapp08162025@gmail.com"
    createdAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    status = "published"
    asl = $false
    captions = $false
    stepFree = $true
    sensorySpace = $false
}

$events = @($event1, $event2, $event3)

Write-Host "INFO: Since Firestore REST API requires OAuth2 authentication," -ForegroundColor Yellow
Write-Host "      and we're using service account stored in Wrangler secrets," -ForegroundColor Yellow
Write-Host "      I'll create a temporary worker script to add these events." -ForegroundColor Yellow
Write-Host ""
Write-Host "Creating import script..." -ForegroundColor Cyan

# Create a temporary worker script that uses the service account
$workerScript = @"
import serviceAccountData from './wrangler-service-account.json';

const events = $($events | ConvertTo-Json -Depth 10 -Compress);

async function generateFirebaseToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp,
    scope: 'https://www.googleapis.com/auth/datastore'
  };
  const encoder = new TextEncoder();
  const headerB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(header))))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(payload))))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const message = headerB64 + '.' + payloadB64;
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(serviceAccount.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '')), c => c.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, encoder.encode(message));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return message + '.' + signatureB64;
}

async function getAccessToken(serviceAccount) {
  const jwt = await generateFirebaseToken(serviceAccount);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  if (!response.ok) throw new Error('Failed to get access token');
  const data = await response.json();
  return data.access_token;
}

async function addEvents() {
  const accessToken = await getAccessToken(serviceAccountData);
  const PROJECT_ID = 'empowrapp';
  
  for (const event of events) {
    for (const collection of ['events_preview', 'events_production']) {
      const url = ``https://firestore.googleapis.com/v1/projects/\${PROJECT_ID}/databases/(default)/documents/\${collection}/\${event.id}``;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': ``Bearer \${accessToken}``,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: Object.entries(event).reduce((acc, [key, value]) => {
            if (typeof value === 'string') acc[key] = { stringValue: value };
            else if (typeof value === 'number') acc[key] = { integerValue: value.toString() };
            else if (typeof value === 'boolean') acc[key] = { booleanValue: value };
            else if (Array.isArray(value)) acc[key] = { arrayValue: { values: value.map(v => ({ stringValue: v })) } };
            return acc;
          }, {})
        })
      });
      
      if (response.ok) {
        console.log(``✅ Added \${event.id} to \${collection}``);
      } else {
        const error = await response.text();
        console.error(``❌ Failed to add \${event.id} to \${collection}:``, error);
      }
    }
  }
  
  console.log('\n✅ All events added!');
  console.log('🔄 Check: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events');
}

addEvents().catch(console.error);
"@

# Save the events as JSON for manual upload
$events | ConvertTo-Json -Depth 10 | Out-File -FilePath ".\tbdiwsg-events.json" -Encoding UTF8

Write-Host "✅ Events data saved to: tbdiwsg-events.json" -ForegroundColor Green
Write-Host ""
Write-Host "📋 To add these events, use ONE of these methods:" -ForegroundColor Cyan
Write-Host ""
Write-Host "METHOD 1: Firebase Console (Easiest)" -ForegroundColor Yellow
Write-Host "  1. Go to: https://console.firebase.google.com/project/empowrapp/firestore" -ForegroundColor White
Write-Host "  2. Navigate to 'events_preview' collection" -ForegroundColor White
Write-Host "  3. Click '+ Add document' for each event" -ForegroundColor White
Write-Host "  4. Use the data from tbdiwsg-events.json" -ForegroundColor White
Write-Host "  5. Repeat for 'events_production' collection" -ForegroundColor White
Write-Host ""
Write-Host "METHOD 2: Use the app (Recommended)" -ForegroundColor Yellow
Write-Host "  1. Open the app and go to Events tab" -ForegroundColor White
Write-Host "  2. Tap 'Create Event' for each event" -ForegroundColor White
Write-Host "  3. The app will automatically sync to Firestore" -ForegroundColor White
Write-Host ""
Write-Host "METHOD 3: Firebase CLI" -ForegroundColor Yellow
Write-Host "  firebase firestore:import ./tbdiwsg-events.json" -ForegroundColor White
Write-Host ""

# Show preview of events
Write-Host "📅 Events to be added:" -ForegroundColor Cyan
foreach ($event in $events) {
    Write-Host ""
    Write-Host "  ID: $($event.id)" -ForegroundColor White
    Write-Host "  Title: $($event.title)" -ForegroundColor Green
    Write-Host "  Date: $($event.date)" -ForegroundColor Yellow
    Write-Host "  Location: $($event.location)" -ForegroundColor Magenta
}

Write-Host ""
Write-Host "✨ After adding, events will appear at:" -ForegroundColor Cyan
Write-Host "   https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" -ForegroundColor White
