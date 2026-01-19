# 🚀 SK Production - Production Deployment Rehberi

> **Production'a Almak ve Yayındayken Geliştirmek İçin Kapsamlı Rehber**  
> Bu rehber, projeyi production'a almak ve yayındayken güvenli geliştirme yapmak için gereken tüm bilgileri içerir.

---

## 📋 İçindekiler

1. [Hızlı Başlangıç (10 Dakika)](#hızlı-başlangıç-10-dakika)
2. [Detaylı Deployment Adımları](#detaylı-deployment-adımları)
3. [Git Branch Stratejisi](#git-branch-stratejisi)
4. [Günlük Geliştirme Akışı](#günlük-geliştirme-akışı)
5. [Platform Önerileri ve Maliyetler](#platform-önerileri-ve-maliyetler)
6. [Güvenlik ve Monitoring](#güvenlik-ve-monitoring)
7. [Sorun Giderme](#sorun-giderme)

---

## ⚡ Hızlı Başlangıç (10 Dakika)

### Ön Gereksinimler

- ✅ **MongoDB Atlas** hesabı
- ✅ **Vercel** hesabı (frontend için)
- ✅ **Render** hesabı (backend için)
- ✅ **GitHub** repository (kodlar commit edilmiş olmalı)

### 1. MongoDB Atlas Kurulumu (5 dakika)

1. MongoDB Atlas → **Build a Database** → **M0 (Free)** seçin
2. Region: **Frankfurt (EU)** veya size en yakın
3. Cluster Name: `sk-production-cluster`
4. **Database Access** → Yeni user oluştur:
   - Username: `skproduction-prod-admin`
   - Password: Güçlü şifre (kaydedin!)
   - Privileges: **Atlas admin**
5. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
   - ⚠️ **Not**: Production'da sadece backend IP'sini eklemek daha güvenli
6. **Database** → **Connect** → **Connect your application**
7. Connection string'i kopyalayın ve şifreyi değiştirin

### 2. Backend Deployment - Render (3 dakika)

1. Render dashboard → **New +** → **Web Service**
2. GitHub repository'nizi bağlayın
3. Ayarlar:
   - **Name**: `skproduction-api`
   - **Region**: Frankfurt (EU)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables** ekleyin (aşağıdaki bölüme bakın)
5. **Create Web Service** → Deploy başlar

### 3. Frontend Deployment - Vercel (2 dakika)

1. Vercel dashboard → **Add New...** → **Project**
2. GitHub repository'nizi import edin
3. Ayarlar:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
4. **Environment Variables** ekleyin (aşağıdaki bölüme bakın)
5. **Deploy** → Deploy başlar

### 4. İlk Deployment

```bash
# Production'a deploy et
npm run deploy:production
```

---

## 📝 Detaylı Deployment Adımları

### MongoDB Atlas (Production)

#### Cluster Oluşturma

1. MongoDB Atlas'a giriş yapın
2. "Build a Database" → **M10 veya üzeri** seçin (production için önerilir)
   - **Not:** Başlangıç için M0 (Free) kullanılabilir, ancak backup yok
3. Cloud Provider: **AWS**
4. Region: **Frankfurt (eu-central-1)** veya size en yakın
5. Cluster Name: `sk-production-cluster`
6. "Create" butonuna tıklayın

#### Database User Oluştur

1. "Database Access" → "Add New Database User"
2. Username: `skproduction-prod-admin`
3. Password: **Güçlü bir şifre oluşturun** (kaydedin!)
4. Database User Privileges: **"Atlas admin"**
5. "Add User" butonuna tıklayın

#### Network Access Ayarla (ÖNEMLİ!)

1. "Network Access" → "Add IP Address"
2. **Production için:** Sadece backend server'ın IP adresini ekleyin
   - Render/Heroku IP'lerini ekleyin
   - Veya "Add Current IP Address" (development için)
3. **Güvenlik Notu:** `0.0.0.0/0` (her yerden erişim) production'da kullanmayın!

#### Connection String Al

1. "Database" → "Connect" → "Connect your application"
2. Driver: **Node.js**, Version: **5.5 or later**
3. Connection string'i kopyalayın ve şifreyi değiştirin

### Backend Deployment (Render)

#### Web Service Oluşturma

1. Render hesabınıza giriş yapın: https://render.com
2. "New +" → "Web Service" seçin
3. GitHub repository'nizi bağlayın
4. Ayarlar:
   - **Name:** `skproduction-api`
   - **Region:** Frankfurt (EU) veya size en yakın
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free tier (başlangıç için yeterli)

#### Environment Variables

```env
# Temel Ayarlar
NODE_ENV=production
PORT=5001

# MongoDB
MONGO_URI=mongodb+srv://skproduction-prod-admin:ŞİFRENİZ@sk-production-cluster.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority

# JWT Secrets (GÜÇLÜ, RASTGELE STRINGLER!)
JWT_SECRET=<güçlü-random-string>
JWT_REFRESH_SECRET=<güçlü-random-string>

# Client URL (Frontend domain'i)
CLIENT_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Opsiyonel
LOG_LEVEL=info
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**JWT Secret Oluşturma:**
```bash
npm run generate:secrets
```

### Frontend Deployment (Vercel)

#### Proje Oluşturma

1. Vercel hesabınıza giriş yapın: https://vercel.com
2. "Add New..." → "Project" seçin
3. GitHub repository'nizi import edin
4. Ayarlar:
   - **Framework Preset:** Next.js
   - **Root Directory:** `client`
   - **Build Command:** `npm run build` (otomatik)
   - **Output Directory:** `.next` (otomatik)

#### Environment Variables

```env
# Backend API URL (ZORUNLU)
NEXT_PUBLIC_API_URL=https://skproduction-api.onrender.com/api
NEXT_PUBLIC_BACKEND_URL=https://skproduction-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Opsiyonel
NEXTAUTH_SECRET=<güçlü-random-string>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### GitHub Secrets (CI/CD için)

CI/CD pipeline için deploy hook'ları ekleyin:

1. **Render Deploy Hook**:
   - Render dashboard → Service → Settings → **Manual Deploy Hook**
   - Hook URL'i kopyalayın
   - GitHub → Settings → Secrets → Actions → `RENDER_PRODUCTION_DEPLOY_HOOK_URL`

2. **Vercel Deploy Hook**:
   - Vercel dashboard → Project → Settings → **Deploy Hooks**
   - **Create Hook** → Branch: `main`, Environment: `Production`
   - Hook URL'i kopyalayın
   - GitHub → Settings → Secrets → Actions → `VERCEL_PRODUCTION_DEPLOY_HOOK_URL`

**Detaylı rehber**: [GitHub Secrets Rehberi](./GITHUB_SECRETS_REHBERI.md)

### Domain ve SSL

#### Custom Domain Ekleme (Vercel)

1. Vercel dashboard → Projeniz → "Settings" → "Domains"
2. Domain'inizi ekleyin: `yourdomain.com`
3. DNS kayıtlarını güncelleyin:
   - **A Record:** `@` → Vercel IP (otomatik verilir)
   - **CNAME:** `www` → `cname.vercel-dns.com`
4. SSL otomatik olarak aktif olacak (Let's Encrypt)

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

- **`main`**: Production ortamı, sadece hazır kodlar
- **`develop`**: Staging ortamı, geliştirmeler burada birleşir
- **`feature/*`**: Yeni özellikler için
- **`hotfix/*`**: Kritik bug düzeltmeleri için

---

## 💻 Günlük Geliştirme Akışı

### Yeni Özellik Ekleme

```bash
# 1. develop branch'ine geç
git checkout develop
git pull origin develop

# 2. Feature branch oluştur
git checkout -b feature/my-feature

# 3. Geliştir ve commit et
git add .
git commit -m "feat(admin): Add new feature"

# 4. Push et
git push origin feature/my-feature

# 5. GitHub'da Pull Request oluştur
# Base: develop, Compare: feature/my-feature

# 6. PR merge edildikten sonra staging'e otomatik deploy olur
```

### Production'a Deploy

```bash
# 1. Pre-deployment check
npm run pre-deploy:check

# 2. Production'a deploy
npm run deploy:production

# 3. Deployment verification
npm run verify:deployment
```

### Hotfix Süreci

```bash
# 1. Hotfix branch oluştur
npm run hotfix:create security-patch

# 2. Bug'ı düzelt ve test et
# ... kod değişiklikleri ...

# 3. Commit et
git commit -m "fix(security): Fix authentication vulnerability"

# 4. main'e merge et
git checkout main
git merge hotfix/security-patch
git push origin main

# 5. develop'a da merge et
git checkout develop
git merge hotfix/security-patch
git push origin develop
```

---

## 💰 Platform Önerileri ve Maliyetler

### Senaryo 1: Ücretsiz Başlangıç (₺0/ay)

| Servis | Platform | Tier | Limitler |
|--------|----------|------|----------|
| **Frontend** | Vercel | Hobby (Ücretsiz) | ✅ 100GB bandwidth/ay<br>✅ Sınırsız deployment<br>✅ Otomatik SSL |
| **Backend** | Render | Free | ⚠️ 750 saat/ay<br>⚠️ Uyku modu (ilk istek yavaş)<br>✅ Otomatik SSL |
| **MongoDB** | Atlas | M0 (Ücretsiz) | ✅ 512MB storage<br>✅ Shared cluster<br>⚠️ Backup yok |

**Ne Zaman Yeterli?**
- ✅ Başlangıç aşaması
- ✅ Günlük ziyaretçi < 1000
- ✅ Aylık bandwidth < 100GB
- ✅ 7/24 uptime kritik değil

**Sınırlamalar:**
- ⚠️ Render free tier uyku modu (15 dakika istek yoksa)
- ⚠️ İlk istek 30-60 saniye yavaş (cold start)
- ⚠️ MongoDB backup yok

### Senaryo 2: Production (₺150-300/ay)

| Servis | Platform | Tier | Fiyat |
|--------|----------|------|-------|
| **Frontend** | Vercel | Pro | $20/ay |
| **Backend** | Render | Starter | $7/ay |
| **MongoDB** | Atlas | M10 | $57/ay |

**Özellikler:**
- ✅ 7/24 kesintisiz çalışma
- ✅ Otomatik backup
- ✅ Yüksek performans
- ✅ Özel domain

### Senaryo 3: Yüksek Trafik (₺500+/ay)

| Servis | Platform | Tier | Fiyat |
|--------|----------|------|-------|
| **Frontend** | Vercel | Enterprise | Custom |
| **Backend** | Render | Professional | $25/ay |
| **MongoDB** | Atlas | M30+ | $200+/ay |

---

## 🔒 Güvenlik ve Monitoring

### Güvenlik Ayarları

#### Backend Güvenlik

- [ ] **JWT Secrets:** Güçlü, rastgele stringler kullanıldı
- [ ] **MongoDB:** Network access sadece backend IP'si
- [ ] **CORS:** Sadece frontend domain'i eklendi
- [ ] **Rate Limiting:** Aktif
- [ ] **Helmet:** Aktif
- [ ] **HTTPS:** Aktif

#### Frontend Güvenlik

- [ ] **HTTPS:** Aktif
- [ ] **Security Headers:** Aktif
- [ ] **Environment Variables:** Hassas bilgiler `NEXT_PUBLIC_` ile başlamıyor

#### Admin Güvenliği

- [ ] **Admin şifresi değiştirildi** (varsayılan: `admin123`)
- [ ] **2FA aktif edildi** (opsiyonel ama önerilir)

### Monitoring

#### Health Check Endpoints

- `GET /api/livez` → Process up kontrolü
- `GET /api/readyz` → DB ready kontrolü
- `GET /api/health` → Full health check

**Detaylı rehber**: [Observability Runbook](./OBSERVABILITY_RUNBOOK.md)

#### Error Tracking (Sentry)

1. Sentry hesabı oluşturun: https://sentry.io
2. Yeni proje oluşturun (Next.js)
3. DSN'i alın ve environment variable olarak ekleyin

#### Uptime Monitoring

- **UptimeRobot** (ücretsiz): https://uptimerobot.com
- **Pingdom** (ücretli): https://www.pingdom.com
- **StatusCake** (ücretsiz tier var): https://www.statuscake.com

### Backup

#### MongoDB Backup

- **M10+ tier:** Otomatik backup aktif
- **M0 tier:** Manuel backup stratejisi (haftalık önerilir)

#### Dosya Yedekleme

- Upload klasörü: Cloud storage'a taşınmalı (AWS S3, Cloudinary)
- Mevcut upload'lar: Manuel olarak yedeklenmeli

---

## 🆘 Sorun Giderme

### Backend Bağlantı Sorunları

**Problem:** Frontend backend'e bağlanamıyor

**Çözüm:**
1. Backend URL'inin doğru olduğunu kontrol edin
2. CORS ayarlarını kontrol edin (`CLIENT_URL`, `CORS_ORIGIN`)
3. Backend log'larını kontrol edin (Render dashboard)

### MongoDB Bağlantı Sorunları

**Problem:** Backend MongoDB'ye bağlanamıyor

**Çözüm:**
1. MongoDB Atlas Network Access'te backend IP'si ekli mi kontrol edin
2. Connection string'in doğru olduğunu kontrol edin
3. Database user'ın doğru yetkilere sahip olduğunu kontrol edin

### Deployment Başarısız

**Problem:** GitHub Actions deployment başarısız

**Çözüm:**
1. GitHub Actions log'larını kontrol edin
2. Test'lerin geçtiğini kontrol edin
3. Build hatalarını kontrol edin
4. Environment variables'ları kontrol edin

---

## 📚 İlgili Dokümanlar

- **[Kurulum ve Başlangıç](./KURULUM_VE_BASLANGIC.md)** - Development ortamı kurulumu
- **[Deployment Scripts Rehberi](./DEPLOYMENT_SCRIPTS_REHBERI.md)** - Deployment script'leri
- **[GitHub Secrets Rehberi](./GITHUB_SECRETS_REHBERI.md)** - GitHub Secrets yapılandırması
- **[Domain Kurulumu](./SKPRO_DOMAIN_KURULUM.md)** - Domain/DNS yönlendirme

---

**Başarılar! 🚀**

*Son Güncelleme: 2026-01-08*
