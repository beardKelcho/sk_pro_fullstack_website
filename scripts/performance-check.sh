#!/bin/bash

# ============================================
# SK Production - Performance Check
# ============================================
# Bundle budget kontrolu zorunlu, Lighthouse ise opt-in calisir.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
RUN_LIGHTHOUSE="${RUN_LIGHTHOUSE:-false}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Performance Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$CLIENT_DIR"

echo -e "${YELLOW}1. Building client...${NC}"
npm run build

echo -e "${YELLOW}2. Checking bundle size budget...${NC}"
npm run bundle-size
echo -e "${GREEN}✅ Bundle size budget OK${NC}"

if [ "$RUN_LIGHTHOUSE" = "true" ]; then
    echo -e "${YELLOW}3. Running Lighthouse CI...${NC}"
    npx start-server-and-test start http://127.0.0.1:3000 "npm run lighthouse:ci"
    echo -e "${GREEN}✅ Lighthouse CI OK${NC}"
else
    echo -e "${YELLOW}3. Lighthouse skipped (set RUN_LIGHTHOUSE=true to enable)${NC}"
fi

echo -e "${GREEN}✅ Performance check completed${NC}"
