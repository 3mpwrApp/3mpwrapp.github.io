@echo off
REM Firebase Firestore Index Creation Script (Windows)
REM Run: create-firestore-indexes.bat

setlocal enabledelayedexpansion

echo 🔥 Creating Firestore Composite Indexes for Pagination...
echo ========================================================
echo.

REM Check if firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI not found. Install with: npm install -g firebase-tools
    exit /b 1
)

echo [1/4] Creating campaigns index (active + createdAt)...
call firebase firestore:indexes:create ^
  --collection campaigns ^
  --field active --field createdAt ^
  --direction descending
if errorlevel 1 goto error
echo ✅ Campaigns index created
echo.

echo [2/4] Creating events_production index (province + startDate)...
call firebase firestore:indexes:create ^
  --collection events_production ^
  --field province --field startDate ^
  --direction descending
if errorlevel 1 goto error
echo ✅ Events production index created
echo.

echo [3/4] Creating events_preview index (province + startDate)...
call firebase firestore:indexes:create ^
  --collection events_preview ^
  --field province --field startDate ^
  --direction descending
if errorlevel 1 goto error
echo ✅ Events preview index created
echo.

echo [4/4] Creating threads index (channel + createdAt)...
call firebase firestore:indexes:create ^
  --collection threads ^
  --field channel --field createdAt ^
  --direction descending
if errorlevel 1 goto error
echo ✅ Threads index created
echo.

echo ========================================================
echo ✅ All indexes created successfully!
echo.
echo Monitor index status at:
echo https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes
echo.
echo Indexes typically become 'Enabled' within 5-10 minutes
goto end

:error
echo ❌ Error creating indexes. Check your Firebase project setup.
exit /b 1

:end
endlocal
