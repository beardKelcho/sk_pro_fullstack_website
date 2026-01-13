#!/bin/bash

# SK Production - Git Branch Setup Script
# Bu script, production ve staging için gerekli branch'leri oluşturur

set -e

echo "🌿 Git Branch Setup Başlatılıyor..."

# Mevcut branch'i kontrol et
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Mevcut branch: $CURRENT_BRANCH"

# main branch kontrolü
if git show-ref --verify --quiet refs/heads/main; then
    echo "✅ main branch mevcut"
else
    echo "📦 main branch oluşturuluyor..."
    git checkout -b main
    echo "✅ main branch oluşturuldu"
fi

# develop branch kontrolü
if git show-ref --verify --quiet refs/heads/develop; then
    echo "✅ develop branch mevcut"
    git checkout develop
    git pull origin develop 2>/dev/null || true
else
    echo "📦 develop branch oluşturuluyor..."
    git checkout -b develop
    echo "✅ develop branch oluşturuldu"
fi

# Remote branch'leri push et
echo "🚀 Remote branch'leri push ediliyor..."
git push -u origin main 2>/dev/null || echo "⚠️  main branch zaten remote'da"
git push -u origin develop 2>/dev/null || echo "⚠️  develop branch zaten remote'da"

# Default branch'i develop yap (opsiyonel)
echo ""
echo "✅ Branch setup tamamlandı!"
echo ""
echo "📋 Branch Yapısı:"
echo "   - main (production)"
echo "   - develop (staging)"
echo ""
echo "💡 İpucu: Yeni özellikler için:"
echo "   git checkout develop"
echo "   git checkout -b feature/my-feature"
echo ""

# Orijinal branch'e geri dön
git checkout $CURRENT_BRANCH 2>/dev/null || true

echo "✨ Tamamlandı!"
