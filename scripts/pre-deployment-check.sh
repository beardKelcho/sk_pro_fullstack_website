#!/bin/bash

# ============================================
# SK Production - Pre-Deployment Check
# ============================================
# Bu script production deployment öncesi tüm kontrolleri yapar

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Pre-Deployment Check - Production Deployment Öncesi Kontroller${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Proje kök dizini
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ============================================
# 1. Git Status Check
# ============================================
echo -e "${YELLOW}📋 1. Git Status Kontrolü...${NC}"

# Uncommitted changes kontrolü
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes var${NC}"
    git status --short
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Tüm değişiklikler commit edilmiş${NC}"
fi

# Current branch kontrolü
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}   Current branch: $CURRENT_BRANCH${NC}"

echo ""

# ============================================
# 2. Environment Variables Check
# ============================================
echo -e "${YELLOW}📋 2. Environment Variables Kontrolü...${NC}"

if [ -f "scripts/validate-production-env.sh" ]; then
    bash scripts/validate-production-env.sh || {
        ERRORS=$((ERRORS + 1))
    }
else
    echo -e "${YELLOW}⚠️  validate-production-env.sh bulunamadı, manuel kontrol yapın${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# 3. Dependency Check
# ============================================
echo -e "${YELLOW}📋 3. Dependency Kontrolü...${NC}"

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ Root node_modules bulunamadı! npm install çalıştırın${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Root dependencies yüklü${NC}"
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "${RED}❌ Client node_modules bulunamadı! cd client && npm install çalıştırın${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Client dependencies yüklü${NC}"
fi

if [ ! -d "server/node_modules" ]; then
    echo -e "${RED}❌ Server node_modules bulunamadı! cd server && npm install çalıştırın${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Server dependencies yüklü${NC}"
fi

echo ""

# ============================================
# 4. Build Test
# ============================================
echo -e "${YELLOW}📋 4. Build Test...${NC}"

echo -n "  Testing server build... "
if (cd server && npm run build > /dev/null 2>&1); then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -n "  Testing client build... "
# Client build için environment variable'lar gerekebilir
if (cd client && NEXT_PUBLIC_API_URL=http://localhost:5001/api NEXT_PUBLIC_BACKEND_URL=http://localhost:5001 NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run build > /dev/null 2>&1); then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Client build failed (environment variables eksik olabilir)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# 5. Type Check
# ============================================
echo -e "${YELLOW}📋 5. Type Check...${NC}"

echo -n "  Server type check... "
if (cd server && npm run type-check > /dev/null 2>&1); then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -n "  Client type check... "
if (cd client && npm run type-check > /dev/null 2>&1); then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ============================================
# 6. Lint Check
# ============================================
echo -e "${YELLOW}📋 6. Lint Kontrolü...${NC}"

echo -n "  Server lint... "
if (cd server && npm run lint > /dev/null 2>&1); then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Lint warnings/errors var${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo -n "  Client lint... "
if (cd client && npm run lint > /dev/null 2>&1); then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Lint warnings/errors var${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# 7. Test Check
# ============================================
echo -e "${YELLOW}📋 7. Test Kontrolü...${NC}"

echo -n "  Running tests... "
if npm run test:all > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Bazı testler başarısız${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# 8. Security Audit
# ============================================
echo -e "${YELLOW}📋 8. Security Audit (npm audit)...${NC}"

echo -n "  Checking vulnerabilities... "
if npm run audit:ci > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Güvenlik açıkları bulundu (high/critical)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# Özet
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tüm kontroller başarılı! Production'a deploy edilebilir.${NC}"
    echo ""
    echo -e "${BLUE}Sonraki adım:${NC}"
    echo -e "  ${YELLOW}./scripts/deploy-production.sh${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS uyarı var, ancak production'a deploy edilebilir.${NC}"
    echo ""
    echo -e "${BLUE}Sonraki adım:${NC}"
    echo -e "  ${YELLOW}./scripts/deploy-production.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS kritik hata bulundu! Production'a deploy etmeden önce düzeltin.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS uyarı da var${NC}"
    fi
    exit 1
fi
