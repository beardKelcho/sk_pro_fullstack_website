#!/bin/bash

# SK Production - Staging Deployment Script
# Bu script, develop branch'ini staging'e deploy eder

set -e

echo "🚀 Staging Deployment Başlatılıyor..."

# develop branch'inde olduğumuzdan emin ol
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "⚠️  Uyarı: develop branch'inde değilsiniz (Mevcut: $CURRENT_BRANCH)"
    read -p "Devam etmek istiyor musunuz? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Son değişiklikleri çek
echo "📥 Son değişiklikler çekiliyor..."
git pull origin develop

# Test'leri çalıştır
echo "🧪 Test'ler çalıştırılıyor..."
npm run test:all || {
    echo "❌ Test'ler başarısız! Deployment iptal edildi."
    exit 1
}

# Build kontrolü
echo "🔨 Build kontrolü yapılıyor..."
npm run build || {
    echo "❌ Build başarısız! Deployment iptal edildi."
    exit 1
}

# Commit ve push
echo "📤 develop branch'ine push ediliyor..."
git push origin develop

echo ""
echo "✅ Staging deployment tetiklendi!"
echo "🔗 Frontend: https://skproduction-staging.vercel.app"
echo "🔗 Backend: https://skproduction-api-staging.onrender.com"
echo ""
echo "⏳ Deployment tamamlanması 2-5 dakika sürebilir..."
