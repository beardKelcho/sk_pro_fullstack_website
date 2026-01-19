#!/bin/bash

# ============================================
# SK Production - Secret Generator
# ============================================
# Bu script güçlü, rastgele secret'lar oluşturur

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 Secret Generator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js bulunamadı, openssl kullanılıyor...${NC}"
    USE_NODE=false
else
    USE_NODE=true
fi

# Secret oluşturma fonksiyonu
generate_secret() {
    local length=${1:-64}
    if [ "$USE_NODE" = true ]; then
        node -e "console.log(require('crypto').randomBytes($length).toString('hex'))"
    else
        openssl rand -hex $((length / 2))
    fi
}

echo -e "${GREEN}JWT Secret (64 bytes):${NC}"
JWT_SECRET=$(generate_secret 64)
echo "$JWT_SECRET"
echo ""

echo -e "${GREEN}JWT Refresh Secret (64 bytes):${NC}"
JWT_REFRESH_SECRET=$(generate_secret 64)
echo "$JWT_REFRESH_SECRET"
echo ""

echo -e "${GREEN}NextAuth Secret (32 bytes):${NC}"
NEXTAUTH_SECRET=$(generate_secret 32)
echo "$NEXTAUTH_SECRET"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Bu secret'ları .env dosyalarınıza kopyalayın:${NC}"
echo ""
echo "Server .env:"
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo ""
echo "Client .env.local:"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo ""
