#!/bin/bash

# Port Kontrol Script'i
# Backend ve Frontend portlarını kontrol eder

echo "🔍 Port Kontrolü"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Backend Port (5001)
echo "📡 Backend Server Port (5001):"
if lsof -ti:5001 > /dev/null 2>&1; then
    PID=$(lsof -ti:5001)
    PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "Bilinmeyen")
    echo "   ✅ Port 5001 KULLANIMDA"
    echo "   Process ID: $PID"
    echo "   Process: $PROCESS"
    echo "   Test: curl http://localhost:5001/api/health"
else
    echo "   ❌ Port 5001 BOŞ"
    echo "   Backend server çalışmıyor"
fi
echo ""

# Frontend Port (3000)
echo "🌐 Frontend Client Port (3000):"
if lsof -ti:3000 > /dev/null 2>&1; then
    PID=$(lsof -ti:3000)
    PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "Bilinmeyen")
    echo "   ✅ Port 3000 KULLANIMDA"
    echo "   Process ID: $PID"
    echo "   Process: $PROCESS"
    echo "   URL: http://localhost:3000"
else
    echo "   ❌ Port 3000 BOŞ"
    echo "   Frontend client çalışmıyor"
fi
echo ""

# ngrok Port (4040)
echo "🔗 ngrok Dashboard Port (4040):"
if lsof -ti:4040 > /dev/null 2>&1; then
    echo "   ✅ ngrok Dashboard ÇALIŞIYOR"
    echo "   URL: http://127.0.0.1:4040"
    # ngrok URL'ini al
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$NGROK_URL" ]; then
        echo "   Public URL: $NGROK_URL"
    fi
else
    echo "   ❌ ngrok Dashboard ÇALIŞMIYOR"
fi
echo ""

# Environment Variables Kontrolü
echo "⚙️  Environment Variables:"
if [ -f "server/.env" ]; then
    SERVER_PORT=$(grep "^PORT=" server/.env | cut -d'=' -f2)
    if [ "$SERVER_PORT" = "5001" ]; then
        echo "   ✅ server/.env: PORT=$SERVER_PORT (DOĞRU)"
    else
        echo "   ⚠️  server/.env: PORT=$SERVER_PORT (5001 OLMALI!)"
    fi
else
    echo "   ❌ server/.env dosyası bulunamadı"
fi

if [ -f "client/.env.local" ]; then
    CLIENT_API=$(grep "NEXT_PUBLIC_API_URL=" client/.env.local | cut -d'=' -f2)
    if echo "$CLIENT_API" | grep -q "5001"; then
        echo "   ✅ client/.env.local: NEXT_PUBLIC_API_URL=$CLIENT_API (DOĞRU)"
    else
        echo "   ⚠️  client/.env.local: NEXT_PUBLIC_API_URL=$CLIENT_API (5001 içermeli!)"
    fi
else
    echo "   ⚠️  client/.env.local dosyası bulunamadı (opsiyonel)"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "💡 Port'u temizlemek için: lsof -ti:5001 | xargs kill -9"
echo ""

