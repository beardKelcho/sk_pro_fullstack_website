#!/bin/bash

# SK Production - Production Deployment Script
# Bu script, main branch'ini production'a deploy eder

set -e

echo "🚀 Production Deployment Başlatılıyor..."

# Pre-deployment check (opsiyonel - SKIP_PRE_CHECK=1 ile atlanabilir)
if [ -z "$SKIP_PRE_CHECK" ] && [ -f "scripts/pre-deployment-check.sh" ]; then
    echo "🔍 Pre-deployment check çalıştırılıyor..."
    if ! bash scripts/pre-deployment-check.sh; then
        echo "❌ Pre-deployment check başarısız! Deployment iptal edildi."
        echo "💡 SKIP_PRE_CHECK=1 ile atlayabilirsiniz (önerilmez)"
        exit 1
    fi
    echo ""
fi

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

# Onay iste
echo "⚠️  PRODUCTION DEPLOYMENT"
echo "Bu işlem production ortamına deploy edecek!"
read -p "Emin misiniz? (yes/no): " confirmation
if [ "$confirmation" != "yes" ]; then
    echo "❌ Deployment iptal edildi."
    exit 1
fi

# develop'dan son değişiklikleri çek
echo "📥 develop branch'inden son değişiklikler çekiliyor..."
git pull origin develop

# Test'leri çalıştır
if [ -z "$SKIP_TESTS" ]; then
    echo "🧪 Test'ler çalıştırılıyor..."
    npm run test:all || {
        echo "❌ Test'ler başarısız! Deployment iptal edildi."
        echo "💡 SKIP_TESTS=1 ile testleri atlayabilirsiniz (önerilmez)"
        exit 1
    }
else
    echo "⏩ SKIP_TESTS tanımlı, testler atlanıyor..."
fi

# Type check
echo "🔍 Type check yapılıyor..."
npm run type-check || {
    echo "❌ Type check başarısız! Deployment iptal edildi."
    exit 1
}

# Lint
# Lint
if [ -z "$SKIP_LINT" ]; then
    echo "🔍 Lint kontrolü yapılıyor..."
    npm run lint || {
        echo "❌ Lint kontrolü başarısız! Deployment iptal edildi."
        echo "💡 SKIP_LINT=1 ile lint kontrolünü atlayabilirsiniz (önerilmez)"
        exit 1
    }
else
    echo "⏩ SKIP_LINT tanımlı, lint kontrolü atlanıyor..."
fi

# Build
echo "🔨 Build yapılıyor..."
npm run build || {
    echo "❌ Build başarısız! Deployment iptal edildi."
    exit 1
}

# main branch'ine geç
echo "🔄 main branch'ine geçiliyor..."
git checkout main
git pull origin main

# develop'ı main'e merge et
echo "🔀 develop branch'i main'e merge ediliyor..."
git merge develop --no-ff -m "Merge develop into main for production deployment"

# Version tag oluştur
VERSION=$(date +%Y.%m.%d)-$(git rev-parse --short HEAD)
echo "🏷️  Version tag oluşturuluyor: v$VERSION"
git tag -a "v$VERSION" -m "Production deployment: $VERSION"

# Push
echo "📤 main branch'ine push ediliyor..."
git push origin main
git push origin --tags

echo ""
echo "✅ Production deployment tamamlandı!"
if [ -n "$PRODUCTION_FRONTEND_URL" ]; then
    echo "🔗 Frontend: $PRODUCTION_FRONTEND_URL"
else
    echo "🔗 Frontend: hosting platform uzerinde tanimli production URL"
fi
if [ -n "$PRODUCTION_BACKEND_URL" ]; then
    echo "🔗 Backend: $PRODUCTION_BACKEND_URL"
else
    echo "🔗 Backend: hosting platform uzerinde tanimli production API URL"
fi
echo "🏷️  Version: v$VERSION"
echo ""
echo "⏳ Deployment tamamlanması 3-7 dakika sürebilir..."
echo ""
echo "💡 Deployment sonrası doğrulama için:"
echo "   BACKEND_URL=... FRONTEND_URL=... npm run smoke:production"
echo ""
