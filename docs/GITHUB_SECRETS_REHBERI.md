# 🔐 GitHub Secrets Yapılandırma Rehberi

> **CI/CD Pipeline için Gerekli GitHub Secrets**  
> Bu rehber, production deployment için GitHub repository'de ayarlanması gereken secret'ları açıklar.

---

## 📋 İçindekiler

1. [GitHub Secrets Nedir?](#github-secrets-nedir)
2. [Gerekli Secrets](#gerekli-secrets)
3. [Secrets Ekleme Adımları](#secrets-ekleme-adımları)
4. [Deploy Hook URL'leri Nasıl Alınır?](#deploy-hook-urlleri-nasıl-alınır)
5. [Secrets Kontrolü](#secrets-kontrolü)

---

## 🔑 GitHub Secrets Nedir?

GitHub Secrets, repository'nizde güvenli bir şekilde saklanan environment variable'lar ve API key'lerdir. Bu secret'lar:

- Sadece GitHub Actions workflow'larında kullanılabilir
- Repository ayarlarında görüntülenemez (sadece eklenebilir/silinebilir)
- Log'larda maskelenir (güvenlik için)

---

## 📝 Gerekli Secrets

### Zorunlu Secrets (Production Deployment için)

Aşağıdaki secret'lar production deployment için **zorunludur**:

#### 1. `RENDER_PRODUCTION_DEPLOY_HOOK_URL`
- **Açıklama**: Render backend service için production deploy hook URL'i
- **Nasıl Alınır**: [Render Deploy Hook](#render-deploy-hook)
- **Kullanım**: Production deployment'ı tetiklemek için

#### 2. `VERCEL_PRODUCTION_DEPLOY_HOOK_URL`
- **Açıklama**: Vercel frontend project için production deploy hook URL'i
- **Nasıl Alınır**: [Vercel Deploy Hook](#vercel-deploy-hook)
- **Kullanım**: Production deployment'ı tetiklemek için

### Opsiyonel Secrets (Staging Deployment için)

Staging deployment için aşağıdaki secret'lar **opsiyoneldir** (Git entegrasyonu yeterli):

#### 3. `RENDER_STAGING_DEPLOY_HOOK_URL`
- **Açıklama**: Render backend service için staging deploy hook URL'i
- **Nasıl Alınır**: [Render Deploy Hook](#render-deploy-hook)
- **Kullanım**: Staging deployment'ı tetiklemek için (opsiyonel)

#### 4. `VERCEL_STAGING_DEPLOY_HOOK_URL`
- **Açıklama**: Vercel frontend project için staging deploy hook URL'i
- **Nasıl Alınır**: [Vercel Deploy Hook](#vercel-deploy-hook)
- **Kullanım**: Staging deployment'ı tetiklemek için (opsiyonel)

### Opsiyonel Secrets (CI/CD Build için)

Build sırasında kullanılan environment variable'lar (opsiyonel):

#### 5. `NEXT_PUBLIC_API_URL`
- **Açıklama**: Build sırasında kullanılacak API URL
- **Değer**: `https://skproduction-api.onrender.com/api`
- **Kullanım**: CI/CD build sırasında (opsiyonel, fallback var)

#### 6. `NEXT_PUBLIC_BACKEND_URL`
- **Açıklama**: Build sırasında kullanılacak backend URL
- **Değer**: `https://skproduction-api.onrender.com`
- **Kullanım**: CI/CD build sırasında (opsiyonel, fallback var)

---

## 🔧 Secrets Ekleme Adımları

### Adım 1: GitHub Repository'ye Git

1. GitHub'da repository'nize gidin
2. **Settings** sekmesine tıklayın
3. Sol menüden **Secrets and variables** → **Actions** seçin

### Adım 2: Yeni Secret Ekle

1. **New repository secret** butonuna tıklayın
2. **Name** alanına secret adını girin (örn: `RENDER_PRODUCTION_DEPLOY_HOOK_URL`)
3. **Secret** alanına değeri girin (örn: deploy hook URL'i)
4. **Add secret** butonuna tıklayın

### Adım 3: Tüm Secrets'ı Ekleyin

Aşağıdaki secret'ları sırayla ekleyin:

```
RENDER_PRODUCTION_DEPLOY_HOOK_URL
VERCEL_PRODUCTION_DEPLOY_HOOK_URL
RENDER_STAGING_DEPLOY_HOOK_URL (opsiyonel)
VERCEL_STAGING_DEPLOY_HOOK_URL (opsiyonel)
```

---

## 🎣 Deploy Hook URL'leri Nasıl Alınır?

### Render Deploy Hook

#### Adım 1: Render Dashboard'a Git

1. Render hesabınıza giriş yapın: https://render.com
2. Backend service'inize tıklayın (örn: `skproduction-api`)

#### Adım 2: Deploy Hook Oluştur

1. **Settings** sekmesine gidin
2. **Manual Deploy Hook** bölümünü bulun
3. **Create Deploy Hook** butonuna tıklayın
4. Hook URL'i kopyalayın (örn: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`)

#### Adım 3: GitHub Secret'a Ekle

1. GitHub repository → Settings → Secrets → Actions
2. **New repository secret** → Name: `RENDER_PRODUCTION_DEPLOY_HOOK_URL`
3. Value: Kopyaladığınız hook URL'i
4. **Add secret**

**Not**: Staging için ayrı bir Render service varsa, aynı adımları tekrarlayın ve `RENDER_STAGING_DEPLOY_HOOK_URL` olarak ekleyin.

---

### Vercel Deploy Hook

#### Adım 1: Vercel Dashboard'a Git

1. Vercel hesabınıza giriş yapın: https://vercel.com
2. Frontend project'inize tıklayın (örn: `skproduction`)

#### Adım 2: Deploy Hook Oluştur

1. **Settings** sekmesine gidin
2. **Deploy Hooks** bölümünü bulun
3. **Create Hook** butonuna tıklayın
4. Ayarlar:
   - **Name**: `Production Deploy Hook`
   - **Git Branch**: `main` (production için)
   - **Environment**: `Production`
5. **Create Hook** butonuna tıklayın
6. Hook URL'i kopyalayın (örn: `https://api.vercel.com/v1/integrations/deploy/xxxxx`)

#### Adım 3: GitHub Secret'a Ekle

1. GitHub repository → Settings → Secrets → Actions
2. **New repository secret** → Name: `VERCEL_PRODUCTION_DEPLOY_HOOK_URL`
3. Value: Kopyaladığınız hook URL'i
4. **Add secret**

**Not**: Staging için ayrı bir Vercel project varsa, aynı adımları tekrarlayın ve `VERCEL_STAGING_DEPLOY_HOOK_URL` olarak ekleyin.

---

## ✅ Secrets Kontrolü

### GitHub Actions Workflow'unda Kontrol

Secrets'ların doğru ayarlandığını kontrol etmek için:

1. GitHub repository → **Actions** sekmesine gidin
2. Son workflow run'una tıklayın
3. **Trigger Render deploy hook** ve **Trigger Vercel deploy hook** step'lerini kontrol edin
4. Eğer secret yoksa, step'ler **SKIP** edilir (bu normaldir, Git entegrasyonu yeterli)

### Manuel Test

Secrets'ların çalıştığını test etmek için:

```bash
# Production'a deploy et
./scripts/deploy-production.sh

# GitHub Actions workflow'unu kontrol et
# Deploy hook step'leri çalışmalı
```

---

## 🔒 Güvenlik Notları

1. **Secret'ları asla commit etmeyin**: `.env` dosyaları `.gitignore`'da olmalı
2. **Secret'ları log'da görüntülemeyin**: GitHub Actions otomatik olarak maskeler
3. **Secret'ları düzenli olarak rotate edin**: Özellikle deploy hook URL'leri
4. **Sadece gerekli secret'ları ekleyin**: Gereksiz secret'lar güvenlik riski oluşturur

---

## 📚 İlgili Dokümanlar

- [Production Deployment Checklist](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- [Deployment README](./DEPLOYMENT_README.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 🆘 Sorun Giderme

### Problem: Deploy Hook Çalışmıyor

**Çözüm:**
1. Secret'ın doğru adla eklendiğini kontrol edin
2. Hook URL'inin doğru olduğunu kontrol edin
3. Render/Vercel dashboard'da hook'un aktif olduğunu kontrol edin
4. GitHub Actions log'larını kontrol edin

### Problem: Secret Bulunamıyor

**Çözüm:**
1. Secret'ın repository'de olduğunu kontrol edin (Settings → Secrets → Actions)
2. Secret adının tam olarak eşleştiğini kontrol edin (büyük/küçük harf duyarlı)
3. Workflow dosyasında secret adının doğru kullanıldığını kontrol edin

---

**Başarılar! 🚀**

*Son Güncelleme: 2026-01-08*
