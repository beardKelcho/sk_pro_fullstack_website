# SK Production - Proje Kurulum Rehberi

Bu rehber, SK Production projesini yerel geliştirme ortamında çalıştırmak için gerekli adımları içerir.

## 📋 Gereksinimler

- **Node.js**: v18 veya üzeri
- **npm**: v9 veya üzeri (veya yarn)
- **MongoDB**: Yerel MongoDB veya MongoDB Atlas hesabı

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükle

Proje root dizininde:

```bash
npm install
```

Bu komut hem `client` hem de `server` klasörlerindeki bağımlılıkları yükler.

### 2. Environment Variables Yapılandır

#### Server için:

```bash
cd server
cp .env.example .env
```

`server/.env` dosyasını düzenleyin:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/skproduction
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
CLIENT_URL=http://localhost:3000
```

#### Client için:

```bash
cd ../client
cp .env.example .env.local
```

`client/.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
MONGODB_URI=mongodb://localhost:27017/skproduction
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. MongoDB'yi Başlat

#### Yerel MongoDB kullanıyorsanız:

```bash
# macOS (Homebrew ile kuruluysa)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### MongoDB Atlas kullanıyorsanız:

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı oluşturun
2. Cluster oluşturun
3. Connection string'i alın
4. `MONGO_URI` değişkenine MongoDB Atlas connection string'ini ekleyin:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skproduction?retryWrites=true&w=majority
   ```

### 4. Projeyi Çalıştır

#### Tüm projeyi birlikte çalıştırma (Önerilen):

Proje root dizininde:

```bash
npm run dev
```

Bu komut hem frontend (port 3000) hem de backend (port 5000) sunucularını başlatır.

#### Ayrı ayrı çalıştırma:

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

### 5. Projeyi Tarayıcıda Aç

- **Web Sitesi**: http://localhost:3000
- **Admin Paneli**: http://localhost:3000/admin/login
- **API**: http://localhost:5000/api

## 🔧 Geliştirme Komutları

### Root Dizini

```bash
# Tüm projeyi geliştirme modunda çalıştır
npm run dev

# Tüm projeyi build et
npm run build

# Testleri çalıştır
npm run test

# Linting yap
npm run lint
```

### Client (Frontend)

```bash
cd client

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Production sunucusunu başlat
npm run start

# TypeScript type checking
npm run type-check

# Testler
npm run test

# E2E testler (Cypress)
npm run cypress:open
```

### Server (Backend)

```bash
cd server

# Geliştirme sunucusunu başlat (nodemon ile)
npm run dev

# Production build
npm run build

# Production sunucusunu başlat
npm run start

# TypeScript type checking
npm run type-check

# Testler
npm run test
```

## 🗄️ Veritabanı İşlemleri

### İlk Kullanıcı Oluşturma

Backend API'yi kullanarak ilk admin kullanıcısını oluşturabilirsiniz. Şu an için manuel olarak MongoDB'ye eklemeniz gerekebilir.

## 🐛 Sorun Giderme

### Port Zaten Kullanılıyor

Eğer port 3000 veya 5000 zaten kullanılıyorsa:

**Frontend portunu değiştirmek için:**
```bash
cd client
PORT=3001 npm run dev
```

**Backend portunu değiştirmek için:**
```bash
cd server
PORT=5001 npm run dev
```

Ve `client/.env.local` dosyasında `NEXT_PUBLIC_API_URL` değerini güncelleyin.

### MongoDB Bağlantı Hatası

1. MongoDB'nin çalıştığından emin olun
2. `MONGO_URI` değerinin doğru olduğunu kontrol edin
3. MongoDB Atlas kullanıyorsanız, IP whitelist'inize localhost'u eklediğinizden emin olun

### Module Not Found Hataları

```bash
# Root dizinde
rm -rf node_modules client/node_modules server/node_modules
npm install
```

## 📝 Notlar

- `.env` dosyaları git'e commit edilmez (`.gitignore`'da)
- Geliştirme için `.env.example` dosyalarını kopyalayıp `.env` veya `.env.local` olarak kullanın
- Production için environment variables'ları deployment platformunda (Vercel, Render vb.) ayarlayın

## 🔗 Faydalı Linkler

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Express.js Dokümantasyonu](https://expressjs.com/)
- [MongoDB Dokümantasyonu](https://docs.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

