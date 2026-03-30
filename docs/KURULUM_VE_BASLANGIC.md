# 🚀 SK Production - Kurulum ve Başlangıç Rehberi

> **Projeyi Sıfırdan Kurmak ve Çalıştırmak İçin Tek Rehber**  
> Bu rehber, development ortamını kurmak için gereken tüm adımları içerir.

---

## 📋 İçindekiler

1. [Ön Gereksinimler](#ön-gereksinimler)
2. [Hızlı Başlangıç (5 Dakika)](#hızlı-başlangıç-5-dakika)
3. [Detaylı Kurulum](#detaylı-kurulum)
4. [MongoDB Kurulumu](#mongodb-kurulumu)
5. [Environment Yapılandırması](#environment-yapılandırması)
6. [Projeyi Başlatma](#projeyi-başlatma)
7. [Sorun Giderme](#sorun-giderme)

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

## ⚡ Hızlı Başlangıç (5 Dakika)

### 1. Repository'yi Klonla

```bash
git clone <repository-url>
cd SKpro
```

### 2. Bağımlılıkları Yükle

```bash
npm run install:all
```

Bu komut:
- Root dizindeki bağımlılıkları yükler
- Client bağımlılıklarını yükler
- Server bağımlılıklarını yükler

**Süre:** 2-5 dakika (internet hızına bağlı)

### 3. MongoDB Atlas Kurulumu (İlk Kez)

**MongoDB Atlas kullanıyorsanız:**

1. https://www.mongodb.com/cloud/atlas/register adresinden ücretsiz hesap oluşturun
2. Cluster oluşturun (FREE tier yeterli)
3. Database User oluşturun (username ve password kaydedin!)
4. Network Access → "Allow Access from Anywhere" (0.0.0.0/0) ekleyin
5. Connection String'i alın:
   ```
   <mongodb-atlas-connection-string>
   ```

**Local MongoDB kullanıyorsanız:**

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Connection String: mongodb://localhost:27017/skproduction
```

### 4. Environment Dosyalarını Oluştur

#### Server için:

```bash
cd server
cp .env.example .env
```

`server/.env` dosyasını düzenleyin:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=<mongodb-atlas-connection-string>
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
CLIENT_URL=<your-frontend-url>
CORS_ORIGIN=<your-frontend-url>
```

**Önemli:** 
- `MONGO_URI` değerindeki `username` ve `password` kısımlarını kendi değerlerinizle değiştirin
- `JWT_SECRET` ve `JWT_REFRESH_SECRET` değerlerini güçlü, rastgele stringlerle değiştirin

**Secret Oluşturma:**
```bash
npm run generate:secrets
```

#### Client için:

```bash
cd client
cp .env.local.example .env.local
```

`client/.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_BACKEND_URL=<your-backend-url>
NEXT_PUBLIC_API_URL=<your-api-url>
NEXT_PUBLIC_SITE_URL=<your-frontend-url>
```

### 5. İlk Admin Kullanıcısını Oluştur

```bash
cd server
npm run seed
```

Bu komut varsayılan admin kullanıcısını oluşturur:
- Giriş bilgileri seed script ve environment değişkenleri ile belirlenir
- Production ortamında varsayılan değerleri kullanmayın

```bash
ADMIN_SEED_PASSWORD="<strong-admin-password>" npm run seed
```

**⚠️ Önemli:** Güçlü, tahmin edilemez bir şifre kullanın!

### 6. Projeyi Başlat

```bash
# Proje root dizininde
npm run dev
```

Bu komut hem server hem client'ı başlatır:
- **Backend**: <your-backend-url>
- **Frontend**: <your-frontend-url>

### 7. Tarayıcıda Aç

- **Web Sitesi**: <your-frontend-url>
- **Admin Paneli**: <your-frontend-url>/admin/login
- **API Docs**: <your-backend-url>/api-docs

---

## 🔧 Detaylı Kurulum

### Adım 1: Bağımlılıkları Yükle

Proje root dizininde:

```bash
npm install
```

Bu komut hem `client` hem de `server` klasörlerindeki tüm bağımlılıkları yükler.

**Not:** İlk kurulum 2-5 dakika sürebilir.

### Adım 2: MongoDB Kurulumu

#### MongoDB Atlas (Önerilen - Ücretsiz)

1. MongoDB Atlas'a kaydolun: https://www.mongodb.com/cloud/atlas/register
2. **Build a Database** → **M0 (Free)** seçin
3. Cloud Provider: **AWS**
4. Region: **Frankfurt (eu-central-1)** veya size en yakın
5. Cluster Name: `sk-production-cluster` (veya istediğiniz isim)
6. **Create** butonuna tıklayın

#### Database User Oluştur

1. **Database Access** → **Add New Database User**
2. Username: `skproduction-admin` (veya istediğiniz isim)
3. Password: **Güçlü bir şifre oluşturun** (kaydedin!)
4. Database User Privileges: **"Atlas admin"**
5. **Add User** butonuna tıklayın

#### Network Access Ayarla

1. **Network Access** → **Add IP Address**
2. Development için: **"Allow Access from Anywhere"** (0.0.0.0/0)
3. **Confirm** butonuna tıklayın

**⚠️ Güvenlik Notu:** Production'da sadece backend server'ın IP adresini ekleyin!

#### Connection String Al

1. **Database** → **Connect** butonuna tıklayın
2. **Connect your application** seçin
3. Driver: **Node.js**, Version: **5.5 or later**
4. Connection string'i kopyalayın:
   ```
   <mongodb-atlas-connection-string>
   ```
5. `<password>` kısmını kendi şifrenizle değiştirin
6. Database adını ekleyin: `...mongodb.net/skproduction?...`

#### Local MongoDB (Alternatif)

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Connection String: mongodb://localhost:27017/skproduction
```

### Adım 3: Environment Yapılandırması

#### Server Environment Variables

`server/.env` dosyasını oluşturun:

```bash
cd server
cp .env.example .env
```

Gerekli değişkenler:

```env
# Temel Ayarlar
NODE_ENV=development
PORT=5001

# MongoDB
MONGO_URI=<mongodb-atlas-connection-string>

# JWT Secrets (GÜÇLÜ, RASTGELE STRINGLER!)
JWT_SECRET=<güçlü-random-string>
JWT_REFRESH_SECRET=<güçlü-random-string>

# Client URL (CORS için)
CLIENT_URL=<your-frontend-url>
CORS_ORIGIN=<your-frontend-url>
```

**JWT Secret Oluşturma:**
```bash
npm run generate:secrets
```

#### Client Environment Variables

`client/.env.local` dosyasını oluşturun:

```bash
cd client
cp .env.local.example .env.local
```

Gerekli değişkenler:

```env
# Backend API URLs
NEXT_PUBLIC_BACKEND_URL=<your-backend-url>
NEXT_PUBLIC_API_URL=<your-api-url>
NEXT_PUBLIC_SITE_URL=<your-frontend-url>
```

### Adım 4: İlk Admin Kullanıcısını Oluştur

```bash
cd server
npm run seed
```

Bu komut:
- Varsayılan admin kullanıcısını oluşturur
- Giriş bilgileri seed script ve environment değişkenleri ile belirlenir
- Şifre `ADMIN_SEED_PASSWORD` env variable ile belirlenir (zorunlu, min 8 karakter)

**⚠️ Önemli:** Güçlü, tahmin edilemez bir şifre kullanın!

---

## 🚀 Projeyi Başlatma

### Yöntem 1: Tüm Projeyi Birlikte Başlat (Önerilen)

```bash
# Proje root dizininde
npm run dev
```

Bu komut:
- Server'ı `<your-backend-url>` adresinde başlatır
- Client'ı `<your-frontend-url>` adresinde başlatır
- Her ikisini de aynı terminal'de gösterir

### Yöntem 2: Ayrı Ayrı Başlat

**Terminal 1 - Server:**
```bash
npm run dev:server
# veya
cd server && npm run dev
```

**Terminal 2 - Client:**
```bash
npm run dev:client
# veya
cd client && npm run dev
```

### Yöntem 3: ngrok ile Başlat (Mobil Test için)

```bash
npm run dev:with-ngrok
```

Bu komut:
- Server ve client'ı başlatır
- ngrok tunnel oluşturur (mobil cihazlardan erişim için)

---

## 🔍 Sorun Giderme

### Problem: Port Zaten Kullanılıyor

**Çözüm:**
```bash
# Port durumunu kontrol et
npm run check-ports

# Port'u kullanan process'i bul ve kapat
lsof -ti:5001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### Problem: MongoDB Bağlantı Hatası

**Çözüm:**
1. MongoDB Atlas Network Access'te IP'nizin eklendiğini kontrol edin
2. Connection string'in doğru olduğunu kontrol edin
3. Database user'ın doğru yetkilere sahip olduğunu kontrol edin
4. MongoDB servisinin çalıştığını kontrol edin (local MongoDB için)

### Problem: Environment Variables Bulunamadı

**Çözüm:**
1. `.env` dosyalarının doğru konumda olduğunu kontrol edin
2. Dosya isimlerinin doğru olduğunu kontrol edin (`server/.env`, `client/.env.local`)
3. Gerekli environment variable'ların tanımlı olduğunu kontrol edin

### Problem: Build Hatası

**Çözüm:**
```bash
# Dependencies'leri temizle ve yeniden yükle
rm -rf node_modules client/node_modules server/node_modules
npm run install:all

# Build'i tekrar dene
npm run build
```

### Problem: Test Çalışmıyor

**Çözüm:**
```bash
# Test environment'ını kontrol et
cd client && npm test
cd ../server && npm test

# Coverage raporunu kontrol et
npm run test:coverage
```

---

## 📚 Sonraki Adımlar

Kurulum tamamlandıktan sonra:

1. **[Production Deployment Rehberi](./PRODUCTION_DEPLOYMENT.md)** - Production'a alma
2. **[Güvenlik Rehberi](./GUVENLIK.md)** - Production güvenlik checklist'i
3. **[Dokümantasyon İndeksi](./README.md)** - Güncel rehber listesi

---

**Başarılar! 🚀**

*Son Güncelleme: 2026-01-08*
