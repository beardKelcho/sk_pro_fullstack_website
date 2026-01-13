# 🚀 Senaryo 1 - Başlangıç Rehberi (Ücretsiz)

> **skpro.com.tr için Minimum Maliyet ile Başlangıç**  
> Senaryo 1 ile başlayın, gerektiğinde yükseltin!

---

## 📊 Senaryo 1 Detayları

### Platformlar ve Limitler

| Servis | Platform | Tier | Limitler |
|--------|----------|------|----------|
| **Frontend** | Vercel | Hobby (Ücretsiz) | ✅ 100GB bandwidth/ay<br>✅ Sınırsız deployment<br>✅ Otomatik SSL |
| **Backend** | Render | Free | ⚠️ 750 saat/ay<br>⚠️ Uyku modu (ilk istek yavaş)<br>✅ Otomatik SSL |
| **MongoDB** | Atlas | M0 (Ücretsiz) | ✅ 512MB storage<br>✅ Shared cluster<br>⚠️ Backup yok |

**Toplam Maliyet: ₺0/ay** 🎉

---

## ✅ Senaryo 1 Ne Zaman Yeterli?

### Senaryo 1 Yeterli Olur Eğer:

- ✅ **Başlangıç aşamasındasınız**
- ✅ **Günlük ziyaretçi sayısı < 1000**
- ✅ **Aylık bandwidth < 100GB**
- ✅ **Backend istek sayısı düşük**
- ✅ **Test ve geliştirme aşamasındasınız**
- ✅ **7/24 uptime kritik değil** (uyku modu kabul edilebilir)

### Senaryo 1 Yeterli OLMAZ Eğer:

- ❌ **Yüksek trafik bekleniyor**
- ❌ **7/24 kesintisiz çalışma gerekiyor**
- ❌ **İlk istek yavaşlığı kabul edilemez**
- ❌ **Database backup gerekiyor**
- ❌ **Yüksek performans gerekiyor**

---

## ⚠️ Senaryo 1 Sınırlamaları

### 1. Render Free Tier - Uyku Modu

**Sorun:**
- 15 dakika istek yoksa → Uyku modu
- İlk istek → 30-60 saniye yavaş (cold start)
- Sonraki istekler → Normal hız

**Çözüm:**
- **UptimeRobot** (ücretsiz) ile 5 dakikada bir ping at
- Veya **Senaryo 2'ye geç** ($7/ay)

### 2. Vercel Hobby - Bandwidth Limiti

**Sorun:**
- 100GB bandwidth/ay limiti
- Aşarsa → Ek ücret veya Pro plan'a geç

**Çözüm:**
- İlk aylarda genelde yeterli
- Aşarsa → Pro plan ($20/ay) veya optimize et

### 3. MongoDB M0 - Backup Yok

**Sorun:**
- Otomatik backup yok
- Manuel backup gerekir

**Çözüm:**
- Düzenli manuel backup al
- Veya M10'a geç ($57/ay) - otomatik backup

---

## 🎯 Senaryo 1 Kurulum Adımları

### 1. Frontend - Vercel (Ücretsiz)

```bash
# 1. Vercel hesabı oluştur
# https://vercel.com/signup

# 2. GitHub repository'yi bağla
# 3. Proje ayarları:
#    - Root Directory: client
#    - Build Command: npm run build
#    - Output Directory: .next
#    - Framework Preset: Next.js

# 4. Environment Variables:
NEXT_PUBLIC_API_URL=https://skproduction-api.onrender.com/api
NEXT_PUBLIC_BACKEND_URL=https://skproduction-api.onrender.com

# 5. Domain ekle:
#    - skpro.com.tr
#    - www.skpro.com.tr
```

### 2. Backend - Render (Free Tier)

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
#    - Plan: Free (ücretsiz)

# 4. Environment Variables:
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=https://skpro.com.tr
CORS_ORIGIN=https://skpro.com.tr

