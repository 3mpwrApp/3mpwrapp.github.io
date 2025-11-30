#!/bin/bash
# Comprehensive Firebase Test Lab Robo Test for 3mpwr App

# Run Robo test across multiple devices with full app coverage
gcloud firebase test android run \
  --type robo \
  --app build/app.apk \
  --robo-script robo_script.json \
  --timeout 30m \
  --device model=Pixel2,version=28,locale=en,orientation=portrait \
  --device model=Pixel6,version=33,locale=en,orientation=portrait \
  --device model=MediumPhone.arm,version=30,locale=en,orientation=portrait \
  --device model=SmallTablet.arm,version=30,locale=en,orientation=landscape \
  --device model=MediumTablet.arm,version=30,locale=en,orientation=landscape \
  --num-flaky-test-attempts 2 \
  --directories-to-pull /sdcard/screenshots \
  --results-dir firebase-test-results \
  --project empowrapp-4e25b

echo "Test complete! Screenshots will be in firebase-test-results/"
echo "Access results at: https://console.firebase.google.com/project/empowrapp-4e25b/testlab"
