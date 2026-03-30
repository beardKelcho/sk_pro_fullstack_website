#!/bin/bash

# ============================================
# SK Production - Production Deployment Test Script
# ============================================
# Bu script production deployment'ı test eder:
# - Environment variable kontrolü
# - Build testi
# - Type check
# - Lint kontrolü
# - Test çalıştırma
# - Opsiyonel performance kontrolu

set -e  # Hata durumunda dur

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Production Deployment Test Başlatılıyor...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Proje kök dizini
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUN_E2E="${RUN_E2E:-false}"
RUN_PERF_CHECK="${RUN_PERF_CHECK:-false}"

# ============================================
# 1. Environment Variable Kontrolü
# ============================================
echo -e "${YELLOW}📋 1. Environment Variable Kontrolü...${NC}"

# Server .env.example kontrolü
if [ ! -f "server/.env.example" ]; then
    echo -e "${RED}❌ server/.env.example bulunamadı!${NC}"
    exit 1
fi

# Client .env.example kontrolü
if [ ! -f "client/.env.example" ]; then
    echo -e "${RED}❌ client/.env.example bulunamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env.example dosyaları mevcut${NC}"
echo ""

# ============================================
# 2. Server Build Testi
# ============================================
echo -e "${YELLOW}📦 2. Server Build Testi...${NC}"

cd server

echo "   TypeScript type check..."
npm run type-check > /dev/null 2>&1
echo -e "${GREEN}   ✅ Type check başarılı${NC}"

# Build testi
echo "   Build testi..."
npm run build > /dev/null 2>&1
echo -e "${GREEN}   ✅ Build başarılı${NC}"

cd ..
echo ""

# ============================================
# 3. Client Build Testi
# ============================================
echo -e "${YELLOW}📦 3. Client Build Testi...${NC}"

cd client

echo "   TypeScript type check..."
npm run type-check > /dev/null 2>&1
echo -e "${GREEN}   ✅ Type check başarılı${NC}"

# Lint kontrolü
echo "   ESLint kontrolü..."
npm run lint > /dev/null 2>&1
echo -e "${GREEN}   ✅ Lint başarılı${NC}"

# Production build testi
echo "   Production build testi..."
NODE_ENV=production npm run build > /dev/null 2>&1
echo -e "${GREEN}   ✅ Production build başarılı${NC}"

cd ..
echo ""

# ============================================
# 4. Test Çalıştırma
# ============================================
echo -e "${YELLOW}🧪 4. Test Çalıştırma...${NC}"

# Server testleri
echo "   Server testleri..."
cd server && npm run test:coverage:ci > /dev/null 2>&1 && cd ..
echo -e "${GREEN}   ✅ Server testleri başarılı${NC}"

# Client testleri
echo "   Client testleri..."
cd client && npm run test:ci:stable > /dev/null 2>&1 && cd ..
echo -e "${GREEN}   ✅ Client testleri başarılı${NC}"

if [ "$RUN_E2E" = "true" ]; then
    echo "   E2E smoke testleri..."
    npm run test:e2e > /dev/null 2>&1
    echo -e "${GREEN}   ✅ E2E smoke testleri başarılı${NC}"
else
    echo -e "${YELLOW}   ⚠️  E2E smoke testleri atlandi (RUN_E2E=true ile acabilirsiniz)${NC}"
fi

echo ""

# ============================================
# 5. Bundle Size Kontrolü
# ============================================
echo -e "${YELLOW}📊 5. Bundle Size Kontrolü...${NC}"
cd client && npm run bundle-size > /dev/null 2>&1 && cd ..
echo -e "${GREEN}   ✅ Bundle size bütçe dahilinde${NC}"
echo ""

# ============================================
# 6. Production Check Script
# ============================================
echo -e "${YELLOW}🔍 6. Production Check Script...${NC}"

cd client

if [ -f "scripts/check-production.ts" ]; then
    npm run check-production > /dev/null 2>&1
    echo -e "${GREEN}   ✅ Production check başarılı${NC}"
else
    echo -e "${YELLOW}   ⚠️  Production check script yok${NC}"
fi

cd ..
echo ""

# ============================================
# 7. Security Audit
# ============================================
echo -e "${YELLOW}🔐 7. Security Audit...${NC}"
npm run audit:ci > /dev/null 2>&1
echo -e "${GREEN}   ✅ Security audit başarılı${NC}"
echo ""

# ============================================
# 8. Optional Performance Check
# ============================================
echo -e "${YELLOW}⚡ 8. Optional Performance Check...${NC}"
if [ "$RUN_PERF_CHECK" = "true" ]; then
    bash ./scripts/performance-check.sh > /dev/null 2>&1
    echo -e "${GREEN}   ✅ Performance check başarılı${NC}"
else
    echo -e "${YELLOW}   ⚠️  Performance check atlandi (RUN_PERF_CHECK=true ile acabilirsiniz)${NC}"
fi
echo ""

# ============================================
# Sonuç
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Production Deployment Test Tamamlandı!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📋 Özet:${NC}"
echo "   ✅ Environment variable dosyaları mevcut"
echo "   ✅ Server build başarılı"
echo "   ✅ Client build başarılı"
echo "   ✅ Type check başarılı"
echo "   ✅ Testler çalıştırıldı"
echo "   ✅ Security audit başarılı"
echo ""
echo -e "${YELLOW}💡 Sonraki Adımlar:${NC}"
echo "   1. npm run smoke:production ile canli smoke test calistirin"
echo "   2. Render healthCheckPath olarak /api/readyz kullanin"
echo "   3. MongoDB backup stratejisini dogrulayin"
echo "   4. Sentry alert kurallarini ve owner listesini kontrol edin"
echo "   5. Production'a deploy edin"
echo ""