# 5. Uyku modunu önlemek için (opsiyonel):
#    - UptimeRobot kur (ücretsiz)
#    - 5 dakikada bir ping at
```

### 3. MongoDB Atlas (M0 Free)

```bash
# 1. MongoDB Atlas hesabı oluştur
# https://www.mongodb.com/cloud/atlas/register

# 2. Cluster oluştur:
#    - Provider: AWS
#    - Region: Frankfurt (eu-central-1)
#    - Tier: M0 (FREE)

# 3. Database User oluştur
# 4. Network Access: Backend IP'sini ekle
# 5. Connection string'i al
```

### 4. Uyku Modunu Önleme (UptimeRobot)

```bash
# 1. UptimeRobot hesabı oluştur
# https://uptimerobot.com

# 2. New Monitor oluştur:
#    - Monitor Type: HTTP(s)
#    - Friendly Name: SK Production API
#    - URL: https://skproduction-api.onrender.com/api/health
#    - Monitoring Interval: 5 minutes

# 3. Bu sayede backend sürekli aktif kalır
```

---

## 📈 Ne Zaman Senaryo 2'ye Geçilmeli?

### Senaryo 2'ye Geçme Kriterleri:

1. **Uyku modu sorun oluyor**
   - İlk istek yavaşlığı kullanıcıları etkiliyor
   - 7/24 kesintisiz çalışma gerekiyor

2. **Trafik artıyor**
   - Günlük ziyaretçi > 500
   - Backend istek sayısı artıyor

3. **Performans sorunları**
   - Response time yavaş
   - Memory limit aşılıyor

4. **Güvenilirlik gerekiyor**
   - Production'da kesinti kabul edilemez
   - SLA gereksinimleri var

### Senaryo 2'ye Geçiş:

```bash
# Render'da:
# 1. Settings → Plan → Upgrade
# 2. Starter ($7/ay) seç
# 3. Deploy et

# Artık:
# ✅ Uyku modu yok
# ✅ 7/24 aktif
# ✅ Daha iyi performans
```

---

## 📊 Senaryo Karşılaştırması

| Özellik | Senaryo 1 (Ücretsiz) | Senaryo 2 (₺210/ay) | Senaryo 3 (₺3,060/ay) |
|---------|---------------------|---------------------|----------------------|
| **Frontend** | Vercel Hobby | Vercel Hobby | Vercel Pro |
| **Backend** | Render Free | Render Starter | Render Standard |
| **MongoDB** | Atlas M0 | Atlas M0 | Atlas M10 |
| **Uyku Modu** | ⚠️ Var | ✅ Yok | ✅ Yok |
| **Backup** | ❌ Manuel | ❌ Manuel | ✅ Otomatik |
| **Bandwidth** | 100GB/ay | 100GB/ay | Sınırsız |
| **Uptime** | ~95% | ~99% | ~99.9% |
| **Performans** | Orta | İyi | Çok İyi |

---

## ✅ Senaryo 1 Başlangıç Checklist

### Kurulum

- [ ] Vercel hesabı oluşturuldu
- [ ] Render hesabı oluşturuldu
- [ ] MongoDB Atlas hesabı oluşturuldu
- [ ] Frontend deploy edildi
- [ ] Backend deploy edildi
- [ ] Domain bağlandı (skpro.com.tr)
- [ ] DNS ayarları yapıldı
- [ ] SSL aktif (otomatik)

### Yapılandırma

- [ ] Environment variables ayarlandı
- [ ] MongoDB connection string ayarlandı
- [ ] CORS ayarları yapıldı
- [ ] UptimeRobot kuruldu (uyku modu için)

### Test

- [ ] Frontend çalışıyor: https://skpro.com.tr
- [ ] Backend çalışıyor: https://skproduction-api.onrender.com/api/health
- [ ] Admin paneli erişilebilir
- [ ] API istekleri çalışıyor

---

## 🚀 Senaryo 1 ile Başlangıç

### Adım 1: Hesapları Oluştur

```bash
# 1. Vercel: https://vercel.com/signup
# 2. Render: https://render.com
# 3. MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
# 4. UptimeRobot: https://uptimerobot.com (opsiyonel)
```

### Adım 2: Deploy Et

```bash
# Frontend (Vercel)
# - GitHub repo'yu bağla
# - Root directory: client
# - Domain ekle: skpro.com.tr

