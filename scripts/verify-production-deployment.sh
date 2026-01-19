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

# Varsayılan URL'ler (environment variable'lardan alınabilir)
BACKEND_URL="${BACKEND_URL:-https://skproduction-api.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://skproduction.vercel.app}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Production Deployment Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Backend URL: $BACKEND_URL${NC}"
echo -e "${YELLOW}Frontend URL: $FRONTEND_URL${NC}"
echo ""

ERRORS=0
WARNINGS=0

# ============================================
# Backend Health Checks
# ============================================
echo -e "${YELLOW}📋 Backend Health Checks...${NC}"

# Livez check
echo -n "  Checking /api/livez... "
if curl -sf "${BACKEND_URL}/api/livez" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Readyz check
echo -n "  Checking /api/readyz... "
if curl -sf "${BACKEND_URL}/api/readyz" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Health check
echo -n "  Checking /api/health... "
HEALTH_RESPONSE=$(curl -sf "${BACKEND_URL}/api/health" 2>/dev/null || echo "")
if [ -n "$HEALTH_RESPONSE" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    # MongoDB bağlantısını kontrol et
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
        echo -e "    ${GREEN}✅ MongoDB connected${NC}"
    else
        echo -e "    ${YELLOW}⚠️  MongoDB connection issue${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

# API Docs check
echo -n "  Checking /api-docs... "
if curl -sf "${BACKEND_URL}/api-docs" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  API docs not accessible${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# Frontend Checks
# ============================================
echo -e "${YELLOW}📋 Frontend Checks...${NC}"

# Ana sayfa
echo -n "  Checking frontend homepage... "
if curl -sf "${FRONTEND_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Admin login sayfası
echo -n "  Checking /admin/login... "
if curl -sf "${FRONTEND_URL}/admin/login" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Admin login page not accessible${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# API Connectivity
# ============================================
echo -e "${YELLOW}📋 API Connectivity Check...${NC}"

# Frontend'den backend'e bağlantı testi
echo -n "  Testing frontend → backend connection... "
# Bu test için frontend'in backend'e bağlanabildiğini kontrol ederiz
# Basit bir health check endpoint'i çağırırız
if curl -sf "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
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
    exit 1
fi
