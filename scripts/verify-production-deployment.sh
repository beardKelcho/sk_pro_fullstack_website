#!/bin/bash

# ============================================
# SK Production - Production Deployment Verification
# ============================================
# Bu script production deployment sonrası sistemin çalıştığını doğrular

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# URL'ler environment variable'lardan gelmelidir
BACKEND_URL="${BACKEND_URL:-}"
FRONTEND_URL="${FRONTEND_URL:-}"
API_BASE="${API_BASE:-${BACKEND_URL}/api}"
CONTACT_PREFLIGHT_ORIGIN="${CONTACT_PREFLIGHT_ORIGIN:-$FRONTEND_URL}"

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ BACKEND_URL ve FRONTEND_URL environment variable'lari zorunludur.${NC}"
    echo -e "${YELLOW}Örnek:${NC}"
    echo -e "  BACKEND_URL=https://api.example.com FRONTEND_URL=https://app.example.com npm run smoke:production"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Production Deployment Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Backend URL: $BACKEND_URL${NC}"
echo -e "${YELLOW}Frontend URL: $FRONTEND_URL${NC}"
echo ""

ERRORS=0
WARNINGS=0

get_status_code() {
    local url="$1"
    local method="${2:-GET}"

    curl -sS -o /dev/null -w "%{http_code}" --max-time 20 -X "$method" "$url" || echo "000"
}

is_success_or_redirect() {
    local status="$1"
    [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ] || [ "$status" = "307" ] || [ "$status" = "308" ]
}

# ============================================
# Backend Health Checks
# ============================================
echo -e "${YELLOW}📋 Backend Health Checks...${NC}"

# Livez check
echo -n "  Checking /api/livez... "
if [ "$(get_status_code "${API_BASE}/livez")" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Readyz check
echo -n "  Checking /api/readyz... "
if [ "$(get_status_code "${API_BASE}/readyz")" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Health check
echo -n "  Checking /api/health... "
HEALTH_RESPONSE=$(curl -sS --max-time 20 "${API_BASE}/health" 2>/dev/null || echo "")
if [ -n "$HEALTH_RESPONSE" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
        echo -e "    ${GREEN}✅ API health status OK${NC}"
    else
        echo -e "    ${YELLOW}⚠️  API health payload beklenen status degerini donmedi${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

# API Docs check
echo -n "  Checking /api-docs... "
API_DOCS_STATUS="$(get_status_code "${BACKEND_URL}/api-docs")"
if [ "$API_DOCS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
elif [ "$API_DOCS_STATUS" = "403" ] || [ "$API_DOCS_STATUS" = "404" ]; then
    echo -e "${GREEN}✅ CLOSED IN PRODUCTION${NC}"
else
    echo -e "${YELLOW}⚠️  API docs unexpected status (${API_DOCS_STATUS})${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# Frontend Checks
# ============================================
echo -e "${YELLOW}📋 Frontend Checks...${NC}"

# Ana sayfa
echo -n "  Checking frontend homepage... "
if [ "$(get_status_code "${FRONTEND_URL}")" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Admin login sayfası
echo -n "  Checking /admin/login... "
ADMIN_LOGIN_STATUS="$(get_status_code "${FRONTEND_URL}/admin/login")"
if is_success_or_redirect "$ADMIN_LOGIN_STATUS"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Admin login page not accessible (${ADMIN_LOGIN_STATUS})${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# API Connectivity
# ============================================
echo -e "${YELLOW}📋 API Connectivity Check...${NC}"

echo -n "  Testing frontend → backend health path... "
if [ "$(get_status_code "${API_BASE}/health")" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -n "  Testing contact form CORS preflight... "
PREFLIGHT_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 \
    -X OPTIONS "${API_BASE}/cms/contact" \
    -H "Origin: ${CONTACT_PREFLIGHT_ORIGIN}" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" || echo "000")

if [ "$PREFLIGHT_STATUS" = "200" ] || [ "$PREFLIGHT_STATUS" = "204" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED (${PREFLIGHT_STATUS})${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ============================================
# SSL/HTTPS Check
# ============================================
echo -e "${YELLOW}📋 SSL/HTTPS Check...${NC}"

# Backend HTTPS
echo -n "  Checking backend HTTPS... "
if echo "$BACKEND_URL" | grep -q "^https://"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not using HTTPS${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Frontend HTTPS
echo -n "  Checking frontend HTTPS... "
if echo "$FRONTEND_URL" | grep -q "^https://"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend not using HTTPS${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# Özet
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tüm kontroller başarılı! Production deployment başarılı.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS uyarı var, ancak sistem çalışıyor.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS kritik hata bulundu! Production deployment başarısız.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS uyarı da var${NC}"
    fi
    echo ""
    echo -e "${YELLOW}💡 İpucu: Backend ve frontend URL'lerini kontrol edin:${NC}"
    echo -e "   BACKEND_URL=$BACKEND_URL"
    echo -e "   FRONTEND_URL=$FRONTEND_URL"
    echo -e "   API_BASE=$API_BASE"
    echo -e "   CONTACT_PREFLIGHT_ORIGIN=$CONTACT_PREFLIGHT_ORIGIN"
    exit 1
fi
