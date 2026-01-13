#!/bin/bash

# MongoDB Atlas IP Whitelist Otomatik Ekleme Script'i
# Bu script kullanıcıyı MongoDB Atlas'a yönlendirir ve adım adım rehberlik eder

echo "=== MongoDB Atlas IP Whitelist Ayarı ==="
echo ""
echo "Mevcut IP adresiniz:"
CURRENT_IP=$(curl -s https://api.ipify.org 2>/dev/null || echo "Alınamadı")
echo "  $CURRENT_IP"
echo ""

# macOS için
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 MongoDB Atlas Dashboard'u açıyorum..."
    echo ""
    echo "📋 Yapılacaklar:"
    echo "   1. MongoDB Atlas'a giriş yapın"
    echo "   2. Sol menüden 'Network Access' seçin"
    echo "   3. 'Add IP Address' butonuna tıklayın"
    echo "   4. IP adresini ekleyin: $CURRENT_IP"
    echo "      VEYA 'Allow Access from Anywhere' (0.0.0.0/0)"
    echo "   5. 'Confirm' butonuna tıklayın"
    echo ""
    
    # MongoDB Atlas Network Access sayfasını aç
    open "https://cloud.mongodb.com/v2#/security/network/whitelist" 2>/dev/null || \
    open "https://cloud.mongodb.com/" 2>/dev/null
    
    echo "✅ Browser açıldı!"
    echo ""
    echo "⏳ IP'yi ekledikten sonra 1-2 dakika bekleyin..."
    echo ""
    echo "🔍 Bağlantıyı test etmek için:"
    echo "   cd server && node -e \"require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS: 10000}).then(() => console.log('✅ Bağlantı başarılı!')).catch(err => console.log('❌ Hata:', err.message));\""
    echo ""
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🌐 MongoDB Atlas Dashboard'u açıyorum..."
    xdg-open "https://cloud.mongodb.com/v2#/security/network/whitelist" 2>/dev/null || \
    xdg-open "https://cloud.mongodb.com/" 2>/dev/null
    
    echo "✅ Browser açıldı!"
    echo ""
    echo "📋 Yapılacaklar:"
    echo "   1. MongoDB Atlas'a giriş yapın"
    echo "   2. Sol menüden 'Network Access' seçin"
    echo "   3. 'Add IP Address' butonuna tıklayın"
    echo "   4. IP adresini ekleyin: $CURRENT_IP"
    echo "      VEYA 'Allow Access from Anywhere' (0.0.0.0/0)"
    echo "   5. 'Confirm' butonuna tıklayın"
    echo ""
else
    echo "⚠️  Bu script macOS ve Linux için optimize edilmiştir."
    echo ""
    echo "📋 Manuel olarak yapın:"
    echo "   1. https://cloud.mongodb.com/ adresine gidin"
    echo "   2. Network Access → Add IP Address"
    echo "   3. IP: $CURRENT_IP"
    echo ""
fi

echo "💡 IP ekledikten sonra bağlantıyı test edin:"
echo "   cd server"
echo "   node -e \"require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS: 10000}).then(() => console.log('✅ Bağlantı başarılı!')).catch(err => console.log('❌ Hata:', err.message));\""

