# 🚀 SK Production - Production Deployment Checklist

> **Production'a Almak İçin Gereken Her Şey**  
> Bu checklist'i adım adım takip ederek projeyi production'a alabilirsiniz.

---

## 📋 İçindekiler

1. [Ön Hazırlık](#ön-hazırlık)
2. [MongoDB Atlas (Production)](#mongodb-atlas-production)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Domain ve SSL](#domain-ve-ssl)
6. [Güvenlik Ayarları](#güvenlik-ayarları)
7. [Monitoring ve Error Tracking](#monitoring-ve-error-tracking)
8. [Backup ve Yedekleme](#backup-ve-yedekleme)
9. [Son Kontroller](#son-kontroller)

---

## ✅ Ön Hazırlık

### 1. GitHub Repository Hazırlığı

- [ ] Tüm kodlar commit edildi
- [ ] `.env` dosyaları `.gitignore`'da (güvenlik için)
- [ ] `README.md` güncel
- [ ] Production branch hazır (main/master)
- [ ] CI yeşil (lint + typecheck + test + audit) ✅

### 2. Hesap Oluşturma

- [ ] **MongoDB Atlas** hesabı (ücretsiz tier yeterli başlangıç için)
- [ ] **Vercel** hesabı (frontend için - ücretsiz)
- [ ] **Render** veya **Heroku** hesabı (backend için)
- [ ] **Domain** satın alındı (opsiyonel ama önerilir)

---

## 🗄️ MongoDB Atlas (Production)

### Adım 1: Production Cluster Oluştur

1. MongoDB Atlas'a giriş yapın
2. "Build a Database" → **M10 veya üzeri** seçin (production için önerilir)
   - **Not:** Başlangıç için M0 (Free) kullanılabilir, ancak backup yok
3. Cloud Provider: **AWS**
4. Region: **Frankfurt (eu-central-1)** veya size en yakın
5. Cluster Name: `sk-production-cluster`
6. "Create" butonuna tıklayın

### Adım 2: Database User Oluştur

1. "Database Access" → "Add New Database User"
2. Username: `skproduction-prod-admin`
3. Password: **Güçlü bir şifre oluşturun** (kaydedin!)
4. Database User Privileges: **"Atlas admin"**
5. "Add User" butonuna tıklayın

### Adım 3: Network Access Ayarla (ÖNEMLİ!)

1. "Network Access" → "Add IP Address"
2. **Production için:** Sadece backend server'ın IP adresini ekleyin
   - Render/Heroku IP'lerini ekleyin
   - Veya "Add Current IP Address" (development için)
3. **Güvenlik Notu:** `0.0.0.0/0` (her yerden erişim) production'da kullanmayın!

### Adım 4: Connection String Al

1. "Database" → "Connect" butonuna tıklayın
2. "Connect your application" seçin
3. Driver: **Node.js**, Version: **5.5 or later**
4. Connection string'i kopyalayın:
   ```
   mongodb+srv://skproduction-prod-admin:<password>@sk-production-cluster.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
   ```
5. `<password>` kısmını kendi şifrenizle değiştirin
6. Database adını ekleyin: `...mongodb.net/skproduction?...`

### Adım 5: Backup Ayarları

- [ ] **M10+ tier için:** Otomatik backup aktif
- [ ] **M0 (Free) için:** Manuel backup stratejisi oluşturun
- [ ] Backup zamanlaması ayarlandı (günlük önerilir)

---

## 🔧 Backend Deployment

### Seçenek 1: Render (ÖNERİLEN - Ücretsiz Tier Var)

#### Adım 1: Render'da Web Service Oluştur

1. Render hesabınıza giriş yapın: https://render.com
2. "New +" → "Web Service" seçin
3. GitHub repository'nizi bağlayın
4. Ayarlar:
   - **Name:** `skproduction-api`
   - **Region:** Frankfurt (EU) veya size en yakın
   - **Branch:** `main` veya `master`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free tier (başlangıç için yeterli)

#### Adım 2: Environment Variables Ekle

Render dashboard'da "Environment" sekmesine gidin ve şunları ekleyin:

```env
# Temel Ayarlar
NODE_ENV=production
PORT=5001

# Logging (Önerilen)
# Log aggregation için JSON format
LOG_LEVEL=info
LOG_CONSOLE_FORMAT=json

# MongoDB
MONGO_URI=mongodb+srv://skproduction-prod-admin:ŞİFRENİZ@sk-production-cluster.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority

# JWT Secrets (GÜÇLÜ, RASTGELE STRINGLER!)
JWT_SECRET=üretilen-güçlü-jwt-secret-buraya
JWT_REFRESH_SECRET=üretilen-güçlü-refresh-secret-buraya

# Client URL (Frontend domain'i)
CLIENT_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Email (Opsiyonel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# VAPID Keys (Push Notifications - Opsiyonel)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:info@skproduction.com

# Redis (Opsiyonel - Cache için)
REDIS_URL=redis://your-redis-url
```

**JWT Secret Oluşturma:**
```bash
# Terminal'de çalıştırın:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Adım 3: Deploy

1. "Create Web Service" butonuna tıklayın
2. İlk deploy 5-10 dakika sürebilir
3. Deploy tamamlandığında URL alacaksınız: `https://skproduction-api.onrender.com`

### Seçenek 2: Heroku

```bash
# Heroku CLI ile
cd server
heroku create skproduction-api
heroku config:set NODE_ENV=production
heroku config:set PORT=5001
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
heroku config:set CLIENT_URL=https://yourdomain.com
heroku config:set CORS_ORIGIN=https://yourdomain.com
git push heroku main
```

---

## 🎨 Frontend Deployment

### Vercel (ÖNERİLEN)

#### Adım 1: Vercel'de Proje Oluştur

1. Vercel hesabınıza giriş yapın: https://vercel.com
2. "Add New..." → "Project" seçin
3. GitHub repository'nizi import edin
4. Ayarlar:
   - **Framework Preset:** Next.js
   - **Root Directory:** `client`
   - **Build Command:** `npm run build` (otomatik algılanır)
   - **Output Directory:** `.next` (otomatik algılanır)
   - **Install Command:** `npm install`

#### Adım 2: Environment Variables Ekle

Vercel dashboard'da "Settings" → "Environment Variables" sekmesine gidin:

```env
# Backend API URL (Render/Heroku URL'i)
NEXT_PUBLIC_API_URL=https://skproduction-api.onrender.com/api
NEXT_PUBLIC_BACKEND_URL=https://skproduction-api.onrender.com

# NextAuth (Opsiyonel)
NEXTAUTH_SECRET=üretilen-güçlü-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com

# Google Analytics (Opsiyonel)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# VAPID Public Key (Push Notifications - Opsiyonel)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key

# Sentry (Error Tracking - Opsiyonel)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

#### Adım 3: Deploy

1. "Deploy" butonuna tıklayın
2. İlk deploy 3-5 dakika sürebilir
3. Deploy tamamlandığında URL alacaksınız: `https://skproduction.vercel.app`

---

## 🌐 Domain ve SSL

### Custom Domain Ekleme (Vercel)

1. Vercel dashboard → Projeniz → "Settings" → "Domains"
2. Domain'inizi ekleyin: `yourdomain.com`
3. DNS kayıtlarını güncelleyin:
   - **A Record:** `@` → Vercel IP (otomatik verilir)
   - **CNAME:** `www` → `cname.vercel-dns.com`
4. SSL otomatik olarak aktif olacak (Let's Encrypt)

### Backend Domain (Render/Heroku)

- **Render:** Custom domain ekleyebilirsiniz (ücretli plan gerekebilir)
- **Heroku:** Custom domain ekleyebilirsiniz (ücretli plan gerekebilir)
- **Alternatif:** Render/Heroku'nun verdiği URL'i kullanabilirsiniz

---

## 🔒 Güvenlik Ayarları

### Backend Güvenlik

- [ ] **JWT Secrets:** Güçlü, rastgele stringler kullanıldı
- [ ] **MongoDB:** Network access sadece backend IP'si
- [ ] **CORS:** Sadece frontend domain'i eklendi
- [ ] **Rate Limiting:** Aktif (backend'de zaten var)
- [ ] **Helmet:** Aktif (backend'de zaten var)
- [ ] **HTTPS:** Aktif (Render/Heroku otomatik sağlar)

### Frontend Güvenlik

- [ ] **HTTPS:** Aktif (Vercel otomatik sağlar)
- [ ] **Security Headers:** Aktif (next.config.js'de var)
- [ ] **Environment Variables:** Hassas bilgiler `NEXT_PUBLIC_` ile başlamıyor

### Admin Güvenliği

- [ ] **Admin şifresi değiştirildi** (varsayılan: `admin123`)
- [ ] **2FA aktif edildi** (opsiyonel ama önerilir)
- [ ] **Yeni admin kullanıcıları oluşturuldu** (gerekirse)

---

## 📊 Monitoring ve Error Tracking

### Health / Readiness (ÖNEMLİ)

- [ ] Backend health check path’i platformda `/api/readyz` olarak ayarlandı (readiness)  
  - `GET /api/livez` → process up  
  - `GET /api/readyz` → DB (ve varsa Redis) ready  
  - `GET /api/health` → snapshot (db/redis/node/commit)

Detay runbook: `docs/OBSERVABILITY_RUNBOOK.md`

### Security Audit (Manual)

- [ ] `docs/SECURITY_AUDIT_CHECKLIST.md` checklist’i tamamlandı
- [ ] (Opsiyonel) Dış pen test planlandı/uygulandı

### Sentry (Error Tracking)

1. Sentry hesabı oluşturun: https://sentry.io
2. Yeni proje oluşturun (Next.js)
3. DSN'i alın ve environment variable olarak ekleyin
4. Frontend ve backend için ayrı projeler oluşturabilirsiniz

**Frontend (Vercel):**
```env
NEXT_PUBLIC_SENTRY_DSN=your-frontend-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-frontend-project
SENTRY_AUTH_TOKEN=your-auth-token
```

**Backend (Render/Heroku):**
```env
SENTRY_DSN=your-backend-dsn
```

### Google Analytics

1. Google Analytics hesabı oluşturun
2. Tracking ID'yi alın: `G-XXXXXXXXXX`
3. Vercel environment variable olarak ekleyin:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

### Uptime Monitoring

- [ ] **UptimeRobot** (ücretsiz): https://uptimerobot.com
- [ ] **Pingdom** (ücretli): https://www.pingdom.com
- [ ] **StatusCake** (ücretsiz tier var): https://www.statuscake.com

---

## 💾 Backup ve Yedekleme

### MongoDB Backup

#### M10+ Tier (Otomatik Backup)

- [ ] Otomatik backup aktif
- [ ] Backup zamanlaması ayarlandı (günlük)
- [ ] Backup retention süresi ayarlandı (7-30 gün)

#### M0 Tier (Manuel Backup)

1. MongoDB Atlas → "Backups" → "Create Backup"
2. Veya MongoDB Compass ile export:
   ```bash
   mongodump --uri="mongodb+srv://..." --out=./backup
   ```

### Dosya Yedekleme

- [ ] **Upload klasörü:** Cloud storage'a taşınmalı (AWS S3, Cloudinary)
- [ ] **Mevcut upload'lar:** Manuel olarak yedeklenmeli

---

## ✅ Son Kontroller

### Backend Kontrolleri

- [ ] Health check çalışıyor: `https://your-api-domain.com/api/health`
- [ ] API dokümantasyonu erişilebilir: `https://your-api-domain.com/api-docs`
- [ ] CORS ayarları doğru
- [ ] Rate limiting çalışıyor
- [ ] Error handling çalışıyor

### Frontend Kontrolleri

- [ ] Ana sayfa yükleniyor: `https://yourdomain.com`
- [ ] Admin paneli erişilebilir: `https://yourdomain.com/admin/login`
- [ ] API bağlantısı çalışıyor
- [ ] Görseller yükleniyor
- [ ] Formlar çalışıyor
- [ ] Responsive tasarım çalışıyor

### Güvenlik Kontrolleri

- [ ] HTTPS aktif
- [ ] Security headers aktif
- [ ] Admin şifresi değiştirildi
- [ ] JWT secrets güçlü
- [ ] MongoDB network access kısıtlı

### Performans Kontrolleri

- [ ] Sayfa yükleme süreleri kabul edilebilir (<3 saniye)
- [ ] Görseller optimize edilmiş
- [ ] Bundle size kontrol edildi
- [ ] API response süreleri kabul edilebilir (<1 saniye)

---

## 🚨 Sorun Giderme

### Backend Bağlantı Sorunları

**Problem:** Frontend backend'e bağlanamıyor

**Çözüm:**
1. Backend URL'inin doğru olduğunu kontrol edin
2. CORS ayarlarını kontrol edin
3. Backend loglarını kontrol edin (Render/Heroku dashboard)

### MongoDB Bağlantı Sorunları

**Problem:** Backend MongoDB'ye bağlanamıyor

**Çözüm:**
1. MongoDB Atlas Network Access'te backend IP'si ekli mi kontrol edin
2. Connection string'in doğru olduğunu kontrol edin
3. Database user'ın doğru yetkilere sahip olduğunu kontrol edin

### Görsel Yükleme Sorunları

**Problem:** Görseller yüklenmiyor

**Çözüm:**
1. `next.config.js`'de image domain'leri kontrol edin
2. Backend upload klasörünün erişilebilir olduğunu kontrol edin
3. CORS ayarlarını kontrol edin

---

## 📝 Önemli Notlar

1. **Environment Variables:** Production'da asla development değerleri kullanmayın
2. **Secrets:** JWT secret'ları güçlü, rastgele stringler olmalı
3. **Backup:** Düzenli backup alın (en az haftalık)
4. **Monitoring:** Error tracking ve uptime monitoring aktif olmalı
5. **SSL:** HTTPS mutlaka aktif olmalı
6. **Domain:** Custom domain kullanmak SEO ve güvenlik için önemli

---

## 🎯 Hızlı Başlangıç Özeti

1. ✅ MongoDB Atlas production cluster oluştur
2. ✅ Backend'i Render/Heroku'ya deploy et
3. ✅ Frontend'i Vercel'e deploy et
4. ✅ Environment variables'ları ayarla
5. ✅ Domain ekle (opsiyonel)
6. ✅ Admin şifresini değiştir
7. ✅ Monitoring kur
8. ✅ Backup stratejisi oluştur

---

## 📞 Yardım

Sorun yaşıyorsanız:
1. Bu checklist'i tekrar kontrol edin
2. Render/Heroku/Vercel loglarını kontrol edin
3. MongoDB Atlas connection string'i kontrol edin
4. Environment variables'ları kontrol edin

**Başarılar! 🚀**

---

*Son Güncelleme: 2026-01-08*
