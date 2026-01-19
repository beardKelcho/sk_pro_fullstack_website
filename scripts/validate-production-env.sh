#!/bin/bash

# ============================================
# SK Production - Production Environment Validation
# ============================================
# Bu script production deployment öncesi environment variable'ları kontrol eder

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Production Environment Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ERRORS=0
WARNINGS=0

# ============================================
# Server Environment Variables
# ============================================
echo -e "${YELLOW}📋 Server Environment Variables Kontrolü...${NC}"

if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ server/.env dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}   💡 İpucu: cp server/.env.example server/.env${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ server/.env dosyası mevcut${NC}"
    
    # Gerekli değişkenleri kontrol et
    source server/.env 2>/dev/null || true
    
    REQUIRED_VARS=(
        "MONGO_URI"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "CLIENT_URL"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ $var tanımlı değil${NC}"
            ERRORS=$((ERRORS + 1))
        elif [[ "${!var}" == *"change-this"* ]] || [[ "${!var}" == *"your-"* ]]; then
            echo -e "${RED}❌ $var varsayılan değerde (production için değiştirilmeli)${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ $var tanımlı${NC}"
        fi
    done
    
    # NODE_ENV kontrolü
    if [ "$NODE_ENV" != "production" ]; then
        echo -e "${YELLOW}⚠️  NODE_ENV=$NODE_ENV (production olmalı)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # JWT Secret güçlülük kontrolü
    if [ ${#JWT_SECRET} -lt 32 ]; then
        echo -e "${YELLOW}⚠️  JWT_SECRET çok kısa (en az 32 karakter önerilir)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""

# ============================================
# Client Environment Variables
# ============================================
echo -e "${YELLOW}📋 Client Environment Variables Kontrolü...${NC}"

if [ ! -f "client/.env.local" ]; then
    echo -e "${RED}❌ client/.env.local dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}   💡 İpucu: cp client/.env.local.example client/.env.local${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ client/.env.local dosyası mevcut${NC}"
    
    # Gerekli değişkenleri kontrol et
    source client/.env.local 2>/dev/null || true
    
    REQUIRED_VARS=(
        "NEXT_PUBLIC_API_URL"
        "NEXT_PUBLIC_BACKEND_URL"
        "NEXT_PUBLIC_SITE_URL"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ $var tanımlı değil${NC}"
            ERRORS=$((ERRORS + 1))
        elif [[ "${!var}" == *"localhost"* ]] && [[ "$NODE_ENV" == "production" ]]; then
            echo -e "${RED}❌ $var localhost içeriyor (production için değiştirilmeli)${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ $var tanımlı${NC}"
        fi
    done
fi

echo ""

# ============================================
# Özet
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tüm kontroller başarılı!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS uyarı var, ancak production'a deploy edilebilir${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS hata bulundu! Production'a deploy etmeden önce düzeltin.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS uyarı da var${NC}"
    fi
    exit 1
fi
