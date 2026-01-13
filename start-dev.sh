#!/bin/bash

# SK Production - Development Server Başlatma Script'i

echo "🚀 SK Production Development Server'ları Başlatılıyor..."
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Port kontrolü
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port $port zaten kullanımda!${NC}"
        read -p "Port'u temizlemek ister misiniz? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            lsof -ti:$port | xargs kill -9 2>/dev/null
            sleep 1
            echo -e "${GREEN}✅ Port $port temizlendi${NC}"
        fi
    fi
}

# Port'ları kontrol et
check_port 5001
check_port 3000

echo ""
echo -e "${BLUE}📦 Bağımlılıklar kontrol ediliyor...${NC}"

# Server bağımlılıkları
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}Server node_modules bulunamadı, yükleniyor...${NC}"
    cd server && npm install && cd ..
fi

# Client bağımlılıkları
if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}Client node_modules bulunamadı, yükleniyor...${NC}"
    cd client && npm install && cd ..
fi

echo -e "${GREEN}✅ Bağımlılıklar hazır${NC}"
echo ""

# Server ve Client'ı başlat
echo -e "${BLUE}🚀 Server ve Client başlatılıyor...${NC}"
echo ""
echo -e "${GREEN}Server:${NC} http://localhost:5001"
echo -e "${GREEN}Client:${NC} http://localhost:3000"
echo -e "${GREEN}API Docs:${NC} http://localhost:5001/api-docs"
echo ""
echo "Çıkmak için Ctrl+C basın"
echo ""

# concurrently ile başlat (eğer yüklüyse)
if command -v npx &> /dev/null; then
    npx concurrently --names "SERVER,CLIENT" --prefix-colors "blue,green" \
        "cd server && npm run dev" \
        "cd client && npm run dev"
else
    # concurrently yoksa ayrı ayrı başlat
    echo -e "${YELLOW}concurrently bulunamadı, ayrı terminal'lerde başlatılıyor...${NC}"
    echo ""
    echo "Server için: cd server && npm run dev"
    echo "Client için: cd client && npm run dev"
    echo ""
    
    # Background'da başlat
    cd server && npm run dev > /tmp/server-dev.log 2>&1 &
    SERVER_PID=$!
    cd ../client && npm run dev > /tmp/client-dev.log 2>&1 &
    CLIENT_PID=$!
    
    echo "Server PID: $SERVER_PID"
    echo "Client PID: $CLIENT_PID"
    echo ""
    echo "Logları görmek için:"
    echo "  tail -f /tmp/server-dev.log"
    echo "  tail -f /tmp/client-dev.log"
    echo ""
    echo "Durdurmak için: kill $SERVER_PID $CLIENT_PID"
    
    # Process'leri bekle
    wait
fi