# Backend (Render)
# - GitHub repo'yu bağla
# - Root directory: server
# - Plan: Free
# - Environment variables ekle
```

### Adım 3: Test Et

```bash
# Frontend
curl https://skpro.com.tr

# Backend
curl https://skproduction-api.onrender.com/api/health
```

---

## 💡 Senaryo 1 İpuçları

### 1. Uyku Modunu Önleme

**UptimeRobot kullan:**
- 5 dakikada bir ping at
- Backend sürekli aktif kalır
- Ücretsiz (50 monitor'a kadar)

**Alternatif:**
- Cron job ile düzenli ping
- Veya Senaryo 2'ye geç

### 2. Bandwidth Tasarrufu

- Görselleri optimize et
- CDN kullan (Vercel otomatik)
- Lazy loading kullan
- Cache stratejisi uygula

### 3. Database Backup

**Manuel backup:**
```bash
# MongoDB Compass ile export
# Veya mongodump ile
mongodump --uri="mongodb+srv://..." --out=./backup
```

**Düzenli backup:**
- Haftalık manuel backup al
- Veya M10'a geç (otomatik backup)

---

## 📊 Senaryo 1 → Senaryo 2 Geçiş Planı

### Ne Zaman Geçiş Yapılmalı?

**1-2 ay sonra değerlendir:**
- Trafik artışı var mı?
- Uyku modu sorun oluyor mu?
- Performans yeterli mi?
- Backup gerekiyor mu?

**Geçiş yapılacaksa:**
1. Render → Starter plan ($7/ay)
2. Test et
3. MongoDB → M10 (backup için, opsiyonel)

**Geçiş süresi:** 5-10 dakika (sadece plan değişikliği)

---

## ✅ Sonuç

### Senaryo 1 Yeterli mi?

**Evet, başlangıç için yeterli!** ✅

**Neden?**
- ✅ Ücretsiz başlangıç
- ✅ Test ve geliştirme için ideal
- ✅ Düşük trafik için yeterli
- ✅ Kolay yükseltme (5 dakika)

**Ne zaman yükseltilmeli?**
- Trafik artınca
- Uyku modu sorun olunca
- 7/24 kesintisiz çalışma gerektiğinde
- Backup gerektiğinde

---

## 🎯 Önerilen Yol Haritası

### İlk 1-2 Ay: Senaryo 1

```
✅ Senaryo 1 ile başla (ücretsiz)
✅ Test et ve geliştir
✅ Trafiği izle
✅ Kullanıcı geri bildirimlerini topla
```

### 2-3. Ay: Değerlendirme

```
📊 Trafik analizi yap
📊 Performans ölçümü
📊 Kullanıcı geri bildirimleri
📊 Maliyet analizi
```

### 3. Ay ve Sonrası: Senaryo 2'ye Geçiş

```
🚀 Senaryo 2'ye geç ($7/ay)
🚀 Daha iyi performans
🚀 7/24 kesintisiz çalışma
```

---

## 📝 Hızlı Başlangıç Komutları

```bash
# 1. Branch'leri kur
npm run setup:branches

# 2. Environment variables ayarla
cd server && cp .env.example .env
cd ../client && cp .env.example .env.local

# 3. Deploy et
# Vercel ve Render dashboard'dan deploy et

# 4. Test et
curl https://skpro.com.tr
curl https://skproduction-api.onrender.com/api/health
```

---

**Başarılar! Senaryo 1 ile başlayın, gerektiğinde yükseltin! 🚀**

*Son Güncelleme: 2026-01-08*
