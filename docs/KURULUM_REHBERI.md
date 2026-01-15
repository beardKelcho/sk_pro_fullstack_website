# 📚 SK Production - Kapsamlı Kurulum ve Kullanım Rehberi

> **Son Güncelleme**: 2026-01-08  
> **Versiyon**: 2.0.0

Bu rehber, SK Production projesini sıfırdan kurmak, çalıştırmak ve yönetmek için gereken tüm bilgileri içerir.

---

## 📋 İçindekiler

1. [Ön Gereksinimler](#ön-gereksinimler)
2. [Hızlı Başlangıç](#hızlı-başlangıç)
3. [Detaylı Kurulum](#detaylı-kurulum)
4. [MongoDB Kurulumu](#mongodb-kurulumu)
5. [Environment Yapılandırması](#environment-yapılandırması)
6. [Projeyi Başlatma](#projeyi-başlatma)
7. [Sorun Giderme](#sorun-giderme)
8. [Deployment](#deployment)
9. [Port Standartları](#port-standartları)

---

## 🎯 Ön Gereksinimler

### Gerekli Yazılımlar

- **Node.js**: v18 veya üzeri ([İndir](https://nodejs.org/))
- **npm**: v9 veya üzeri (Node.js ile birlikte gelir)
- **MongoDB**: Yerel MongoDB veya MongoDB Atlas hesabı
- **Git**: Projeyi klonlamak için

### Sistem Gereksinimleri

- **RAM**: Minimum 4GB (önerilen: 8GB+)
- **Disk**: Minimum 2GB boş alan
- **İnternet**: MongoDB Atlas için gerekli

---

## ⚡ Hızlı Başlangıç

### 5 Dakikada Kurulum

```bash
# 1. Repository'yi klonla
git clone <repository-url>
cd SKpro

# 2. Bağımlılıkları yükle
npm install

# 3. MongoDB Atlas kurulumu yap (aşağıdaki bölüme bak)

# 4. Environment dosyalarını oluştur
# server/.env ve client/.env.local (aşağıdaki bölüme bak)

# 5. İlk admin kullanıcısını oluştur
cd server && npm run seed && cd ..

# 6. Projeyi başlat
npm run dev

# 7. Tarayıcıda aç
# http://localhost:3000 (Web Sitesi)
# http://localhost:3000/admin/login (Admin Paneli)
# Email: admin@skproduction.com
# Şifre: admin123
```

---

## 🔧 Detaylı Kurulum

### Adım 1: Bağımlılıkları Yükle

Proje root dizininde (SKpro klasöründe):

```bash
npm install
```

Bu komut hem `client` hem de `server` klasörlerindeki tüm bağımlılıkları yükler.

**Not:** İlk kurulum 2-5 dakika sürebilir.

### Adım 2: MongoDB Kurulumu

#### Seçenek A: MongoDB Atlas (ÖNERİLEN - 5 dakika)

1. **MongoDB Atlas Hesabı Oluştur**
   - https://www.mongodb.com/cloud/atlas/register
   - Email ile ücretsiz kayıt ol

2. **Cluster Oluştur**
   - "Build a Database" → "FREE" seç
   - Cloud Provider: AWS
   - Region: Frankfurt (eu-central-1) - Türkiye'ye en yakın
   - Cluster Name: `sk-production-cluster`
   - "Create" butonuna tıkla

3. **Database User Oluştur**
   - "Database Access" → "Add New Database User"
   - Username: `skproduction-admin`
   - Password: Güçlü bir şifre (kaydedin!)
   - Database User Privileges: "Atlas admin"
   - "Add User" butonuna tıkla

4. **Network Access Ayarla**
   - "Network Access" → "Add IP Address"
   - **Development için**: "Allow Access from Anywhere" (0.0.0.0/0)
   - **Production için**: "Add Current IP Address" (daha güvenli)
   - "Confirm" butonuna tıkla

5. **Connection String Al**
   - "Database" → "Connect" butonuna tıkla
   - "Connect your application" seç
   - Connection string'i kopyala:
     ```
     mongodb+srv://skproduction-admin:<password>@sk-production-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - `<password>` kısmını kendi şifrenizle değiştirin
   - Database adını ekleyin: `...mongodb.net/skproduction?...`

#### Seçenek B: Local MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
net start MongoDB
```

**Local MongoDB Connection String:**
```
mongodb://localhost:27017/skproduction
```

### Adım 3: Environment Dosyalarını Oluştur

#### Server için:

```bash
cd server
```

Eğer `.env.example` dosyası varsa:
```bash
cp .env.example .env
```

Yoksa, `server/.env` dosyasını oluşturun:

```env
# Server Port (STANDART: 5001)
PORT=5001

# Environment
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://skproduction-admin:ŞİFRENİZ@sk-production-cluster.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
# VEYA local MongoDB için:
# MONGO_URI=mongodb://localhost:27017/skproduction

# JWT Secrets (Güçlü, rastgele stringler kullanın!)
JWT_SECRET=super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=super-secret-refresh-key-change-this-in-production

# Client URL
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Email (Opsiyonel - Nodemailer için)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# VAPID Keys (Push Notifications için - Opsiyonel)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:info@skproduction.com

# Redis (Opsiyonel - Cache için)
REDIS_URL=redis://localhost:6379
```

**Önemli:** 
- MongoDB Atlas kullanıyorsanız, connection string'deki `<password>` kısmını kendi şifrenizle değiştirin
- `JWT_SECRET` ve `JWT_REFRESH_SECRET` değerlerini güçlü, rastgele stringlerle değiştirin
- Production'da mutlaka farklı secret'lar kullanın

#### Client için:

```bash
cd ../client
```

Eğer `.env.example` dosyası varsa:
```bash
cp .env.example .env.local
```

Yoksa, `client/.env.local` dosyasını oluşturun:

```env
# Backend API URL (STANDART: port 5001)
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# NextAuth (Opsiyonel)
NEXTAUTH_SECRET=super-secret-nextauth-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Google Analytics (Opsiyonel)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# VAPID Public Key (Push Notifications için - Opsiyonel)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
```

**Önemli:** 
- `NEXT_PUBLIC_API_URL` değeri, backend'in çalıştığı port ile eşleşmeli (varsayılan: 5001)
- `NEXTAUTH_SECRET` değerini güçlü, rastgele bir stringle değiştirin

### Adım 4: İlk Admin Kullanıcısını Oluştur

Backend klasöründe:

```bash
cd ../server
npm run seed
```

Bu komut, varsayılan admin kullanıcısını oluşturur:
- **Email:** `admin@skproduction.com`
- **Şifre:** `admin123`

**Güvenlik Notu:** Production'da mutlaka şifreyi değiştirin!

---

## 🚀 Projeyi Başlatma

### Yöntem 1: Tek Komutla (ÖNERİLEN)

Proje root dizininde (SKpro klasöründe):

```bash
npm run dev
```

Bu komut hem backend (port 5001) hem de frontend (port 3000) sunucularını birlikte başlatır.

### Yöntem 2: Ayrı Terminal'lerde

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Backend başarıyla başladığında şu mesajları göreceksiniz:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
MongoDB veritabanına bağlandı
Sunucu port 5001 üzerinde çalışıyor
Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Frontend başarıyla başladığında şu mesajı göreceksiniz:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

### Yöntem 3: Script ile

```bash
./start-dev.sh
```

---

## ✅ Projeyi Kontrol Etme

### Backend Kontrolü

Tarayıcıda veya terminal'de:
```bash
curl http://localhost:5001/api/health
```

**Beklenen çıktı:**
```json
{"status":"ok","timestamp":"2026-01-08T...","uptime":123.45}
```

### Frontend Kontrolü

Tarayıcıda açın:
- **Web Sitesi:** http://localhost:3000
- **Admin Paneli:** http://localhost:3000/admin/login

### API Dokümantasyonu

Swagger UI:
- http://localhost:5001/api-docs

### Admin Paneline Giriş

- **Email:** `admin@skproduction.com`
- **Şifre:** `admin123`

---

## 🐛 Sorun Giderme

### Port Zaten Kullanılıyor

**Backend portu (5001) kullanılıyorsa:**
```bash
# Port'u kullanan process'i bul
lsof -ti:5001

# Process'i sonlandır
kill -9 $(lsof -ti:5001)
```

**Frontend portu (3000) kullanılıyorsa:**
```bash
# Port'u kullanan process'i bul
lsof -ti:3000

# Process'i sonlandır
kill -9 $(lsof -ti:3000)
```

**Tüm portları temizle:**
```bash
# Port kontrol script'i
npm run check-ports
```

### MongoDB Bağlantı Hatası

**Hata:** `connect ECONNREFUSED ::1:27017` veya `MongoServerError: bad auth`

**Çözüm:**

1. **MongoDB Atlas kullanıyorsanız:**
   - Connection string'in doğru olduğunu kontrol edin
   - IP whitelist'e `0.0.0.0/0` eklediğinizden emin olun (development için)
   - Şifrenin doğru olduğunu kontrol edin
   - Database user'ın "Atlas admin" yetkisine sahip olduğunu kontrol edin

2. **Local MongoDB kullanıyorsanız:**
   - MongoDB'nin çalıştığını kontrol edin:
     ```bash
     # macOS
     brew services list | grep mongodb
     
     # Linux
     sudo systemctl status mongod
     ```
   - MongoDB'yi başlatın:
     ```bash
     # macOS
     brew services start mongodb-community
     
     # Linux
     sudo systemctl start mongod
     ```

### Backend Başlamıyor

1. MongoDB bağlantısını kontrol edin
2. `server/.env` dosyasının doğru yapılandırıldığını kontrol edin
3. Log dosyalarını kontrol edin: `server/logs/error.log`
4. TypeScript hatalarını kontrol edin:
   ```bash
   cd server
   npm run type-check
   ```

### Frontend Backend'e Bağlanamıyor

1. Backend'in çalıştığını kontrol edin: `curl http://localhost:5001/api/health`
2. `client/.env.local` dosyasındaki `NEXT_PUBLIC_API_URL` değerinin doğru olduğunu kontrol edin
3. Browser console'da hataları kontrol edin (F12)
4. CORS ayarlarını kontrol edin (backend'de)

### Module Not Found Hataları

```bash
# Root dizinde
rm -rf node_modules client/node_modules server/node_modules
npm install
```

---

## 🚢 Deployment

### Frontend - Vercel

1. Vercel hesabınıza giriş yapın
2. Yeni proje oluşturun
3. GitHub repository'nizi bağlayın
4. Root directory olarak `client` klasörünü seçin
5. Build Command: `npm run build`
6. Output Directory: `.next`
7. Environment variables'ları ekleyin:
   - `NEXT_PUBLIC_API_URL=https://your-api-domain.com/api`
   - `NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com`
8. Deploy edin

### Backend - Render / Heroku

#### Render Deployment

1. Render hesabınıza giriş yapın
2. Yeni Web Service oluşturun
3. GitHub repository'nizi bağlayın
4. Root directory olarak `server` klasörünü seçin
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Environment variables'ları ekleyin:
   - `PORT=5001`
   - `NODE_ENV=production`
   - `MONGO_URI=mongodb+srv://...`
   - `JWT_SECRET=...`
   - `CLIENT_URL=https://your-frontend-domain.com`
8. Deploy edin

#### Heroku Deployment

```bash
cd server
heroku create skproduction-api
heroku config:set NODE_ENV=production
heroku config:set PORT=5001
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set CLIENT_URL=https://your-frontend-domain.com
git push heroku main
```

### MongoDB Atlas (Production)

1. MongoDB Atlas'ta cluster oluşturun
2. Database User oluşturun
3. Network Access ayarlarını yapın (sadece server IP'si - güvenlik için)
4. Connection string'i alın ve environment variable olarak ekleyin
5. Backup ayarlarını yapın (M10+ tier için otomatik)

### Production Checklist

- [ ] Tüm environment variables production değerleriyle ayarlandı
- [ ] JWT secret'lar güçlü ve benzersiz
- [ ] MongoDB connection string güvenli
- [ ] CORS ayarları production URL'leriyle güncellendi
- [ ] HTTPS aktif
- [ ] Rate limiting aktif
- [ ] Helmet security headers aktif
- [ ] Admin şifresi değiştirildi
- [ ] Backup stratejisi oluşturuldu

---

## 🔌 Port Standartları

Projede **standart portlar** kullanılmaktadır:

- **Backend (Server)**: `5001` (STANDART)
- **Frontend (Client)**: `3000` (Next.js default)
- **MongoDB (Local)**: `27017` (MongoDB default)

### Port Kontrolü

```bash
# Port durumunu kontrol et
npm run check-ports

# Veya manuel
lsof -ti:5001  # Backend portu
lsof -ti:3000  # Frontend portu
```

### Port Değiştirme

**Backend portunu değiştirmek için:**
1. `server/.env` dosyasında `PORT=5001` değerini değiştirin
2. `client/.env.local` dosyasında `NEXT_PUBLIC_API_URL` değerini güncelleyin

**Frontend portunu değiştirmek için:**
```bash
cd client
PORT=3001 npm run dev
```

---

## 📝 Önemli Notlar

1. **Backend her zaman frontend'den önce başlatılmalı**
2. **MongoDB bağlantısı olmadan backend çalışmaz**
3. **`.env` dosyaları Git'e commit edilmez** (güvenlik için)
4. **Production'da mutlaka şifreleri değiştirin**
5. **JWT secret'ları güçlü, rastgele stringler olmalı**
6. **Development'ta MongoDB Atlas IP whitelist'e `0.0.0.0/0` eklenebilir, production'da sadece server IP'si eklenmeli**

---

## 🎯 Hızlı Komutlar

```bash
# Tüm bağımlılıkları yükle
npm install

# Projeyi başlat (hem client hem server)
npm run dev

# Sadece backend
cd server && npm run dev

# Sadece frontend
cd client && npm run dev

# Testleri çalıştır
npm run test:all

# Lint kontrolü
npm run lint

# Type check
npm run type-check

# Build (production)
npm run build

# Port kontrolü
npm run check-ports
```

---

## 📞 Yardım ve Destek

Sorun yaşıyorsanız:

1. Bu rehberi tekrar kontrol edin
2. Log dosyalarını kontrol edin: `server/logs/`
3. Browser console'da hataları kontrol edin (F12)
4. GitHub Issues'da benzer sorunları arayın

**Başarılar! 🎉**

