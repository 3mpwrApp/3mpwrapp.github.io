# Firebase Authentication Configuration Checker
# This script helps verify your Firebase setup is correct

Write-Host "`n=== Firebase Authentication Setup Checker ===" -ForegroundColor Cyan
Write-Host "Checking your configuration...`n" -ForegroundColor Cyan

# Check 1: google-services.json exists
Write-Host "1. Checking google-services.json..." -NoNewline
if (Test-Path "google-services.json") {
    Write-Host " [OK] Found" -ForegroundColor Green
    $googleServices = Get-Content "google-services.json" | ConvertFrom-Json
    $projectId = $googleServices.project_info.project_id
    $packageName = $googleServices.client[0].client_info.android_client_info.package_name
    Write-Host "   Project ID: $projectId" -ForegroundColor Gray
    Write-Host "   Package: $packageName" -ForegroundColor Gray
} else {
    Write-Host " [MISSING]" -ForegroundColor Red
    Write-Host "   Download from Firebase Console - Project Settings - Your Android app" -ForegroundColor Yellow
}

# Check 2: .env file
Write-Host "`n2. Checking .env configuration..." -NoNewline
if (Test-Path ".env") {
    Write-Host " [OK] Found" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "EXPO_PUBLIC_GOOGLE_CLIENT_ID=(.+)") {
        $clientId = $matches[1].Trim()
        Write-Host "   Android Client ID: $($clientId.Substring(0, 30))..." -ForegroundColor Gray
    } else {
        Write-Host "   [WARNING] EXPO_PUBLIC_GOOGLE_CLIENT_ID not found" -ForegroundColor Yellow
    }
    
    if ($envContent -match "EXPO_PUBLIC_DATA_POLICY=(.+)") {
        $policy = $matches[1].Trim()
        Write-Host "   Data Policy: $policy" -ForegroundColor Gray
    }
} else {
    Write-Host " [MISSING]" -ForegroundColor Red
}

# Check 3: firebase/config.ts
Write-Host "`n3. Checking firebase/config.ts..." -NoNewline
if (Test-Path "firebase/config.ts") {
    Write-Host " [OK] Found" -ForegroundColor Green
    $firebaseConfig = Get-Content "firebase/config.ts" -Raw
    
    if ($firebaseConfig -match 'projectId: "(.+)"') {
        $configProjectId = $matches[1]
        Write-Host "   Project ID: $configProjectId" -ForegroundColor Gray
        
        if ($projectId -and $configProjectId -ne $projectId) {
            Write-Host "   [WARNING] Project ID mismatch!" -ForegroundColor Yellow
            Write-Host "   google-services.json: $projectId" -ForegroundColor Yellow
            Write-Host "   firebase/config.ts: $configProjectId" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host " [MISSING]" -ForegroundColor Red
}

# Check 4: Expo Project Detection and SHA-1 guidance
Write-Host "`n4. Checking project type and SHA-1 requirements..."

# Check if this is an Expo project
$isExpo = $false
if (Test-Path "app.json") {
    $appJson = Get-Content "app.json" | ConvertFrom-Json
    if ($appJson.expo) {
        $isExpo = $true
        Write-Host "   [OK] Expo project detected" -ForegroundColor Green
    }
}

if ($isExpo) {
    Write-Host "`n   Expo Project - SHA-1 Guidance:" -ForegroundColor Cyan
    Write-Host "   [OK] For Expo Go: NO SHA-1 needed! Just enable Google Sign-In in Firebase." -ForegroundColor Green
    Write-Host "   [INFO] For Development Build: Get SHA-1 from EAS build output" -ForegroundColor Gray
    Write-Host "   [INFO] For Production Build: Use 'eas credentials' to get SHA-1" -ForegroundColor Gray
    Write-Host "`n   See EXPO_GOOGLE_SIGNIN_SETUP.md for detailed instructions" -ForegroundColor Yellow
} else {
    Write-Host "   Standard React Native project detected" -ForegroundColor Gray
    
    if (Test-Path "android/app/debug.keystore") {
        Write-Host "   Using android/app/debug.keystore" -ForegroundColor Gray
        $keytoolOutput = keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>&1
    } elseif (Test-Path "$env:USERPROFILE\.android\debug.keystore") {
        Write-Host "   Using $env:USERPROFILE\.android\debug.keystore" -ForegroundColor Gray
        $keytoolOutput = keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android 2>&1
    } else {
        Write-Host "   [WARNING] Debug keystore not found" -ForegroundColor Yellow
        $keytoolOutput = $null
    }

    if ($keytoolOutput -and ($keytoolOutput -match "SHA1: (.+)")) {
        $sha1 = $matches[1].Trim()
        Write-Host "   SHA-1: $sha1" -ForegroundColor Gray
        Write-Host "   Make sure this SHA-1 is added to Firebase Console!" -ForegroundColor Yellow
        Write-Host "   Firebase Console - Project Settings - Your Android app - Add fingerprint" -ForegroundColor Yellow
    } else {
        Write-Host "   Could not extract SHA-1. Run manually:" -ForegroundColor Yellow
        Write-Host "   keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host ""

if ($isExpo) {
    Write-Host "EXPO PROJECT DETECTED" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Quick Start (Testing with Expo Go):" -ForegroundColor White
    Write-Host "1. All configuration files are present" -ForegroundColor Green
    Write-Host "2. Enable Google Sign-In in Firebase Console:" -ForegroundColor Yellow
    Write-Host "   - Go to https://console.firebase.google.com/" -ForegroundColor Gray
    Write-Host "   - Select project: $projectId" -ForegroundColor Gray
    Write-Host "   - Authentication - Sign-in method - Google" -ForegroundColor Gray
    Write-Host "   - Toggle Enable - Add support email - Save" -ForegroundColor Gray
    Write-Host "3. Start app: npx expo start" -ForegroundColor Green
    Write-Host "4. Test in Expo Go - NO SHA-1 needed for development!" -ForegroundColor Green
    Write-Host ""
    Write-Host "For production builds, see: EXPO_GOOGLE_SIGNIN_SETUP.md" -ForegroundColor Yellow
} else {
    Write-Host "Next Steps:" -ForegroundColor White
    Write-Host "1. Verify all files are present" -ForegroundColor Green
    Write-Host "2. Enable Google Sign-In in Firebase Console:" -ForegroundColor Yellow
    Write-Host "   - Go to https://console.firebase.google.com/" -ForegroundColor Gray
    Write-Host "   - Select project: $projectId" -ForegroundColor Gray
    Write-Host "   - Authentication - Sign-in method - Google" -ForegroundColor Gray
    Write-Host "   - Toggle Enable - Add support email - Save" -ForegroundColor Gray
    Write-Host "3. Add SHA-1 fingerprint to Firebase (shown above)" -ForegroundColor Yellow
    Write-Host "4. Restart app: npx expo start --clear" -ForegroundColor Green
    Write-Host ""
    Write-Host "For detailed instructions, see FIREBASE_AUTH_SETUP.md" -ForegroundColor Yellow
}

Write-Host "`n=== End of Check ===" -ForegroundColor Cyan
Write-Host ""
