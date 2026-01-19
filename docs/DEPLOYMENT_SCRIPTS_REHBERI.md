# 🛠️ Deployment Scripts Rehberi

> **Production Deployment için Yardımcı Script'ler**  
> Bu rehber, production deployment sürecinde kullanılabilecek tüm script'leri açıklar.

---

## 📋 İçindekiler

1. [Pre-Deployment Scripts](#pre-deployment-scripts)
2. [Deployment Scripts](#deployment-scripts)
3. [Post-Deployment Scripts](#post-deployment-scripts)
4. [Kullanım Senaryoları](#kullanım-senaryoları)

---

## 🔍 Pre-Deployment Scripts

### 0. `generate-secrets.sh`

**Amaç**: Güçlü, rastgele secret'lar oluşturur (JWT, NextAuth vb.).

**Kullanım**:
```bash
npm run generate:secrets
# veya
./scripts/generate-secrets.sh
```

**Çıktı**:
- JWT_SECRET (64 bytes)
- JWT_REFRESH_SECRET (64 bytes)
- NEXTAUTH_SECRET (32 bytes)

**Örnek**:
```bash
$ npm run generate:secrets

🔐 Secret Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JWT Secret (64 bytes):
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2

JWT Refresh Secret (64 bytes):
b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3

NextAuth Secret (32 bytes):
c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2

💡 Bu secret'ları .env dosyalarınıza kopyalayın
```

---

### 1. `pre-deployment-check.sh`

**Amaç**: Production deployment öncesi tüm kontrolleri yapar.

**Kullanım**:
```bash
npm run pre-deploy:check
# veya
./scripts/pre-deployment-check.sh
```

**Kontroller**:
- ✅ Git status (uncommitted changes)
- ✅ Environment variables
- ✅ Dependencies (node_modules)
- ✅ Build test (server + client)
- ✅ Type check (server + client)
- ✅ Lint check (server + client)
- ✅ Test execution
- ✅ Security audit (npm audit)

**Çıktı**:
- Tüm kontroller başarılı → Production'a deploy edilebilir
- Uyarılar var → Deploy edilebilir ama dikkatli olun
- Hatalar var → Deploy etmeden önce düzeltin

---

### 2. `validate-production-env.sh`

**Amaç**: Production environment variable'larını kontrol eder.

**Kullanım**:
```bash
npm run validate:env
# veya
./scripts/validate-production-env.sh
```

**Kontroller**:
- ✅ `server/.env` dosyası mevcut mu?
- ✅ `client/.env.local` dosyası mevcut mu?
- ✅ Gerekli environment variable'lar tanımlı mı?
- ✅ Environment variable'lar varsayılan değerde mi? (production için değiştirilmeli)
- ✅ JWT secrets yeterince güçlü mü? (en az 32 karakter)
- ✅ `NODE_ENV=production` mı?

**Gerekli Environment Variables**:

**Server**:
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL`

**Client**:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_SITE_URL`

---

## 🚀 Deployment Scripts

### 3. `deploy-production.sh`

**Amaç**: Production'a deploy eder.

**Kullanım**:
```bash
npm run deploy:production
# veya
./scripts/deploy-production.sh
```

**Adımlar**:
1. Develop branch kontrolü
2. Onay iste
3. Test'leri çalıştır
4. Type check
5. Lint kontrolü
6. Build
7. Main branch'e merge
8. Version tag oluştur
9. Push

**Detaylı rehber**: [DEPLOYMENT_README.md](./DEPLOYMENT_README.md)

---

### 4. `deploy-staging.sh`

**Amaç**: Staging'e deploy eder.

**Kullanım**:
```bash
npm run deploy:staging
# veya
./scripts/deploy-staging.sh
```

**Adımlar**:
1. Develop branch kontrolü
2. Test'leri çalıştır
3. Build kontrolü
4. Push

---

## ✅ Post-Deployment Scripts

### 5. `verify-production-deployment.sh`

**Amaç**: Production deployment sonrası sistemin çalıştığını doğrular.

**Kullanım**:
```bash
npm run verify:deployment
# veya
./scripts/verify-production-deployment.sh
```

**Environment Variables** (opsiyonel):
```bash
BACKEND_URL=https://skproduction-api.onrender.com \
FRONTEND_URL=https://skproduction.vercel.app \
./scripts/verify-production-deployment.sh
```

**Kontroller**:
- ✅ Backend `/api/livez` (process up)
- ✅ Backend `/api/readyz` (DB ready)
- ✅ Backend `/api/health` (full health check)
- ✅ Backend `/api-docs` (API documentation)
- ✅ Frontend homepage
- ✅ Frontend `/admin/login`
- ✅ Frontend → Backend connectivity
- ✅ SSL/HTTPS check

**Çıktı**:
- Tüm kontroller başarılı → Deployment başarılı
- Uyarılar var → Sistem çalışıyor ama dikkatli olun
- Hatalar var → Deployment başarısız, sorunları düzeltin

---

### 6. `test-production-deployment.sh`

**Amaç**: Production deployment'ı test eder (local'de).

**Kullanım**:
```bash
npm run test:production
# veya
./scripts/test-production-deployment.sh
```

**Kontroller**:
- ✅ Environment variable template'leri
- ✅ Build test
- ✅ Type check
- ✅ Lint kontrolü
- ✅ Test çalıştırma

---

## 📖 Kullanım Senaryoları

### Senaryo 1: İlk Production Deployment

```bash
# 1. Pre-deployment check
npm run pre-deploy:check

# 2. Environment variables kontrolü
npm run validate:env

# 3. Production'a deploy
npm run deploy:production

# 4. Deployment verification
npm run verify:deployment
```

### Senaryo 2: Normal Deployment

```bash
# 1. Hızlı pre-deployment check
npm run pre-deploy:check

# 2. Deploy
npm run deploy:production

# 3. Verify
npm run verify:deployment
```

### Senaryo 3: Sadece Environment Variables Kontrolü

```bash
# Environment variables'ı kontrol et
npm run validate:env
```

### Senaryo 4: Deployment Sonrası Kontrol

```bash
# Deployment sonrası sistem kontrolü
BACKEND_URL=https://your-backend-url.com \
FRONTEND_URL=https://your-frontend-url.com \
npm run verify:deployment
```

---

## 🔧 Script Detayları

### Pre-Deployment Check

```bash
./scripts/pre-deployment-check.sh
```

**Çıktı Örneği**:
```
🚀 Pre-Deployment Check - Production Deployment Öncesi Kontroller
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 1. Git Status Kontrolü...
✅ Tüm değişiklikler commit edilmiş
   Current branch: develop

📋 2. Environment Variables Kontrolü...
✅ server/.env dosyası mevcut
✅ MONGO_URI tanımlı
✅ JWT_SECRET tanımlı
...

✅ Tüm kontroller başarılı! Production'a deploy edilebilir.
```

### Validate Environment

```bash
./scripts/validate-production-env.sh
```

**Çıktı Örneği**:
```
🔍 Production Environment Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Server Environment Variables Kontrolü...
✅ server/.env dosyası mevcut
✅ MONGO_URI tanımlı
✅ JWT_SECRET tanımlı
...

✅ Tüm kontroller başarılı!
```

### Verify Deployment

```bash
./scripts/verify-production-deployment.sh
```

**Çıktı Örneği**:
```
🔍 Production Deployment Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend URL: https://skproduction-api.onrender.com
Frontend URL: https://skproduction.vercel.app

📋 Backend Health Checks...
  Checking /api/livez... ✅ OK
  Checking /api/readyz... ✅ OK
  Checking /api/health... ✅ OK
    ✅ MongoDB connected

📋 Frontend Checks...
  Checking frontend homepage... ✅ OK
  Checking /admin/login... ✅ OK

✅ Tüm kontroller başarılı! Production deployment başarılı.
```

---

## 🆘 Sorun Giderme

### Problem: Pre-deployment check başarısız

**Çözüm**:
1. Hata mesajlarını okuyun
2. Eksik environment variable'ları ekleyin
3. Build hatalarını düzeltin
4. Test'leri geçirin

### Problem: Environment validation başarısız

**Çözüm**:
1. `server/.env` ve `client/.env.local` dosyalarının mevcut olduğunu kontrol edin
2. Gerekli environment variable'ları ekleyin
3. Varsayılan değerleri production değerleriyle değiştirin

### Problem: Deployment verification başarısız

**Çözüm**:
1. Backend ve frontend URL'lerini kontrol edin
2. Health check endpoint'lerini manuel test edin
3. Render/Vercel log'larını kontrol edin
4. MongoDB bağlantısını kontrol edin

---

## 📚 İlgili Dokümanlar

- [Production Deployment Checklist](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- [Production Hızlı Başlangıç](./PRODUCTION_HIZLI_BASLANGIC.md)
- [Deployment README](./DEPLOYMENT_README.md)
- [GitHub Secrets Rehberi](./GITHUB_SECRETS_REHBERI.md)

---

**Başarılar! 🚀**

*Son Güncelleme: 2026-01-08*
