# 🔄 SK Production - Production'da Geliştirme Rehberi

> **Production'da Güvenli Geliştirme Stratejisi**  
> Web sitesi yayında, admin paneli geliştirmeleri devam ederken nasıl çalışılır?

---

## 📋 İçindekiler

1. [Genel Strateji](#genel-strateji)
2. [Ortam Yapılandırması](#ortam-yapılandırması)
3. [Git Branch Stratejisi](#git-branch-stratejisi)
4. [Staging Environment Kurulumu](#staging-environment-kurulumu)
5. [Geliştirme Süreci](#geliştirme-süreci)
6. [Deployment Süreci](#deployment-süreci)
7. [Hotfix Süreci](#hotfix-süreci)
8. [Best Practices](#best-practices)

---

## 🎯 Genel Strateji

### Senaryo
- ✅ **Web Sitesi:** Production'da, çalışıyor, kullanıcılar erişiyor
- 🔧 **Admin Paneli:** Geliştirmeler devam ediyor, yeni özellikler ekleniyor

### Çözüm: 3 Ortam Stratejisi

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Development │ --> │   Staging   │ --> │ Production  │
│  (Local)    │     │  (Test)     │     │  (Canlı)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. **Development (Local):** Geliştirme yapılan yer
2. **Staging (Test):** Production'a göndermeden önce test edilen yer
3. **Production (Canlı):** Kullanıcıların eriştiği yer

---

## 🏗️ Ortam Yapılandırması

### 1. Development (Local)

**Kullanım:** Günlük geliştirme

```bash
# Local'de çalıştırma
npm run dev
```

**Özellikler:**
- Hot reload aktif
- Debug modu açık
- Development database (ayrı MongoDB cluster veya local)
- Console.log'lar görünür

### 2. Staging (Test Ortamı)

**Kullanım:** Production'a göndermeden önce test

**Kurulum:**
- Ayrı Vercel projesi (frontend)
- Ayrı Render/Heroku servisi (backend)
- Ayrı MongoDB database (staging)

**URL Örnekleri:**
- Frontend: `https://skproduction-staging.vercel.app`
- Backend: `https://skproduction-api-staging.onrender.com`

### 3. Production (Canlı)

**Kullanım:** Kullanıcıların eriştiği ortam

**URL Örnekleri:**
- Frontend: `https://skproduction.com`
- Backend: `https://api.skproduction.com`

---

## 🌿 Git Branch Stratejisi

### Branch Yapısı

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/admin-improvements
  │     ├── feature/new-dashboard
  │     └── feature/calendar-enhancements
  │
  └── hotfix/critical-bug
```

### Branch Açıklamaları

#### 1. `main` Branch (Production)
- ✅ **Sadece production-ready kod**
- ✅ Her commit production'a deploy edilir
- ✅ Sadece `develop`'dan merge edilir (veya hotfix)
- ✅ Tag'lenir (v1.0.0, v1.1.0, vb.)

#### 2. `develop` Branch (Staging)
- 🔧 **Geliştirme branch'i**
- 🔧 Feature branch'ler buraya merge edilir
- 🔧 Staging'e otomatik deploy edilir
- 🔧 Test edildikten sonra `main`'e merge edilir

#### 3. `feature/*` Branch'ler
- 🆕 **Yeni özellikler için**
- 🆕 `develop`'dan açılır
- 🆕 Tamamlandığında `develop`'a merge edilir
- 🆕 Örnek: `feature/admin-dashboard-v2`

#### 4. `hotfix/*` Branch'ler
- 🚨 **Kritik bug'lar için**
- 🚨 `main`'den açılır
- 🚨 Düzeltildikten sonra hem `main` hem `develop`'a merge edilir
- 🚨 Örnek: `hotfix/security-patch`

---

## 🚀 Staging Environment Kurulumu

### Adım 1: Staging MongoDB Atlas

1. MongoDB Atlas'ta **yeni bir cluster** oluşturun
   - Name: `sk-production-staging`
   - Tier: M0 (Free) yeterli
2. **Yeni database user** oluşturun
3. **Network Access:** Staging backend IP'sini ekleyin
4. Connection string'i alın

### Adım 2: Staging Backend (Render)

1. Render'da **yeni Web Service** oluşturun
   - Name: `skproduction-api-staging`
   - Branch: `develop`
   - Root Directory: `server`
2. Environment Variables:
   ```env
   NODE_ENV=staging
   PORT=5001
   MONGO_URI=mongodb+srv://...staging-cluster...
   JWT_SECRET=staging-jwt-secret
   CLIENT_URL=https://skproduction-staging.vercel.app
   CORS_ORIGIN=https://skproduction-staging.vercel.app
   ```

### Adım 3: Staging Frontend (Vercel)

1. Vercel'de **yeni proje** oluşturun
   - Name: `skproduction-staging`
   - Branch: `develop`
   - Root Directory: `client`
2. Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://skproduction-api-staging.onrender.com/api
   NEXT_PUBLIC_BACKEND_URL=https://skproduction-api-staging.onrender.com
   NODE_ENV=staging
   ```

### Adım 4: Otomatik Deploy Ayarları

#### Render (Backend)
- **Auto-Deploy:** `develop` branch'ine push yapıldığında otomatik deploy

#### Vercel (Frontend)
- **Auto-Deploy:** `develop` branch'ine push yapıldığında otomatik deploy

---

## 💻 Geliştirme Süreci

### Senaryo: Yeni Admin Panel Özelliği Ekleme

#### 1. Feature Branch Oluştur

```bash
# develop branch'ine geç
git checkout develop
git pull origin develop

# Yeni feature branch oluştur
git checkout -b feature/admin-dashboard-v2

# Veya daha spesifik
git checkout -b feature/advanced-filtering
```

#### 2. Geliştirme Yap

```bash
# Local'de çalıştır
npm run dev

# Değişiklikleri yap
# - Yeni component'ler ekle
# - API endpoint'leri geliştir
# - Test yaz
```

#### 3. Commit ve Push

```bash
# Değişiklikleri commit et
git add .
git commit -m "feat(admin): Add advanced filtering to dashboard"

# Feature branch'i push et
git push origin feature/admin-dashboard-v2
```

#### 4. Pull Request Oluştur

1. GitHub'da Pull Request oluştur
2. **Base:** `develop`
3. **Compare:** `feature/admin-dashboard-v2`
4. PR açıklaması yaz
5. Review iste (gerekirse)

#### 5. Merge ve Test

```bash
# PR merge edildikten sonra
git checkout develop
git pull origin develop

# Staging'e otomatik deploy olur
# Staging'de test et: https://skproduction-staging.vercel.app
```

#### 6. Production'a Gönderme

```bash
# develop'dan main'e merge
git checkout main
git pull origin main
git merge develop

# Tag oluştur (opsiyonel)
git tag -a v1.1.0 -m "Admin dashboard v2 release"
git push origin main --tags

# Production'a otomatik deploy olur
```

---

## 🚢 Deployment Süreci

### Otomatik Deployment (Önerilen)

#### GitHub Actions CI/CD

`.github/workflows/deploy.yml` dosyası oluşturun:

```yaml
name: Deploy

on:
  push:
    branches:
      - main      # Production
      - develop   # Staging

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        run: |
          echo "Staging'e deploy ediliyor..."
          # Render ve Vercel otomatik deploy yapacak

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: |
          echo "Production'a deploy ediliyor..."
          # Render ve Vercel otomatik deploy yapacak
```

### Manuel Deployment

#### Staging'e Deploy

```bash
# develop branch'ine push yap
git checkout develop
git push origin develop

# Render ve Vercel otomatik deploy yapacak
```

#### Production'a Deploy

```bash
# main branch'ine merge et
git checkout main
git merge develop
git push origin main

# Render ve Vercel otomatik deploy yapacak
```

---

## 🚨 Hotfix Süreci

### Senaryo: Production'da Kritik Bug

#### 1. Hotfix Branch Oluştur

```bash
# main branch'inden aç
git checkout main
git pull origin main
git checkout -b hotfix/security-patch
```

#### 2. Düzeltmeyi Yap

```bash
# Bug'ı düzelt
# Test et (local'de)
npm run dev
```

#### 3. Commit ve Push

```bash
git add .
git commit -m "fix(security): Fix authentication vulnerability"
git push origin hotfix/security-patch
```

#### 4. Production'a Deploy

```bash
# main'e merge et
git checkout main
git merge hotfix/security-patch
git push origin main

# Production'a otomatik deploy olur
```

#### 5. develop'a da Merge Et

```bash
# develop'a da merge et (ileride aynı bug olmasın)
git checkout develop
git merge hotfix/security-patch
git push origin develop
```

---

## ✅ Best Practices

### 1. Commit Mesajları

**Format:** `type(scope): message`

**Örnekler:**
```bash
feat(admin): Add advanced filtering
fix(auth): Fix login redirect issue
refactor(dashboard): Improve performance
docs(readme): Update deployment guide
```

**Type'lar:**
- `feat`: Yeni özellik
- `fix`: Bug düzeltme
- `refactor`: Kod iyileştirme
- `docs`: Dokümantasyon
- `style`: Formatting
- `test`: Test ekleme
- `chore`: Build/config değişiklikleri

### 2. Code Review

- ✅ Her PR'ı review et
- ✅ En az 1 kişi approve etsin
- ✅ Test'leri çalıştır
- ✅ Lint hatalarını kontrol et

### 3. Testing

```bash
# Test'leri çalıştır
npm run test:all

# Coverage kontrolü
npm run test:coverage
```

### 4. Environment Variables

**Asla commit etmeyin:**
- `.env` dosyaları
- Secret'lar
- API key'ler

**Her ortam için ayrı:**
- Development: Local `.env`
- Staging: Vercel/Render dashboard
- Production: Vercel/Render dashboard

### 5. Database Migration

**Staging'de test edin:**
```bash
# Migration script'leri
cd server
npm run migrate
```

### 6. Backup

**Production database:**
- Düzenli backup alın
- Migration öncesi backup alın

---

## 📊 Deployment Checklist

### Staging'e Deploy Öncesi

- [ ] Tüm test'ler geçiyor
- [ ] Lint hataları yok
- [ ] Type check geçiyor
- [ ] Local'de test edildi
- [ ] Code review yapıldı
- [ ] Environment variables doğru

### Production'a Deploy Öncesi

- [ ] Staging'de test edildi
- [ ] Tüm test'ler geçiyor
- [ ] Database migration hazır (varsa)
- [ ] Backup alındı
- [ ] Rollback planı hazır
- [ ] Monitoring aktif
- [ ] Error tracking aktif

---

## 🔄 Günlük Çalışma Akışı

### Sabah

```bash
# En son değişiklikleri çek
git checkout develop
git pull origin develop

# Yeni feature branch aç
git checkout -b feature/my-feature
```

### Geliştirme Sırasında

```bash
# Local'de çalıştır
npm run dev

# Değişiklikleri commit et
git add .
git commit -m "feat: Add new feature"

# Push et
git push origin feature/my-feature
```

### Akşam

```bash
# PR oluştur (GitHub'da)
# Code review bekle
# Merge edildikten sonra staging'de test et
```

---

## 🛠️ Yardımcı Komutlar

### Branch Yönetimi

```bash
# Tüm branch'leri listele
git branch -a

# Branch sil
git branch -d feature/old-feature

# Remote branch sil
git push origin --delete feature/old-feature
```

### Deploy Kontrolü

```bash
# Production durumunu kontrol et
curl https://api.skproduction.com/api/health

# Staging durumunu kontrol et
curl https://skproduction-api-staging.onrender.com/api/health
```

### Log Kontrolü

```bash
# Render log'ları (dashboard'dan)
# Vercel log'ları (dashboard'dan)
```

---

## 🎯 Örnek Senaryolar

### Senaryo 1: Yeni Dashboard Widget Ekleme

```bash
# 1. Feature branch
git checkout -b feature/dashboard-widget

# 2. Geliştir
# - Widget component'i oluştur
# - API endpoint ekle
# - Test yaz

# 3. Commit
git commit -m "feat(dashboard): Add revenue widget"

# 4. PR oluştur → develop'a merge
# 5. Staging'de test et
# 6. main'e merge → Production'a deploy
```

### Senaryo 2: Kritik Bug Düzeltme

```bash
# 1. Hotfix branch
git checkout -b hotfix/login-bug

# 2. Düzelt
# - Bug'ı düzelt
# - Test yaz

# 3. Commit
git commit -m "fix(auth): Fix login redirect loop"

# 4. main'e merge → Production'a deploy
# 5. develop'a da merge
```

### Senaryo 3: Büyük Özellik Geliştirme

```bash
# 1. Feature branch
git checkout -b feature/major-refactor

# 2. Uzun süreli geliştirme
# - Günlük commit'ler
# - Düzenli push'lar

# 3. PR oluştur → Review
# 4. develop'a merge → Staging'de test
# 5. main'e merge → Production'a deploy
```

---

## 📝 Önemli Notlar

1. **Asla direkt main'e push yapmayın** (hotfix hariç)
2. **Her değişiklik önce staging'de test edilmeli**
3. **Production'a deploy öncesi backup alın**
4. **Environment variables'ları kontrol edin**
5. **Monitoring ve error tracking aktif olmalı**
6. **Rollback planı hazır olmalı**

---

## 🚀 Hızlı Başlangıç

### İlk Kurulum

```bash
# 1. Staging environment'ları kur (yukarıdaki adımlar)
# 2. Branch stratejisini ayarla
# 3. CI/CD pipeline'ı kur (opsiyonel)
```

### Günlük Kullanım

```bash
# 1. Feature branch aç
git checkout -b feature/my-feature

# 2. Geliştir ve commit et
git commit -m "feat: Add feature"

# 3. PR oluştur → develop'a merge
# 4. Staging'de test et
# 5. main'e merge → Production'a deploy
```

---

## 📞 Sorun Giderme

### Staging Deploy Çalışmıyor

1. Render/Vercel log'larını kontrol et
2. Environment variables'ları kontrol et
3. Branch'in doğru olduğunu kontrol et

### Production Deploy Çalışmıyor

1. Staging'de test et
2. Database migration'ları kontrol et
3. Environment variables'ları kontrol et
4. Rollback yap (gerekirse)

---

**Başarılar! 🎉**

*Son Güncelleme: 2026-01-08*
