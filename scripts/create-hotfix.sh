#!/bin/bash

# SK Production - Hotfix Branch Oluşturma Script
# Bu script, kritik bug düzeltmeleri için hotfix branch'i oluşturur

set -e

if [ -z "$1" ]; then
    echo "❌ Hata: Hotfix adı belirtilmedi"
    echo ""
    echo "Kullanım: ./scripts/create-hotfix.sh <hotfix-name>"
    echo "Örnek: ./scripts/create-hotfix.sh security-patch"
    exit 1
fi

HOTFIX_NAME=$1
HOTFIX_BRANCH="hotfix/$HOTFIX_NAME"

echo "🚨 Hotfix Branch Oluşturuluyor: $HOTFIX_BRANCH"

# main branch'ine geç
echo "🔄 main branch'ine geçiliyor..."
git checkout main
git pull origin main

# Hotfix branch oluştur
echo "📦 Hotfix branch oluşturuluyor..."
git checkout -b $HOTFIX_BRANCH

echo ""
echo "✅ Hotfix branch oluşturuldu: $HOTFIX_BRANCH"
echo ""
echo "💡 Sonraki adımlar:"
echo "   1. Bug'ı düzelt"
echo "   2. Test et"
echo "   3. Commit et: git commit -m 'fix: Description'"
echo "   4. Push et: git push origin $HOTFIX_BRANCH"
echo "   5. main'e merge et ve production'a deploy et"
echo ""
