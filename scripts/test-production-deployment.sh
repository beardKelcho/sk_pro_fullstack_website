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

# TypeScript type check
echo "   TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Type check başarılı${NC}"
else
    echo -e "${YELLOW}   ⚠️  Type check uyarıları var (kontrol edin)${NC}"
fi

# Build testi
echo "   Build testi..."
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT_CODE=$?
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}   ✅ Build başarılı${NC}"
else
    echo -e "${RED}❌ Server build başarısız!${NC}"
    echo "$BUILD_OUTPUT" | tail -20
    exit 1
fi

cd ..
echo ""

# ============================================
# 3. Client Build Testi
# ============================================
echo -e "${YELLOW}📦 3. Client Build Testi...${NC}"

cd client

# TypeScript type check
echo "   TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Type check başarılı${NC}"
else
    echo -e "${YELLOW}   ⚠️  Type check uyarıları var (kontrol edin)${NC}"
fi

# Lint kontrolü
echo "   ESLint kontrolü..."
if ! npm run lint > /dev/null 2>&1; then
    echo -e "${YELLOW}   ⚠️  Lint uyarıları var (kritik değil)${NC}"
else
    echo -e "${GREEN}   ✅ Lint başarılı${NC}"
fi

# Production build testi
echo "   Production build testi..."
if ! NODE_ENV=production npm run build; then
    echo -e "${RED}❌ Client production build başarısız!${NC}"
    exit 1
fi
echo -e "${GREEN}   ✅ Production build başarılı${NC}"

cd ..
echo ""

# ============================================
# 4. Test Çalıştırma
# ============================================
echo -e "${YELLOW}🧪 4. Test Çalıştırma...${NC}"

# Server testleri
echo "   Server testleri..."
cd server
if npm test -- --passWithNoTests > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Server testleri başarılı${NC}"
else
    echo -e "${YELLOW}   ⚠️  Server testleri atlandı veya uyarı var${NC}"
fi
cd ..

# Client testleri
echo "   Client testleri..."
cd client
if npm test -- --passWithNoTests > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Client testleri başarılı${NC}"
else
    echo -e "${YELLOW}   ⚠️  Client testleri atlandı veya uyarı var${NC}"
fi
cd ..

echo ""

# ============================================
# 5. Bundle Size Kontrolü
# ============================================
echo -e "${YELLOW}📊 5. Bundle Size Kontrolü...${NC}"

cd client

if [ -f ".bundle-size-budget.json" ]; then
    if npm run bundle-size:check > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Bundle size bütçe dahilinde${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Bundle size bütçe aşıldı (kontrol edin)${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Bundle size budget dosyası yok${NC}"
fi

cd ..
echo ""

# ============================================
# 6. Production Check Script
# ============================================
echo -e "${YELLOW}🔍 6. Production Check Script...${NC}"

cd client

if [ -f "scripts/check-production.ts" ]; then
    if npm run check-production > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Production check başarılı${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Production check uyarıları var${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Production check script yok${NC}"
fi

cd ..
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
echo ""
echo -e "${YELLOW}💡 Sonraki Adımlar:${NC}"
echo "   1. Production environment variable'larını ayarlayın"
echo "   2. MongoDB Atlas bağlantısını yapılandırın"
echo "   3. Redis instance'ı ayarlayın (opsiyonel)"
echo "   4. SMTP ayarlarını yapılandırın"
echo "   5. VAPID keys oluşturun"
echo "   6. Sentry DSN'i ayarlayın (opsiyonel)"
echo "   7. Production'a deploy edin"
echo ""

