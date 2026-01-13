# 🖥️ SK Production - Sunucu ve Deployment Önerileri

> **skpro.com.tr Domain'i İçin En İyi Çözümler**  
> Türkiye'deki domain için optimize edilmiş sunucu ve deployment önerileri

---

## 📋 İçindekiler

1. [Genel Öneriler](#genel-öneriler)
2. [Frontend Deployment (Next.js)](#frontend-deployment-nextjs)
3. [Backend Deployment (Express)](#backend-deployment-express)
4. [MongoDB](#mongodb)
5. [Domain ve DNS Ayarları](#domain-ve-dns-ayarları)
6. [Maliyet Analizi](#maliyet-analizi)
7. [Adım Adım Kurulum](#adım-adım-kurulum)

---

## 🎯 Genel Öneriler

### Önerilen Mimari

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │    MongoDB      │
│   (Next.js)     │────▶│   (Express)     │────▶│    (Atlas)      │
│                 │     │                 │     │                 │
│   Vercel        │     │   Render/Railway │     │   MongoDB Atlas │
│   (Ücretsiz)    │     │   ($7-25/ay)     │     │   (Ücretsiz)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Neden Bu Kombinasyon?

✅ **Vercel**: Next.js için optimize, ücretsiz tier, otomatik SSL  
✅ **Render/Railway**: Kolay kurulum, uygun fiyat, Türkiye'ye yakın  
✅ **MongoDB Atlas**: Ücretsiz tier, güvenilir, backup

---

## 🎨 Frontend Deployment (Next.js)

### Seçenek 1: Vercel (ÖNERİLEN ⭐)

**Neden Vercel?**
- ✅ Next.js için optimize edilmiş
- ✅ Ücretsiz tier (hobby plan)
- ✅ Otomatik SSL sertifikası
- ✅ CDN desteği (dünya çapında hızlı)
- ✅ Otomatik deployment (GitHub entegrasyonu)
- ✅ Preview deployment'lar (her PR için)
- ✅ Türkiye'de edge location'lar var

**Fiyat:**
- **Hobby (Ücretsiz)**: 100GB bandwidth/ay, sınırsız deployment
- **Pro ($20/ay)**: Daha fazla bandwidth, analytics

**Kurulum:**
1. https://vercel.com adresinden hesap oluştur
2. GitHub repository'yi bağla
3. Root directory: `client`
4. Build command: `npm run build`
5. Domain ekle: `skpro.com.tr` ve `www.skpro.com.tr`

**Avantajlar:**
- Çok kolay kurulum (5 dakika)
- Otomatik HTTPS
- Dünya çapında CDN
- Preview deployment'lar

**Dezavantajlar:**
- Ücretsiz tier'de bandwidth limiti var (başlangıç için yeterli)

---

### Seçenek 2: Netlify

**Fiyat:**
- **Starter (Ücretsiz)**: 100GB bandwidth/ay
- **Pro ($19/ay)**: Daha fazla özellik

**Avantajlar:**
- Next.js desteği
- Ücretsiz tier
- Otomatik SSL

**Dezavantajlar:**
- Vercel kadar Next.js'e optimize değil

---

### Seçenek 3: DigitalOcean App Platform

**Fiyat:**
- **Basic ($5/ay)**: 512MB RAM, 1GB storage
- **Professional ($12/ay)**: Daha fazla kaynak

**Avantajlar:**
- Türkiye'ye yakın (Frankfurt datacenter)
- Uygun fiyat
- Ölçeklenebilir

**Dezavantajlar:**
- Vercel kadar kolay değil
- Manuel SSL kurulumu gerekebilir

---

## 🔧 Backend Deployment (Express)

### Seçenek 1: Render (ÖNERİLEN ⭐)

**Neden Render?**
- ✅ Kolay kurulum
- ✅ Ücretsiz tier var (başlangıç için)
- ✅ Otomatik SSL
- ✅ GitHub entegrasyonu
- ✅ Environment variables yönetimi
- ✅ Log görüntüleme

**Fiyat:**
- **Free Tier**: 750 saat/ay (sınırlı)
- **Starter ($7/ay)**: 512MB RAM, sınırsız saat
- **Standard ($25/ay)**: 2GB RAM, daha iyi performans

**Kurulum:**
1. https://render.com adresinden hesap oluştur
2. "New Web Service" oluştur
3. GitHub repository'yi bağla
4. Root directory: `server`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Environment variables ekle

**Avantajlar:**
- Çok kolay kurulum
- Ücretsiz tier (test için)
- Otomatik deployment
- İyi dokümantasyon

**Dezavantajlar:**
- Free tier'de uyku modu (ilk istek yavaş)

---

### Seçenek 2: Railway

**Fiyat:**
- **Hobby ($5/ay)**: 512MB RAM, $5 kredi
- **Pro ($20/ay)**: Daha fazla kaynak

**Avantajlar:**
- Çok kolay kurulum
- Otomatik SSL
- GitHub entegrasyonu
- Türkiye'ye yakın

**Dezavantajlar:**
- Render kadar popüler değil

---

### Seçenek 3: DigitalOcean Droplet

**Fiyat:**
- **Basic Droplet ($6/ay)**: 1GB RAM, 1 vCPU, 25GB SSD
- **Standard Droplet ($12/ay)**: 2GB RAM, 1 vCPU, 50GB SSD

**Avantajlar:**
- Tam kontrol
- Türkiye'ye yakın (Frankfurt)
- Uygun fiyat
- Ölçeklenebilir

**Dezavantajlar:**
- Manuel kurulum gerekir
- Server yönetimi gerekir
- SSL sertifikası manuel (Let's Encrypt)

**Kurulum:**
```bash
# Ubuntu server kurulumu
# Node.js, PM2, Nginx kurulumu
# SSL sertifikası (Let's Encrypt)
```

---

### Seçenek 4: AWS Türkiye (İstanbul)

**Fiyat:**
- **EC2 t3.micro**: ~$8-10/ay
- **Elastic Beanstalk**: Ücretsiz (sadece EC2 ücreti)

**Avantajlar:**
- Türkiye'de datacenter (İstanbul)
- Çok düşük latency
- Ölçeklenebilir
- Güvenilir

**Dezavantajlar:**
- Kurulum daha karmaşık
- AWS bilgisi gerekir

---

### Seçenek 5: Heroku

**Fiyat:**
- **Eco Dyno ($5/ay)**: 512MB RAM
- **Basic ($7/ay)**: 512MB RAM, daha iyi performans

**Avantajlar:**
- Çok kolay kurulum
- Otomatik SSL
- İyi dokümantasyon

**Dezavantajlar:**
- Fiyat artışı (eskiden ücretsizdi)
- Render/Railway daha uygun

---

## 🗄️ MongoDB

### MongoDB Atlas (ÖNERİLEN ⭐)

**Neden MongoDB Atlas?**
- ✅ Ücretsiz tier (M0 - 512MB)
- ✅ Otomatik backup (M10+)
- ✅ Türkiye'ye yakın region (Frankfurt)
- ✅ Güvenilir
- ✅ Kolay yönetim

**Fiyat:**
- **M0 (Free)**: 512MB storage, shared cluster
- **M10 ($57/ay)**: 10GB storage, dedicated cluster, backup

**Region Seçimi:**
- **Frankfurt (eu-central-1)**: Türkiye'ye en yakın, önerilir
- **İstanbul (eu-south-1)**: Daha yakın ama daha pahalı

**Kurulum:**
1. https://www.mongodb.com/cloud/atlas adresinden hesap oluştur
2. Cluster oluştur (M0 Free tier başlangıç için yeterli)
3. Region: Frankfurt (eu-central-1)
4. Database user oluştur
5. Network Access: Backend IP'sini ekle
6. Connection string'i al

---

## 🌐 Domain ve DNS Ayarları

### Domain: skpro.com.tr

**DNS Ayarları:**

#### Frontend (Vercel) için:

```
Type    Name    Value
A       @       Vercel IP (Vercel otomatik verir)
CNAME   www     cname.vercel-dns.com
```

#### Backend (Render/Railway) için:

```
Type    Name    Value
CNAME   api     skproduction-api.onrender.com
```

**Veya subdomain kullanmıyorsanız:**
- Backend'i direkt IP'ye yönlendir (önerilmez)
- Veya API'yi frontend üzerinden proxy et (Next.js rewrites)

---

## 💰 Maliyet Analizi

### Senaryo 1: Minimum Maliyet (Başlangıç)

| Servis | Platform | Fiyat |
|--------|----------|-------|
| Frontend | Vercel (Hobby) | **Ücretsiz** |
| Backend | Render (Free) | **Ücretsiz** (sınırlı) |
| MongoDB | Atlas (M0) | **Ücretsiz** |
| Domain | skpro.com.tr | Zaten alınmış |
| **TOPLAM** | | **₺0/ay** |

**Not:** Render free tier'de uyku modu var, production için önerilmez.

---

### Senaryo 2: Önerilen (Production)

| Servis | Platform | Fiyat |
|--------|----------|-------|
| Frontend | Vercel (Hobby) | **Ücretsiz** |
| Backend | Render (Starter) | **$7/ay** (~₺210/ay) |
| MongoDB | Atlas (M0) | **Ücretsiz** |
| Domain | skpro.com.tr | Zaten alınmış |
| **TOPLAM** | | **~₺210/ay** |

---

### Senaryo 3: Profesyonel (Yüksek Trafik)

| Servis | Platform | Fiyat |
|--------|----------|-------|
| Frontend | Vercel (Pro) | **$20/ay** (~₺600/ay) |
| Backend | Render (Standard) | **$25/ay** (~₺750/ay) |
| MongoDB | Atlas (M10) | **$57/ay** (~₺1,710/ay) |
| Domain | skpro.com.tr | Zaten alınmış |
| **TOPLAM** | | **~₺3,060/ay** |

---

## 🚀 Önerilen Kurulum (Adım Adım)

### 1. Frontend - Vercel

```bash
# 1. Vercel hesabı oluştur
# https://vercel.com

# 2. GitHub repository'yi bağla
# 3. Proje ayarları:
#    - Root Directory: client
#    - Build Command: npm run build
#    - Output Directory: .next
#    - Install Command: npm install

# 4. Environment Variables:
#    NEXT_PUBLIC_API_URL=https://api.skpro.com.tr/api
#    NEXT_PUBLIC_BACKEND_URL=https://api.skpro.com.tr

# 5. Domain ekle:
#    - skpro.com.tr
#    - www.skpro.com.tr
```

### 2. Backend - Render

```bash
# 1. Render hesabı oluştur
# https://render.com

# 2. New Web Service oluştur
# 3. Ayarlar:
#    - Name: skproduction-api
#    - Region: Frankfurt (EU)
#    - Branch: main
#    - Root Directory: server
#    - Build Command: npm install && npm run build
#    - Start Command: npm start

# 4. Environment Variables:
#    NODE_ENV=production
#    PORT=5001
#    MONGO_URI=mongodb+srv://...
#    JWT_SECRET=...
#    JWT_REFRESH_SECRET=...
#    CLIENT_URL=https://skpro.com.tr
#    CORS_ORIGIN=https://skpro.com.tr

# 5. Custom Domain (opsiyonel):
#    - api.skpro.com.tr
```

### 3. MongoDB Atlas

```bash
# 1. MongoDB Atlas hesabı oluştur
# https://www.mongodb.com/cloud/atlas

# 2. Cluster oluştur:
#    - Provider: AWS
#    - Region: Frankfurt (eu-central-1)
#    - Tier: M0 (Free) veya M10 (Production)

# 3. Database User oluştur
# 4. Network Access: Backend IP'sini ekle
# 5. Connection string'i al
```

### 4. DNS Ayarları

**Domain sağlayıcınızda (örnek: Turhost, Natro, vs.):**

```
# A Record (Ana domain)
Type: A
Name: @
Value: Vercel IP (Vercel dashboard'dan al)

# CNAME (www)
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# CNAME (API - opsiyonel)
Type: CNAME
Name: api
Value: skproduction-api.onrender.com
```

---

## 📊 Performans Karşılaştırması

### Latency (Türkiye'den)

| Platform | Ortalama Latency |
|----------|------------------|
| Vercel (CDN) | ~50-100ms |
| Render (Frankfurt) | ~80-120ms |
| Railway (EU) | ~80-120ms |
| DigitalOcean (Frankfurt) | ~80-120ms |
| AWS (İstanbul) | ~20-50ms |

**Not:** Vercel CDN kullandığı için dünya çapında edge location'lar var.

---

## ✅ Önerilen Kombinasyon

### Başlangıç İçin (Minimum Maliyet)

```
Frontend:  Vercel (Hobby - Ücretsiz)
Backend:   Render (Starter - $7/ay)
MongoDB:   Atlas (M0 - Ücretsiz)
Domain:    skpro.com.tr (Zaten var)
─────────────────────────────────
TOPLAM:    ~₺210/ay
```

### Production İçin (Önerilen)

```
Frontend:  Vercel (Hobby - Ücretsiz) veya Pro ($20/ay)
Backend:   Render (Standard - $25/ay)
MongoDB:   Atlas (M10 - $57/ay) - Backup için
Domain:    skpro.com.tr (Zaten var)
─────────────────────────────────
TOPLAM:    ~₺2,460/ay (Hobby) veya ~₺3,060/ay (Pro)
```

---

## 🎯 Sonuç ve Öneri

### En İyi Kombinasyon

**Frontend:** Vercel (Hobby - Ücretsiz)  
**Backend:** Render (Starter - $7/ay)  
**MongoDB:** Atlas (M0 - Ücretsiz, sonra M10'a geç)

**Neden?**
- ✅ Kolay kurulum
- ✅ Otomatik SSL
- ✅ Otomatik deployment
- ✅ Uygun fiyat
- ✅ Türkiye'ye yakın
- ✅ Ölçeklenebilir

**Toplam Maliyet:** ~₺210/ay (başlangıç)

---

## 📝 Sonraki Adımlar

1. **Vercel hesabı oluştur** ve frontend'i deploy et
2. **Render hesabı oluştur** ve backend'i deploy et
3. **MongoDB Atlas** cluster oluştur
4. **DNS ayarlarını** yap
5. **Environment variables** ayarla
6. **Test et** ve production'a al

Detaylı kurulum için: **[PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)**

---

*Son Güncelleme: 2026-01-08*
