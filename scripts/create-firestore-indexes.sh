#!/bin/bash
# Firebase Firestore Index Creation Script
# Run: chmod +x create-firestore-indexes.sh && ./create-firestore-indexes.sh

set -e

echo "🔥 Creating Firestore Composite Indexes for Pagination..."
echo "========================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${YELLOW}[1/4]${NC} Creating campaigns index (active + createdAt)..."
firebase firestore:indexes:create \
  --collection campaigns \
  --field active --field createdAt \
  --direction descending
echo -e "${GREEN}✅ Campaigns index created${NC}"
echo ""

echo -e "${YELLOW}[2/4]${NC} Creating events_production index (province + startDate)..."
firebase firestore:indexes:create \
  --collection events_production \
  --field province --field startDate \
  --direction descending
echo -e "${GREEN}✅ Events production index created${NC}"
echo ""

echo -e "${YELLOW}[3/4]${NC} Creating events_preview index (province + startDate)..."
firebase firestore:indexes:create \
  --collection events_preview \
  --field province --field startDate \
  --direction descending
echo -e "${GREEN}✅ Events preview index created${NC}"
echo ""

echo -e "${YELLOW}[4/4]${NC} Creating threads index (channel + createdAt)..."
firebase firestore:indexes:create \
  --collection threads \
  --field channel --field createdAt \
  --direction descending
echo -e "${GREEN}✅ Threads index created${NC}"
echo ""

echo "========================================================"
echo -e "${GREEN}✅ All indexes created successfully!${NC}"
echo ""
echo "Monitor index status at:"
echo "https://console.firebase.google.com/project/<YOUR_PROJECT>/firestore/indexes"
echo ""
echo "Indexes typically become 'Enabled' within 5-10 minutes"
