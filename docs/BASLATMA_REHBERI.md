# 🚀 SK Production - Proje Başlatma Rehberi

> **Hızlı ve Kolay Başlatma Rehberi**  
> Tüm adımları takip ederek projeyi 10 dakikada çalıştırın!

---

## 📋 İçindekiler

1. [Hızlı Başlangıç (5 Dakika)](#hızlı-başlangıç-5-dakika)
2. [Detaylı Kurulum](#detaylı-kurulum)
3. [Adım Adım Başlatma](#adım-adım-başlatma)
4. [Sorun Giderme](#sorun-giderme)
5. [Kontrol Listesi](#kontrol-listesi)

---

## ⚡ Hızlı Başlangıç (5 Dakika)

### 1. Bağımlılıkları Yükle

```bash
# Proje root dizininde
npm run install:all
```

Bu komut:
- Root dizindeki bağımlılıkları yükler
- Client bağımlılıklarını yükler
- Server bağımlılıklarını yükler

**Süre:** 2-5 dakika (internet hızına bağlı)

### 2. MongoDB Atlas Kurulumu (İlk Kez)

**MongoDB Atlas kullanıyorsanız:**

1. https://www.mongodb.com/cloud/atlas/register adresinden ücretsiz hesap oluşturun
2. Cluster oluşturun (FREE tier yeterli)
3. Database User oluşturun (username ve password kaydedin!)
4. Network Access → "Allow Access from Anywhere" (0.0.0.0/0) ekleyin
5. Connection String'i alın:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
   ```

**Local MongoDB kullanıyorsanız:**

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Connection String: mongodb://localhost:27017/skproduction
```

### 3. Environment Dosyalarını Oluştur

#### Server için:

```bash
cd server
cp .env.example .env
```

`server/.env` dosyasını düzenleyin:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=super-secret-refresh-key-change-this-in-production
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

**Önemli:** 
- `MONGO_URI` değerindeki `username` ve `password` kısımlarını kendi değerlerinizle değiştirin
- `JWT_SECRET` ve `JWT_REFRESH_SECRET` değerlerini güçlü, rastgele stringlerle değiştirin

#### Client için:

```bash
cd ../client
cp .env.example .env.local
```

`client/.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### 4. İlk Admin Kullanıcısını Oluştur

```bash
cd ../server
npm run seed
```

Bu komut varsayılan admin kullanıcısını oluşturur:
- **Email:** `admin@skproduction.com`
- **Şifre:** `admin123`

### 5. Projeyi Başlat

```bash
# Root dizine dön
cd ..

# Hem server hem client'ı birlikte başlat
npm run dev
```

**Beklenen Çıktı:**

```
[SERVER] ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
[SERVER] MongoDB veritabanına bağlandı
[SERVER] Sunucu port 5001 üzerinde çalışıyor
[CLIENT] ▲ Next.js 14.x.x
[CLIENT] - Local:        http://localhost:3000
```

### 6. Tarayıcıda Aç

- **Web Sitesi:** http://localhost:3000
- **Admin Paneli:** http://localhost:3000/admin/login
  - Email: `admin@skproduction.com`
  - Şifre: `admin123`
- **API Docs:** http://localhost:5001/api-docs

---

## 🔧 Detaylı Kurulum

### Ön Gereksinimler

- **Node.js:** v18 veya üzeri ([İndir](https://nodejs.org/))
- **npm:** v9 veya üzeri (Node.js ile birlikte gelir)
- **MongoDB:** Atlas veya Local MongoDB
- **Git:** Projeyi klonlamak için

### Sistem Gereksinimleri

- **RAM:** Minimum 4GB (önerilen: 8GB+)
- **Disk:** Minimum 2GB boş alan
- **İnternet:** MongoDB Atlas için gerekli

---

## 📝 Adım Adım Başlatma

### Adım 1: Proje Dizinine Git

```bash
cd /Users/skkaan/Desktop/yazılımsal/SKpro
```

### Adım 2: Bağımlılıkları Kontrol Et

```bash
# Node.js versiyonunu kontrol et
node --version  # v18 veya üzeri olmalı

# npm versiyonunu kontrol et
npm --version  # v9 veya üzeri olmalı
```

### Adım 3: Bağımlılıkları Yükle

```bash
# Tüm bağımlılıkları yükle (root, client, server)
npm run install:all

# VEYA manuel olarak:
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Adım 4: MongoDB Bağlantısını Ayarla

#### MongoDB Atlas Kullanıyorsanız:

1. **Connection String'i hazırlayın:**
   ```
   mongodb+srv://KULLANICI_ADI:ŞİFRE@cluster0.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
   ```

2. **Network Access ayarlarını kontrol edin:**
   - MongoDB Atlas → Network Access
   - "Allow Access from Anywhere" (0.0.0.0/0) eklenmiş olmalı

#### Local MongoDB Kullanıyorsanız:

```bash
# MongoDB'nin çalıştığını kontrol et
# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# MongoDB başlat (gerekirse)
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Adım 5: Environment Dosyalarını Oluştur

#### Server Environment:

```bash
cd server

# .env.example'dan kopyala
cp .env.example .env

# .env dosyasını düzenle
nano .env  # veya herhangi bir editör
```

**Minimum Gerekli Değişkenler:**

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skproduction?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=super-secret-refresh-key-change-this-in-production
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

#### Client Environment:

```bash
cd ../client

# .env.example'dan kopyala
cp .env.example .env.local

# .env.local dosyasını düzenle
nano .env.local  # veya herhangi bir editör
```

**Minimum Gerekli Değişkenler:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### Adım 6: İlk Admin Kullanıcısını Oluştur

```bash
cd ../server
npm run seed
```

**Beklenen Çıktı:**

```
✅ Admin kullanıcısı oluşturuldu:
   Email: admin@skproduction.com
   Şifre: admin123
```

### Adım 7: Port Kontrolü

```bash
# Root dizine dön
cd ..

# Port'ları kontrol et
npm run check-ports

# VEYA manuel kontrol
lsof -ti:5001  # Backend portu
lsof -ti:3000  # Frontend portu
```

**Port kullanılıyorsa:**

```bash
# Port'u temizle
kill -9 $(lsof -ti:5001)  # Backend
kill -9 $(lsof -ti:3000)  # Frontend
```

### Adım 8: Projeyi Başlat

#### Yöntem 1: Tek Komutla (ÖNERİLEN)

```bash
# Root dizinde
npm run dev
```

Bu komut hem backend (port 5001) hem de frontend (port 3000) sunucularını birlikte başlatır.

#### Yöntem 2: Ayrı Terminal'lerde

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

#### Yöntem 3: Script ile

```bash
./start-dev.sh
```

### Adım 9: Başarıyı Kontrol Et

#### Backend Kontrolü:

```bash
curl http://localhost:5001/api/health
```

**Beklenen Çıktı:**
```json
{"status":"ok","timestamp":"2026-01-08T...","uptime":123.45}
```

#### Frontend Kontrolü:

Tarayıcıda açın:
- **Web Sitesi:** http://localhost:3000
- **Admin Paneli:** http://localhost:3000/admin/login

#### Admin Paneline Giriş:

- **Email:** `admin@skproduction.com`
- **Şifre:** `admin123`

---

## 🐛 Sorun Giderme

### Port Zaten Kullanılıyor

```bash
# Port kontrolü
npm run check-ports

# Port'u temizle
kill -9 $(lsof -ti:5001)  # Backend
kill -9 $(lsof -ti:3000)  # Frontend
```

### MongoDB Bağlantı Hatası

**Hata:** `MongoServerError: bad auth` veya `connect ECONNREFUSED`

**Çözüm:**

1. **Connection String'i kontrol edin:**
   - Username ve password doğru mu?
   - Database adı (`skproduction`) eklendi mi?

2. **Network Access'i kontrol edin:**
   - MongoDB Atlas → Network Access
   - IP adresiniz whitelist'te mi?

3. **MongoDB'nin çalıştığını kontrol edin (local için):**
   ```bash
   # macOS
   brew services list | grep mongodb
   
   # Linux
   sudo systemctl status mongod
   ```

### Backend Başlamıyor

1. **MongoDB bağlantısını kontrol edin**
2. **Environment dosyasını kontrol edin:**
   ```bash
   cd server
   cat .env | grep MONGO_URI
   ```
3. **TypeScript hatalarını kontrol edin:**
   ```bash
   cd server
   npm run type-check
   ```

### Frontend Backend'e Bağlanamıyor

1. **Backend'in çalıştığını kontrol edin:**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Environment dosyasını kontrol edin:**
   ```bash
   cd client
   cat .env.local | grep NEXT_PUBLIC_API_URL
   ```
   Değer: `http://localhost:5001/api` olmalı

3. **Browser console'da hataları kontrol edin (F12)**

### Module Not Found Hataları

```bash
# Tüm node_modules'ları temizle ve yeniden yükle
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

---

## ✅ Kontrol Listesi

Başlatmadan önce kontrol edin:

- [ ] Node.js v18+ yüklü
- [ ] npm v9+ yüklü
- [ ] MongoDB Atlas hesabı var veya Local MongoDB çalışıyor
- [ ] `server/.env` dosyası oluşturuldu ve düzenlendi
- [ ] `client/.env.local` dosyası oluşturuldu ve düzenlendi
- [ ] MongoDB connection string doğru
- [ ] JWT secret'lar ayarlandı
- [ ] Port 5001 ve 3000 boş
- [ ] İlk admin kullanıcısı oluşturuldu (`npm run seed`)

Başlatma sırasında kontrol edin:

- [ ] Backend başarıyla başladı (port 5001)
- [ ] Frontend başarıyla başladı (port 3000)
- [ ] MongoDB bağlantısı başarılı
- [ ] http://localhost:5001/api/health çalışıyor
- [ ] http://localhost:3000 açılıyor
- [ ] Admin paneline giriş yapılabiliyor

---

## 🎯 Hızlı Komutlar

```bash
# Tüm bağımlılıkları yükle
npm run install:all

# Projeyi başlat (hem client hem server)
npm run dev

# Sadece backend
cd server && npm run dev

# Sadece frontend
cd client && npm run dev

# İlk admin kullanıcısını oluştur
cd server && npm run seed

# Port kontrolü
npm run check-ports

# Testleri çalıştır
npm run test:all

# Build (production)
npm run build
```

---

## 📞 Yardım

Sorun yaşıyorsanız:

1. Bu rehberi tekrar kontrol edin
2. Log dosyalarını kontrol edin: `server/logs/`
3. Browser console'da hataları kontrol edin (F12)
4. Port'ları kontrol edin: `npm run check-ports`

**Başarılar! 🎉**
